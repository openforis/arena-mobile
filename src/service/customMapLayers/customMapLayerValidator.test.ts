import { CustomMapLayer } from "model/MapLayers";

import { CustomMapLayerValidator } from "./customMapLayerValidator";

const { errorKeys, validate, isValid } = CustomMapLayerValidator;

const validUrl = "https://tiles.example.org/{z}/{x}/{y}.png";
const validUrlWithKey = `${validUrl}?key={apiKey}`;

const createLayer = (
  id: string,
  name: string,
  urlTemplate = validUrl,
): CustomMapLayer => ({ id, name, urlTemplate, maxZoom: 19 });

const layers = [createLayer("1", "Layer A"), createLayer("2", "Layer B")];

describe("CustomMapLayerValidator", () => {
  it("accepts a valid layer without API key", () => {
    const validation = validate({
      layer: createLayer("3", "Layer C"),
      apiKey: "",
      layers,
    });
    expect(validation).toEqual({});
    expect(isValid(validation)).toBe(true);
  });

  it("accepts a valid layer with API key", () => {
    const layer = createLayer("3", "Layer C", validUrlWithKey);
    expect(validate({ layer, apiKey: "abc", layers })).toEqual({});
  });

  it("requires a non blank name", () => {
    const layer = createLayer("3", "  ");
    expect(validate({ layer, apiKey: "", layers }).name).toBe(
      errorKeys.nameRequired,
    );
  });

  it("detects names already in use, ignoring case and spaces", () => {
    const layer = createLayer("3", " layer a ");
    expect(validate({ layer, apiKey: "", layers }).name).toBe(
      errorKeys.nameDuplicate,
    );
  });

  it("does not compare the layer being edited with itself", () => {
    const layer = createLayer("1", "Layer A");
    expect(validate({ layer, apiKey: "", layers })).toEqual({});
  });

  it("validates the url template", () => {
    const validateUrl = (urlTemplate: string) =>
      validate({
        layer: createLayer("3", "C", urlTemplate),
        apiKey: "",
        layers,
      }).urlTemplate;

    expect(validateUrl(" ")).toBe(errorKeys.urlRequired);
    expect(validateUrl("http://tiles.example.org/{z}/{x}/{y}.png")).toBe(
      errorKeys.urlNotHttps,
    );
    expect(validateUrl("https://tiles.example.org/{z}/{x}.png")).toBe(
      errorKeys.urlPlaceholdersMissing,
    );
    expect(validateUrl("https://{s}.example.org/{z}/{x}/{y}.png")).toBe(
      errorKeys.urlSubdomainNotSupported,
    );
  });

  it("requires the API key when the url has the placeholder", () => {
    const layer = createLayer("3", "Layer C", validUrlWithKey);
    expect(validate({ layer, apiKey: " ", layers }).apiKey).toBe(
      errorKeys.apiKeyRequired,
    );
  });

  it("requires the placeholder in the url when the API key is specified", () => {
    const layer = createLayer("3", "Layer C");
    expect(validate({ layer, apiKey: "abc", layers }).apiKey).toBe(
      errorKeys.apiKeyPlaceholderMissing,
    );
  });
});
