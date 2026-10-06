import { createNmeaStreamDiagnostics } from "./nmeaStreamDiagnostics";

describe("nmeaStreamDiagnostics", () => {
  const gga =
    "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47\r";
  const noFixGga = "$GPGGA,123519,,,,,0,00,99.9,,M,,M,,*5C\r";
  const rmc =
    "$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A\r";

  it("reports an empty stream", () => {
    const diagnostics = createNmeaStreamDiagnostics();

    expect(diagnostics.summary()).toBe(
      "chunks=0 sentences={} unrecognized=0 positions=0 lastGGA=[none] lastAccuracy=none",
    );
  });

  it("counts sentences, positions and the last GGA fix status", () => {
    const diagnostics = createNmeaStreamDiagnostics();

    diagnostics.record(rmc, null);
    diagnostics.record(gga, { latitude: 48, longitude: 11, accuracy: 3.51 });
    diagnostics.record(noFixGga, null);
    diagnostics.record("¾\u0000binary", null);

    expect(diagnostics.summary()).toBe(
      'chunks=4 sentences={"GPRMC":1,"GPGGA":2} unrecognized=1 positions=1 lastGGA=[fixQuality=0 satellites=00 hdop=99.9] lastAccuracy=3.51',
    );
  });

  it("returns an escaped sample only for the first chunks", () => {
    const diagnostics = createNmeaStreamDiagnostics();

    expect(diagnostics.record("$\u0000A\r", null)).toBe('"$\\u0000A\\r"');
    for (let i = 0; i < 14; i++) {
      expect(diagnostics.record(rmc, null)).not.toBeNull();
    }
    expect(diagnostics.record(rmc, null)).toBeNull();
  });
});
