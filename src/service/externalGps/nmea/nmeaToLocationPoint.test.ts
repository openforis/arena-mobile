import { createNmeaLocationPointAssembler } from "./nmeaToLocationPoint";

describe("nmeaToLocationPoint", () => {
  const validGga =
    "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47";
  const validRmc =
    "$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A";
  const voidRmc =
    "$GPRMC,123519,V,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*7D";
  const validGst = "$GPGST,024603.00,3.4,2.5,2.0,120.0,1.8,1.6,3.4*5C";
  const emptyAccuracyGst = "$GPGST,024603.00,,,,,,,*7A";

  it("builds a LocationPoint from a GGA sentence with HDOP fallback accuracy", () => {
    const assembler = createNmeaLocationPointAssembler();

    const locationPoint = assembler.ingest(validGga);

    expect(locationPoint).toEqual({
      latitude: expect.closeTo(48.1173, 4),
      longitude: expect.closeTo(11.51667, 4),
      altitude: 545.4,
      altitudeAccuracy: null,
      accuracy: 4.5,
      heading: null,
      speed: null,
    });
  });

  it("merges the latest valid RMC speed and heading into the next GGA fix", () => {
    const assembler = createNmeaLocationPointAssembler();

    expect(assembler.ingest(validRmc)).toBeNull();

    const locationPoint = assembler.ingest(validGga);

    expect(locationPoint?.heading).toBe(84.4);
    expect(locationPoint?.speed).toBeCloseTo(11.5235456, 7);
  });

  it("clears cached track data when the latest RMC sentence is void", () => {
    const assembler = createNmeaLocationPointAssembler();

    assembler.ingest(validRmc);
    expect(assembler.ingest(voidRmc)).toBeNull();

    const locationPoint = assembler.ingest(validGga);

    expect(locationPoint?.heading).toBeNull();
    expect(locationPoint?.speed).toBeNull();
  });

  it("prefers measured GST accuracy over the HDOP-based estimate", () => {
    const assembler = createNmeaLocationPointAssembler();

    expect(assembler.ingest(validGst)).toBeNull();

    const locationPoint = assembler.ingest(validGga);

    expect(locationPoint?.accuracy).toBeCloseTo(Math.hypot(1.8, 1.6), 10);
  });

  it("falls back to HDOP-based accuracy when GST has no horizontal error values", () => {
    const assembler = createNmeaLocationPointAssembler();

    expect(assembler.ingest(emptyAccuracyGst)).toBeNull();

    const locationPoint = assembler.ingest(validGga);

    expect(locationPoint?.accuracy).toBe(4.5);
  });
});
