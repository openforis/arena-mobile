export const LanguageConstants = {
  system: "system",
};

export const Languages = [
  // { key: "am", label: "Amharic" },
  { key: "en", label: "English" },
  { key: "fr", label: "French" },
  { key: "de", label: "German" },
  { key: "fa", label: "Persian" },
  { key: "pt", label: "Portuguese" },
  { key: "ru", label: "Russian" },
  { key: "es", label: "Spanish" },
];

export const LanguagesSettings = [
  { key: LanguageConstants.system, label: "System" },
  ...Languages,
];
