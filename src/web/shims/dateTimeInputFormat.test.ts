import { DateTimeInputFormat } from "./dateTimeInputFormat";

const dateInitial = new Date(2024, 0, 31, 13, 45, 0, 0);

describe("DateTimeInputFormat.format", () => {
  test("formats dates as DD/MM/YYYY and times as 24h HH:mm", () => {
    expect(DateTimeInputFormat.format(dateInitial, "date")).toBe("31/01/2024");
    expect(DateTimeInputFormat.format(dateInitial, "time")).toBe("13:45");
    expect(DateTimeInputFormat.format(dateInitial, "datetime")).toBe(
      "31/01/2024 13:45",
    );
  });
});

describe("DateTimeInputFormat.mask", () => {
  test.each([
    ["1", "date", "1"],
    ["150", "date", "15/0"],
    ["15032024", "date", "15/03/2024"],
    ["15/03/20245", "date", "15/03/2024"],
    ["ab15-03", "date", "15/03"],
    ["093", "time", "09:3"],
    ["0930", "time", "09:30"],
    ["150320240930", "datetime", "15/03/2024 09:30"],
  ] as const)("%s (%s) -> %s", (text, mode, expected) => {
    expect(DateTimeInputFormat.mask(text, mode)).toBe(expected);
  });
});

describe("DateTimeInputFormat.parse", () => {
  test("parses a date keeping the time of the initial date", () => {
    expect(
      DateTimeInputFormat.parse("15/03/2024", "date", dateInitial),
    ).toEqual(new Date(2024, 2, 15, 13, 45, 0, 0));
  });

  test("parses a 24h time keeping the day of the initial date", () => {
    expect(DateTimeInputFormat.parse("21:05", "time", dateInitial)).toEqual(
      new Date(2024, 0, 31, 21, 5, 0, 0),
    );
  });

  test("parses a date and time", () => {
    expect(
      DateTimeInputFormat.parse("15/03/2024 09:30", "datetime", dateInitial),
    ).toEqual(new Date(2024, 2, 15, 9, 30, 0, 0));
  });

  test.each([
    ["", "date"],
    ["15/03/20", "date"],
    ["31/02/2024", "date"],
    ["15/13/2024", "date"],
    ["24:00", "time"],
    ["9:30", "time"],
    ["12:60", "time"],
    ["15/03/2024", "datetime"],
  ] as const)("rejects %s (%s)", (text, mode) => {
    expect(DateTimeInputFormat.parse(text, mode, dateInitial)).toBeNull();
  });
});
