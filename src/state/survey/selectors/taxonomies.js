import {createCachedSelector} from 're-reselect';

import {getTaxonIndex, getTaxonUuidIndex} from './base';

// --- Taxonomies

export const getTaxonomyItemsUuidsByTaxonomyUuid = createCachedSelector(
  getTaxonUuidIndex,
  (_, taxonomyUuid) => taxonomyUuid,
  (taxonUuidIndex, taxonomyUuid) => Object.values(taxonUuidIndex[taxonomyUuid]),
)((_state_, taxonomyUuid) => taxonomyUuid || '__');

export const getTaxonomyItemsByTaxonomyUuid = createCachedSelector(
  getTaxonUuidIndex,
  getTaxonIndex,
  (_, taxonomyUuid) => taxonomyUuid,
  (taxonUuidIndex, taxonIndex, taxonomyUuid) => {
    const taxonomyItemsUuids = Object.values(taxonUuidIndex[taxonomyUuid]);
    const items = {};
    taxonomyItemsUuids.forEach(uuid => {
      items[uuid] = taxonIndex[uuid];
    });
    return items;
  },
)((_state_, taxonomyUuid) => taxonomyUuid || '__');

export const getTaxonomyItemByUuid = createCachedSelector(
  getTaxonIndex,
  (_, taxonomyItemUuid) => taxonomyItemUuid,
  (taxonIndex, taxonomyUuid) => taxonIndex[taxonomyUuid],
)((_state_, taxonomyItemUuid) => taxonomyItemUuid || '__');
