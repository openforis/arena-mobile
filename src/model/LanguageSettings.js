export const LanguageConstants = {
  system: "system",
};

export const Languages = [
  // { key: "am", label: "Amharic" },
  { key: "en", label: "English" },
  // { key: "fr", label: "French" },
  { key: "fa", label: "Persian" },
  { key: "pt", label: "Portuguese" },
  { key: "es", label: "Spanish" },
  { key: "ru", label: "Russian" },
];

export const LanguagesSettings = [
  { key: LanguageConstants.system, label: "System" },
  ...Languages,
];
