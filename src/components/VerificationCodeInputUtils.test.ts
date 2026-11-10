import { VerificationCodeInputUtils } from "./VerificationCodeInputUtils";

const getCode = (code: string, text: string) =>
  VerificationCodeInputUtils.getCodeFromText({ code, length: 6, text });

describe("VerificationCodeInputUtils.getCodeFromText", () => {
  test("typing adds a digit, backspace removes the last one", () => {
    expect(getCode("12", "123")).toBe("123");
    expect(getCode("123", "12")).toBe("12");
  });

  test("non digits are ignored", () => {
    expect(getCode("12", "12a")).toBe("12");
    expect(getCode("", "123 456")).toBe("123456");
  });

  test("a pasted whole code replaces the digits already entered", () => {
    expect(getCode("12", "12654321")).toBe("654321");
    expect(getCode("12", "12654 321")).toBe("654321");
  });

  test("an autofilled code replaces the whole text", () => {
    expect(getCode("12", "654321")).toBe("654321");
    expect(getCode("65", "654321")).toBe("654321");
  });

  test("the code is never longer than its length", () => {
    expect(getCode("123456", "1234567")).toBe("123456");
    expect(getCode("", "12345678")).toBe("123456");
  });
});
