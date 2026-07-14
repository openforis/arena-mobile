import { parseGGA, parseGST, parseRMC } from "./nmeaSentenceParser";

describe("nmeaSentenceParser", () => {
  describe("parseGGA", () => {
    it("parses a valid GGA sentence with a fix", () => {
      const fix = parseGGA(
        "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47",
      );

      expect(fix).not.toBeNull();
      expect(fix!.latitude).toBeCloseTo(48.1173, 4);
      expect(fix!.longitude).toBeCloseTo(11.51667, 4);
      expect(fix!.altitude).toBe(545.4);
      expect(fix!.hdop).toBe(0.9);
      expect(fix!.fixQuality).toBe(1);
      expect(fix!.satellitesInUse).toBe(8);
      expect(fix!.time).toBe("123519");
    });

    it("parses southern/western hemisphere coordinates as negative", () => {
      const fix = parseGGA(
        "$GPGGA,123519,4807.038,S,01131.000,W,1,08,0.9,545.4,M,46.9,M,,*48",
      );

      expect(fix).not.toBeNull();
      expect(fix!.latitude).toBeCloseTo(-48.1173, 4);
      expect(fix!.longitude).toBeCloseTo(-11.51667, 4);
    });

    it("returns null when the checksum is invalid", () => {
      const fix = parseGGA(
        "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*00",
      );

      expect(fix).toBeNull();
    });

    it("returns null when the checksum is missing", () => {
      const fix = parseGGA(
        "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,",
      );

      expect(fix).toBeNull();
    });

    it("returns null when fix quality is 0 (no fix)", () => {
      const fix = parseGGA(
        "$GPGGA,123519,4807.038,N,01131.000,E,0,00,,,M,,M,,*5F",
      );

      expect(fix).toBeNull();
    });

    it("returns null for a sentence that is not a GGA sentence", () => {
      const fix = parseGGA(
        "$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A",
      );

      expect(fix).toBeNull();
    });

    it("returns null when there are too few fields", () => {
      const fix = parseGGA("$GPGGA,123519,4807.038,N*7F");

      expect(fix).toBeNull();
    });
  });

  describe("parseRMC", () => {
    it("parses a valid, active RMC sentence", () => {
      const track = parseRMC(
        "$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A",
      );

      expect(track).not.toBeNull();
      expect(track!.valid).toBe(true);
      expect(track!.speedKnots).toBe(22.4);
      expect(track!.courseDegrees).toBe(84.4);
      expect(track!.date).toBe("230394");
      expect(track!.time).toBe("123519");
    });

    it("marks the track invalid when status is 'V' (void)", () => {
      const track = parseRMC(
        "$GPRMC,123519,V,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*7D",
      );

      expect(track).not.toBeNull();
      expect(track!.valid).toBe(false);
    });

    it("returns null when the checksum is invalid", () => {
      const track = parseRMC(
        "$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*00",
      );

      expect(track).toBeNull();
    });

    it("returns null for a sentence that is not an RMC sentence", () => {
      const track = parseRMC(
        "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47",
      );

      expect(track).toBeNull();
    });

    it("returns null when there are too few fields", () => {
      const track = parseRMC("$GPRMC,123519,A,4807.038,N*7F");

      expect(track).toBeNull();
    });
  });

  describe("parseGST", () => {
    it("parses a valid GST sentence", () => {
      const gst = parseGST("$GPGST,024603.00,3.4,2.5,2.0,120.0,1.8,1.6,3.4*5C");

      expect(gst).not.toBeNull();
      expect(gst!.latitudeErrorMeters).toBe(1.8);
      expect(gst!.longitudeErrorMeters).toBe(1.6);
      expect(gst!.time).toBe("024603.00");
    });

    it("returns null lat/lon errors when the fields are empty", () => {
      const gst = parseGST("$GPGST,024603.00,,,,,,,*7A");

      expect(gst).not.toBeNull();
      expect(gst!.latitudeErrorMeters).toBeNull();
      expect(gst!.longitudeErrorMeters).toBeNull();
    });

    it("returns null when the checksum is invalid", () => {
      const gst = parseGST("$GPGST,024603.00,3.4,2.5,2.0,120.0,1.8,1.6,3.4*00");

      expect(gst).toBeNull();
    });

    it("returns null for a sentence that is not a GST sentence", () => {
      const gst = parseGST(
        "$GPGGA,024603.00,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*67",
      );

      expect(gst).toBeNull();
    });

    it("returns null when there are too few fields", () => {
      const gst = parseGST("$GPGST,024603.00,3.4*53");

      expect(gst).toBeNull();
    });
  });
});
