import { CustomMapLayer, MapLayerId, MapLayers } from "./MapLayers";

const customLayer: CustomMapLayer = {
  id: "custom_1",
  name: "My layer",
  urlTemplate: "https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}",
  maxZoom: 18,
};

describe("MapLayers", () => {
  afterEach(() => {
    MapLayers.setCustomLayers([]);
  });

  it("applies the API key to the url template", () => {
    expect(MapLayers.applyApiKey(customLayer.urlTemplate, " a b ")).toBe(
      "https://tiles.example.org/{z}/{x}/{y}.png?key=a%20b",
    );
  });

  it("converts a custom layer into a layer", () => {
    const layer = MapLayers.customLayerToLayer(customLayer, "abc");
    expect(layer.id).toBe(customLayer.id);
    expect(layer.name).toBe(customLayer.name);
    expect(layer.urlTemplate).toBe(
      "https://tiles.example.org/{z}/{x}/{y}.png?key=abc",
    );
    expect(layer.maxZoom).toBe(18);
    expect(layer.prefetchAllowed).toBe(true);
    expect(MapLayers.isCustomLayer(layer)).toBe(true);
  });

  it("returns built-in and custom layers", () => {
    const builtInCount = MapLayers.getLayers().length;
    MapLayers.setCustomLayers([MapLayers.customLayerToLayer(customLayer)]);
    expect(MapLayers.getLayers()).toHaveLength(builtInCount + 1);
    expect(MapLayers.getLayer(customLayer.id).name).toBe(customLayer.name);
  });

  it("includes custom layers in the prefetchable layers", () => {
    MapLayers.setCustomLayers([MapLayers.customLayerToLayer(customLayer)]);
    const layerIds = MapLayers.getPrefetchableLayers().map((l) => l.id);
    expect(layerIds).toContain(customLayer.id);
    expect(layerIds).not.toContain(MapLayerId.openStreetMap);
  });

  it("falls back to the default layer when the layer does not exist", () => {
    expect(MapLayers.getLayer(customLayer.id).id).toBe(
      MapLayers.defaultLayerId,
    );
    expect(MapLayers.getLayer(null).id).toBe(MapLayerId.esriWorldImagery);
  });

  it("uses the name of custom layers as label", () => {
    const t = (key: string) => `translated ${key}`;
    expect(
      MapLayers.getLayerLabel(MapLayers.customLayerToLayer(customLayer), t),
    ).toBe(customLayer.name);
    expect(MapLayers.getLayerLabel(MapLayers.getLayer(null), t)).toBe(
      "translated offlineMaps:layers.esriWorldImagery",
    );
  });
});
