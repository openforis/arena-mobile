import { ImageUtils } from "./ImageUtils";

// Simulated source image and a compressed-size model where file size scales
// with scale^SIZE_EXPONENT. SIZE_EXPONENT=2 mirrors the algorithm's own
// working assumption (JPEG size roughly proportional to pixel count for a
// fixed compression quality), so this is not a scenario cherry-picked in the
// change's favor.
const SOURCE_WIDTH = 4000;
const SOURCE_HEIGHT = 3000;
const SOURCE_SIZE = 5_000_000;
const SIZE_EXPONENT = 2;
const MAX_SIZE = 1_000_000; // 5x oversized

const simulatedSize = (scale: number, exponent = SIZE_EXPONENT) =>
  Math.round(SOURCE_SIZE * scale ** exponent);

// `mock`-prefixed names are exempt from jest's out-of-scope-variable check
// for jest.mock() factories, which are hoisted above these declarations.
let mockRenderCallCount = 0;
let mockUriCounter = 0;
const mockFileSizeByUri: Record<string, number> = {
  "file://source.jpg": SOURCE_SIZE,
};

jest.mock("react-native", () => ({
  Image: {
    getSize: (
      _uri: string,
      onSuccess: (width: number, height: number) => void,
    ) => onSuccess(SOURCE_WIDTH, SOURCE_HEIGHT),
  },
}));

jest.mock("expo-image-manipulator", () => ({
  ImageManipulator: {
    manipulate: () => {
      let targetWidth = SOURCE_WIDTH;
      return {
        resize: ({ width }: { width: number }) => {
          targetWidth = width;
        },
        renderAsync: async () => ({
          width: targetWidth,
          height: Math.round((targetWidth * SOURCE_HEIGHT) / SOURCE_WIDTH),
          saveAsync: async () => {
            mockRenderCallCount += 1;
            const scale = targetWidth / SOURCE_WIDTH;
            mockUriCounter += 1;
            const uri = `file://resized-${mockUriCounter}.jpg`;
            mockFileSizeByUri[uri] = simulatedSize(scale);
            return {
              uri,
              width: targetWidth,
              height: Math.round((targetWidth * SOURCE_HEIGHT) / SOURCE_WIDTH),
            };
          },
        }),
      };
    },
  },
}));

jest.mock("./Files", () => ({
  Files: {
    getSize: async (uri: string) => mockFileSizeByUri[uri] ?? 0,
    del: async () => {},
  },
}));

jest.mock("./ExifUtils", () => ({
  ExifUtils: { copyData: async () => {} },
}));

beforeEach(() => {
  mockRenderCallCount = 0;
  mockUriCounter = 0;
});

describe("ImageUtils.resizeToFitMaxSize", () => {
  it("resizes to within the acceptable size range in only a couple of attempts", async () => {
    const result = await ImageUtils.resizeToFitMaxSize({
      fileUri: "file://source.jpg",
      maxSize: MAX_SIZE,
    });

    expect(result).not.toBeNull();
    expect(result && "error" in result).toBe(false);
    const { size } = result as { size: number };
    expect(size).toBeLessThanOrEqual(MAX_SIZE);
    expect(size / MAX_SIZE).toBeGreaterThanOrEqual(0.95);

    // Each attempt is a full resize + encode + disk write + stat in
    // production, so the attempt count is a direct proxy for wall-clock
    // cost. With a compressed-size model matching the algorithm's own
    // assumption, it should nail the target almost immediately.
    expect(mockRenderCallCount).toBeLessThanOrEqual(2);
  });
});

