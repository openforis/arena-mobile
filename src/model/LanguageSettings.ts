export enum LanguageConstants {
  system = "system",
}

export const Languages = [
  { key: "en", label: "English" },
  { key: "fi", label: "Finnish" },
  { key: "fr", label: "French" },
  { key: "de", label: "German" },
  { key: "id", label: "Indonesian" },
  { key: "fa", label: "Persian" },
  { key: "pt", label: "Portuguese" },
  { key: "ru", label: "Russian" },
  { key: "es", label: "Spanish" },
];

export const LanguagesSettings = [
  { key: LanguageConstants.system, label: "System" },
  ...Languages,
];
