const nonDigitsRegExp = /\D/g;

const toDigits = (text: string): string => text.replaceAll(nonDigitsRegExp, "");

// the caret is hidden and the text tiny: what is typed or pasted ends up after the current code
const getCodeFromText = ({
  code,
  length,
  text,
}: {
  code: string;
  length: number;
  text: string;
}): string => {
  const digits = toDigits(text);
  const added = digits.startsWith(code) ? digits.slice(code.length) : digits;
  // a whole code (pasted or autofilled) replaces the digits already entered
  return (added.length >= length ? added : digits).slice(0, length);
};

export const VerificationCodeInputUtils = { getCodeFromText };
