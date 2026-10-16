import { PDFDocument, PDFName, PDFNumber, PDFString } from "pdf-lib";

// Builds geospatial PDFs (ISO 32000 encoding) for the tests

export type GeoPdfFixtureViewport = {
  bbox: [number, number, number, number];
  // [lat, lon] pairs
  gpts: number[];
  lpts?: number[];
  bounds?: number[];
  wkt?: string;
  epsg?: number;
  name?: string;
};

export type GeoPdfFixturePage = {
  size: [number, number];
  rotate?: number;
  cropBox?: [number, number, number, number];
  viewports?: GeoPdfFixtureViewport[];
  lgiDict?: boolean;
};

const DEFAULT_LPTS = [0, 0, 0, 1, 1, 1, 1, 0];

export const buildGeoPdf = async (
  pages: GeoPdfFixturePage[],
): Promise<Uint8Array> => {
  const doc = await PDFDocument.create();
  const { context } = doc;
  for (const pageDef of pages) {
    const page = doc.addPage(pageDef.size);
    if (pageDef.rotate) {
      page.node.set(PDFName.of("Rotate"), PDFNumber.of(pageDef.rotate));
    }
    if (pageDef.cropBox) {
      const [x1, y1, x2, y2] = pageDef.cropBox;
      page.setCropBox(x1, y1, x2 - x1, y2 - y1);
    }
    if (pageDef.lgiDict) {
      page.node.set(PDFName.of("LGIDict"), context.obj({ Type: "LGIDict" }));
    }
    if (pageDef.viewports) {
      const vps = pageDef.viewports.map((viewport) => {
        const gcs: Record<string, any> = {
          Type: viewport.epsg ? "PROJCS" : "GEOGCS",
        };
        if (viewport.epsg) gcs["EPSG"] = viewport.epsg;
        const measure: Record<string, any> = {
          Type: "Measure",
          Subtype: "GEO",
          GPTS: viewport.gpts,
          LPTS: viewport.lpts ?? DEFAULT_LPTS,
          GCS: context.obj(gcs),
        };
        if (viewport.bounds) measure["Bounds"] = viewport.bounds;
        const measureDict = context.obj(measure);
        if (viewport.wkt) {
          const gcsDict = measureDict.get(PDFName.of("GCS")) as any;
          gcsDict.set(PDFName.of("WKT"), PDFString.of(viewport.wkt));
        }
        const vp: Record<string, any> = {
          Type: "Viewport",
          BBox: viewport.bbox,
          Measure: context.register(measureDict),
        };
        if (viewport.name) vp["Name"] = PDFString.of(viewport.name);
        return context.obj(vp);
      });
      page.node.set(PDFName.of("VP"), context.obj(vps));
    }
  }
  return doc.save({ useObjectStreams: true });
};
