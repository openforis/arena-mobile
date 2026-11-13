export enum LanguageConstants {
  system = "system",
}

export const Languages = [
  { key: "en", label: "English" },
  { key: "am", label: "Amharic" },
  { key: "fi", label: "Finnish" },
  { key: "fr", label: "French" },
  { key: "de", label: "German" },
  { key: "id", label: "Indonesian" },
  { key: "ja", label: "Japanese" },
  { key: "fa", label: "Persian" },
  { key: "pt", label: "Portuguese" },
  { key: "ru", label: "Russian" },
  { key: "sr", label: "Serbian" },
  { key: "es", label: "Spanish" },
  { key: "sv", label: "Swedish" },
];

export const LanguagesSettings = [
  { key: LanguageConstants.system, label: "System" },
  ...Languages,
];
