export const LanguageConstants = {
  system: "system",
};

export const Languages = [
  // { key: "am", label: "Amharic" },
  { key: "en", label: "English" },
  { key: "es", label: "Spanish" },
  { key: "fa", label: "Persian" },
  // { key: "fr", label: "French" },
  { key: "pt", label: "Portuguese" },
  { key: "ru", label: "Russian" },
];

export const LanguagesSettings = [
  { key: LanguageConstants.system, label: "System" },
  ...Languages,
];
