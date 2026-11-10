import { VerificationCodeInputUtils } from "./VerificationCodeInputUtils";

const getCode = (code: string, text: string) =>
  VerificationCodeInputUtils.getCodeFromText({ code, length: 6, text });

describe("VerificationCodeInputUtils.getCodeFromText", () => {
  test("typing adds digits up to the code length, backspace removes the last one", () => {
    let code = "";
    for (const digit of "1234567") {
      code = getCode(code, code + digit);
    }
    expect(code).toBe("123456");
    expect(getCode(code, "12345")).toBe("12345");
  });

  test("non digits and digits after the code length are ignored", () => {
    expect(getCode("12", "12a")).toBe("12");
    expect(getCode("", "12345678")).toBe("123456");
  });

  test.each([
    ["into an empty input", "", "123 456"],
    ["after the digits already entered (paste)", "12", "12123 456"],
    ["over the whole text (autofill)", "65", "123456"],
    ["over the whole text, starting with the same digits", "12", "123456"],
  ])("a whole code entered %s replaces the current one", (_, code, text) => {
    expect(getCode(code, text)).toBe("123456");
  });
});
