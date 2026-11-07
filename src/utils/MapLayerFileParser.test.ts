import { MapLayerFileParser } from "./MapLayerFileParser";

const ring = (x: number, y: number) => [
  [x, y],
  [x + 1, y],
  [x + 1, y + 1],
  [x, y],
];

const toLatLngs = (positions: number[][]) =>
  positions.map(([longitude, latitude]) => ({ latitude, longitude }));

describe("MapLayerFileParser", () => {
  test("GeoJSON feature collection with every geometry type", () => {
    const result = MapLayerFileParser.parseGeoJson({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "plot 1" },
          geometry: { type: "Point", coordinates: [10, 20, 100] },
        },
        {
          type: "Feature",
          properties: null,
          geometry: {
            type: "MultiPoint",
            coordinates: [
              [1, 2],
              ["x", 3],
            ],
          },
        },
        {
          type: "Feature",
          properties: { Name: "road" },
          geometry: {
            type: "MultiLineString",
            coordinates: [
              [
                [0, 0],
                [1, 1],
              ],
              // one position only: not a line
              [[5, 5]],
            ],
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "GeometryCollection",
            geometries: [
              { type: "Polygon", coordinates: [ring(0, 0), ring(0.2, 0.2)] },
              { type: "MultiPolygon", coordinates: [[ring(5, 5)]] },
            ],
          },
        },
        { type: "Feature", properties: {}, geometry: null },
      ],
    });
    expect(result.points).toEqual([
      { name: "plot 1", coordinate: { latitude: 20, longitude: 10 } },
      { name: undefined, coordinate: { latitude: 2, longitude: 1 } },
    ]);
    expect(result.lines).toEqual([
      {
        name: "road",
        coordinates: toLatLngs([
          [0, 0],
          [1, 1],
        ]),
      },
    ]);
    expect(result.polygons).toEqual([
      {
        name: undefined,
        coordinates: toLatLngs(ring(0, 0)),
        holes: [toLatLngs(ring(0.2, 0.2))],
      },
      { name: undefined, coordinates: toLatLngs(ring(5, 5)), holes: [] },
    ]);
  });

  test("GeoJSON bare geometry", () => {
    const result = MapLayerFileParser.parseGeoJson({
      type: "Polygon",
      coordinates: [ring(1, 1)],
    });
    expect(result.polygons).toHaveLength(1);
  });

  test("KML placemarks, with multi geometries and holes", () => {
    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Folder>
      <Placemark>
        <name> Plot A </name>
        <Point><coordinates>10.5,20.5,0</coordinates></Point>
      </Placemark>
      <Placemark>
        <name>Track</name>
        <LineString><coordinates>
          0 ,0,0 1, 1,0
        </coordinates></LineString>
      </Placemark>
      <Placemark>
        <MultiGeometry>
          <Polygon>
            <outerBoundaryIs><LinearRing><coordinates>0,0 1,0 1,1 0,0</coordinates></LinearRing></outerBoundaryIs>
            <innerBoundaryIs><LinearRing><coordinates>0.2,0.2 0.8,0.2 0.8,0.8 0.2,0.2</coordinates></LinearRing></innerBoundaryIs>
          </Polygon>
          <Point><coordinates>5,6</coordinates></Point>
        </MultiGeometry>
      </Placemark>
    </Folder>
  </Document>
</kml>`;
    const result = MapLayerFileParser.parseKml(kml);
    expect(result.points).toEqual([
      { name: "Plot A", coordinate: { latitude: 20.5, longitude: 10.5 } },
      { name: undefined, coordinate: { latitude: 6, longitude: 5 } },
    ]);
    expect(result.lines).toEqual([
      {
        name: "Track",
        coordinates: toLatLngs([
          [0, 0],
          [1, 1],
        ]),
      },
    ]);
    expect(result.polygons).toEqual([
      {
        name: undefined,
        coordinates: toLatLngs(ring(0, 0)),
        holes: [
          toLatLngs([
            [0.2, 0.2],
            [0.8, 0.2],
            [0.8, 0.8],
            [0.2, 0.2],
          ]),
        ],
      },
    ]);
  });

  test("KML with a namespace prefix", () => {
    const kml = `<kml:kml xmlns:kml="http://www.opengis.net/kml/2.2"><kml:Placemark><kml:name>P</kml:name><kml:Point><kml:coordinates>1,2</kml:coordinates></kml:Point></kml:Placemark></kml:kml>`;
    expect(MapLayerFileParser.parseKml(kml).points).toEqual([
      { name: "P", coordinate: { latitude: 2, longitude: 1 } },
    ]);
  });

  test("invalid KML throws", () => {
    expect(() => MapLayerFileParser.parseKml("<kml><Placemark>")).toThrow();
  });
});
