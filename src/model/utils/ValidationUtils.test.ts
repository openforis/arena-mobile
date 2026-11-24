import type {
  ArenaValidation,
  ArenaValidationResult,
} from "@openforis/arena-core";

import { ValidationUtils } from "./ValidationUtils";

const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key}${JSON.stringify(params)}` : key;

const customValidationKey = "record.attribute.customValidation";

const validation = ({
  errors,
  warnings,
  fields,
  valid = false,
}: {
  errors?: Partial<ArenaValidationResult>[];
  warnings?: Partial<ArenaValidationResult>[];
  fields?: Record<string, ArenaValidation>;
  valid?: boolean;
}) => ({ valid, errors, warnings, fields }) as ArenaValidation;

describe("ValidationUtils", () => {
  test("returns null when there are no messages", () => {
    const v = validation({ valid: true });
    expect(ValidationUtils.getJointErrorText({ validation: v, t })).toBeNull();
    expect(
      ValidationUtils.getJointWarningText({ validation: v, t }),
    ).toBeNull();
    expect(
      ValidationUtils.getJointErrorText({
        validation: validation({ errors: [] }),
        t,
      }),
    ).toBeNull();
  });

  test("translates errors and warnings separately", () => {
    const v = validation({
      errors: [{ key: "a", params: { x: 1 } }, { key: "b" }],
      warnings: [{ key: "w" }],
    });
    expect(ValidationUtils.getJointErrorText({ validation: v, t })).toBe(
      'validation:a{"x":1}, validation:b',
    );
    expect(ValidationUtils.getJointWarningText({ validation: v, t })).toBe(
      "validation:w",
    );
  });

  test("includes messages of nested field validations", () => {
    const v = validation({
      errors: [{ key: "root" }],
      fields: {
        child: validation({
          errors: [{ key: "child" }],
          fields: { grandChild: validation({ errors: [{ key: "deep" }] }) },
        }),
      },
    });
    const text = ValidationUtils.getJointErrorText({ validation: v, t });
    expect(text?.split(", ").sort()).toEqual([
      "validation:child",
      "validation:deep",
      "validation:root",
    ]);
  });

  test("uses custom message in the requested language when available", () => {
    const v = validation({
      errors: [
        {
          key: customValidationKey,
          messages: { en: "Custom EN", es: "Custom ES" },
        },
      ],
    });
    expect(
      ValidationUtils.getJointErrorText({
        validation: v,
        t,
        customMessageLang: "es",
      }),
    ).toBe("Custom ES");
  });

  test("falls back to translation when custom message is missing", () => {
    const v = validation({
      errors: [{ key: customValidationKey, messages: { en: "Custom EN" } }],
    });
    expect(
      ValidationUtils.getJointErrorText({
        validation: v,
        t,
        customMessageLang: "fr",
      }),
    ).toBe(`validation:${customValidationKey}`);
  });

  test("custom messages of non custom-validation keys are ignored", () => {
    const v = validation({
      errors: [{ key: "other", messages: { en: "Ignored" } }],
    });
    expect(
      ValidationUtils.getJointErrorText({
        validation: v,
        t,
        customMessageLang: "en",
      }),
    ).toBe("validation:other");
  });
});
