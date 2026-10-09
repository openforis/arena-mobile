import { CustomMapLayer, MapLayers } from "model/MapLayers";

const errorKeys = {
  nameRequired: "offlineMaps:customLayers.validation.nameRequired",
  nameDuplicate: "offlineMaps:customLayers.validation.nameDuplicate",
  urlRequired: "offlineMaps:customLayers.validation.urlRequired",
  urlNotHttps: "offlineMaps:customLayers.validation.urlNotHttps",
  urlPlaceholdersMissing:
    "offlineMaps:customLayers.validation.urlPlaceholdersMissing",
  urlSubdomainNotSupported:
    "offlineMaps:customLayers.validation.urlSubdomainNotSupported",
  apiKeyRequired: "offlineMaps:customLayers.validation.apiKeyRequired",
  apiKeyPlaceholderMissing:
    "offlineMaps:customLayers.validation.apiKeyPlaceholderMissing",
};

export type CustomMapLayerValidation = {
  name?: string;
  urlTemplate?: string;
  apiKey?: string;
};

const requiredUrlPlaceholders = ["{x}", "{y}", "{z}"];
const subdomainPlaceholder = "{s}";

const normalizeName = (name: string): string => name.trim().toLowerCase();

const validateName = ({
  layer,
  layers,
}: {
  layer: CustomMapLayer;
  layers: CustomMapLayer[];
}): string | undefined => {
  const nameNormalized = normalizeName(layer.name);
  if (!nameNormalized) return errorKeys.nameRequired;
  const duplicate = layers.some(
    (item) =>
      item.id !== layer.id && normalizeName(item.name) === nameNormalized,
  );
  return duplicate ? errorKeys.nameDuplicate : undefined;
};

const validateUrlTemplate = (urlTemplate: string): string | undefined => {
  const url = urlTemplate.trim();
  if (!url) return errorKeys.urlRequired;
  if (!url.toLowerCase().startsWith("https://")) return errorKeys.urlNotHttps;
  if (url.includes(subdomainPlaceholder))
    return errorKeys.urlSubdomainNotSupported;
  if (
    !requiredUrlPlaceholders.every((placeholder) => url.includes(placeholder))
  )
    return errorKeys.urlPlaceholdersMissing;
  return undefined;
};

const validateApiKey = ({
  urlTemplate,
  apiKey,
}: {
  urlTemplate: string;
  apiKey: string;
}): string | undefined => {
  const hasPlaceholder = urlTemplate.includes(MapLayers.API_KEY_PLACEHOLDER);
  const hasApiKey = apiKey.trim().length > 0;
  if (hasPlaceholder && !hasApiKey) return errorKeys.apiKeyRequired;
  if (!hasPlaceholder && hasApiKey) return errorKeys.apiKeyPlaceholderMissing;
  return undefined;
};

// returns the translation keys of the errors, by field (empty object if the layer is valid);
// names are compared ignoring case and leading/trailing spaces
const validate = ({
  layer,
  apiKey,
  layers,
}: {
  layer: CustomMapLayer;
  apiKey: string;
  // existing custom layers
  layers: CustomMapLayer[];
}): CustomMapLayerValidation => {
  const validation: CustomMapLayerValidation = {};
  const nameError = validateName({ layer, layers });
  if (nameError) validation.name = nameError;
  const urlError = validateUrlTemplate(layer.urlTemplate);
  if (urlError) validation.urlTemplate = urlError;
  const apiKeyError = validateApiKey({
    urlTemplate: layer.urlTemplate,
    apiKey,
  });
  if (apiKeyError) validation.apiKey = apiKeyError;
  return validation;
};

const isValid = (validation: CustomMapLayerValidation): boolean =>
  Object.keys(validation).length === 0;

export const CustomMapLayerValidator = {
  errorKeys,
  validate,
  isValid,
};