// The stepping strategy (calculateNextScale) is what changed: it used to
// nudge the scale by a fixed +/-25% regardless of how far off the measured
// size ratio was. It's now a size ~ scale^2 model guess, safeguarded by
// bisection: the guess is only used while it stays inside a bracket of
// known-safe/known-oversized scales and isn't repeatedly correcting from the
// same side (a stall); otherwise it falls back to the bracket midpoint. This
// mirrors src/utils/ImageUtils.ts's bracket/streak bookkeeping exactly, so
// it can be exercised as pure math across many scenarios instead of driving
// the real resize/encode/stat pipeline for each one.
//
// Real compressed image sizes don't follow an exact power law, so rather
// than asserting the new strategy wins every single scenario, this checks
// behavior across a spread of plausible size/scale relationships - including
// ones far from quadratic, where a pure (unsafeguarded) model guess can
// stall approaching the acceptance band from one side.
describe("resize scale convergence speed", () => {
  const minAcceptable = 0.95;
  const maxAcceptable = 1.0;

  const sizeRatioForScale = (
    scale: number,
    initialSizeRatio: number,
    exponent: number,
  ) => simulatedSize(scale, exponent) / (SOURCE_SIZE / initialSizeRatio);

  // previous behavior: fixed +/-25% correction regardless of how far off
  // the measured size ratio actually is
  const countAttemptsLegacy = ({
    initialSizeRatio,
    exponent,
    maxAttempts = 30,
  }: {
    initialSizeRatio: number;
    exponent: number;
    maxAttempts?: number;
  }): number => {
    let scale = 1 / Math.sqrt(initialSizeRatio);
    let sizeRatio = sizeRatioForScale(scale, initialSizeRatio, exponent);
    let attempts = 1;

    while (
      !(sizeRatio >= minAcceptable && sizeRatio <= maxAcceptable) &&
      attempts < maxAttempts
    ) {
      scale = Math.min(1, scale * (sizeRatio > 1 ? 0.75 : 1.25));
      sizeRatio = sizeRatioForScale(scale, initialSizeRatio, exponent);
      attempts += 1;
    }
    return attempts;
  };

  // current behavior: size ~ scale^2 model guess, safeguarded by bisection
  const countAttemptsBisection = ({
    initialSizeRatio,
    exponent,
    maxAttempts = 30,
  }: {
    initialSizeRatio: number;
    exponent: number;
    maxAttempts?: number;
  }): number => {
    let loScale = 0;
    let hiScale = 1;
    let lastNarrowedSide: "lo" | "hi" | null = null;
    let sameSideStreak = 0;

    let scale = 1 / Math.sqrt(initialSizeRatio);
    let sizeRatio = sizeRatioForScale(scale, initialSizeRatio, exponent);
    let attempts = 1;

    while (
      !(sizeRatio >= minAcceptable && sizeRatio <= maxAcceptable) &&
      attempts < maxAttempts
    ) {
      const narrowedSide = sizeRatio > 1 ? "hi" : "lo";
      sameSideStreak =
        narrowedSide === lastNarrowedSide ? sameSideStreak + 1 : 0;
      lastNarrowedSide = narrowedSide;
      if (narrowedSide === "hi") {
        hiScale = scale;
      } else {
        loScale = scale;
      }

      const modelScale = scale / Math.sqrt(sizeRatio);
      const withinBracket = modelScale > loScale && modelScale < hiScale;
      scale =
        withinBracket && sameSideStreak < 1
          ? modelScale
          : (loScale + hiScale) / 2;

      sizeRatio = sizeRatioForScale(scale, initialSizeRatio, exponent);
      attempts += 1;
    }
    return attempts;
  };

  // A spread of oversize ratios and size~scale^exponent relationships,
  // covering roughly-quadratic content (the common case for photographic
  // JPEGs) as well as content whose size shrinks much more slowly than
  // quadratically when downsized - the case that used to make a pure
  // model-based guess stall.
  const oversizeRatios = [2, 3, 4, 5, 8, 10, 15, 20, 30];
  const sizeScaleExponents = [1.3, 1.5, 1.7, 1.9, 2.0, 2.1, 2.3, 2.5, 2.8];

  const scenarios = oversizeRatios.flatMap((initialSizeRatio) =>
    sizeScaleExponents.map((exponent) => ({ initialSizeRatio, exponent })),
  );

  it("needs fewer resize attempts on average than the previous fixed-step approach", () => {
    const average = (values: number[]) =>
      values.reduce((sum, value) => sum + value, 0) / values.length;

    const legacyAverage = average(scenarios.map(countAttemptsLegacy));
    const bisectionAverage = average(scenarios.map(countAttemptsBisection));

    // observed on this scenario grid: ~10.2 legacy vs ~4.4 bisection
    // attempts on average; assert a comfortable margin rather than the
    // exact figures
    expect(bisectionAverage).toBeLessThan(legacyAverage * 0.6);
  });

  it("bounds the worst case, unlike the previous fixed-step approach", () => {
    // the previous fixed-step approach can spike badly for atypical
    // compression behavior (up to the 30-attempt cap on this scenario grid);
    // bisection's guaranteed bracket-halving keeps the worst case bounded
    const maxBisectionAttempts = Math.max(
      ...scenarios.map(countAttemptsBisection),
    );
    expect(maxBisectionAttempts).toBeLessThanOrEqual(10);
  });

  it("converges in very few attempts when size scales roughly with scale^2", () => {
    // the common case for photographic JPEGs, and the algorithm's own
    // working assumption
    for (const initialSizeRatio of oversizeRatios) {
      const attempts = countAttemptsBisection({
        initialSizeRatio,
        exponent: 2,
      });
      expect(attempts).toBeLessThanOrEqual(2);
    }
  });
});
