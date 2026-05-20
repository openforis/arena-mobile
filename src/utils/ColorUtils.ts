const rgbOrRgbaRegExp = /^rgba?\(([^)]+)\)$/i;

const withOpacity = (color: string, opacity: number) => {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const normalizedHex =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex;

    if (normalizedHex.length >= 6) {
      const alphaHex = Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0");
      return `#${normalizedHex.slice(0, 6)}${alphaHex}`;
    }
  }

  const rgbMatch = rgbOrRgbaRegExp.exec(color);
  const rgbValues = rgbMatch?.[1];
  if (rgbValues) {
    const [red, green, blue] = rgbValues
      .split(",")
      .map((value) => value.trim());
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }

  return color;
};

export const ColorUtils = {
  withOpacity,
};
