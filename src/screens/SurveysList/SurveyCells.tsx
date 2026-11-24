import { DateFormats, Dates } from "@openforis/arena-core";

import {
  DataVisualizerCellProps,
  DataVisualizerItem,
  Text,
  ViewMoreText,
} from "components";

// cell renderers shared by the local and remote surveys lists
type SurveyCellItem = DataVisualizerItem & {
  description?: string | null;
  datePublished?: string | null;
};

export const SurveyDescriptionCell = ({
  item,
}: DataVisualizerCellProps<SurveyCellItem>) =>
  item.description ? (
    <ViewMoreText numberOfLines={3}>
      <Text>{item.description}</Text>
    </ViewMoreText>
  ) : null;

export const SurveyDatePublishedCell = ({
  item,
}: DataVisualizerCellProps<SurveyCellItem>) =>
  item.datePublished ? (
    <Text>
      {Dates.convertDate({
        dateStr: item.datePublished,
        formatFrom: DateFormats.datetimeStorage,
        formatTo: DateFormats.datetimeDisplay,
      })}
    </Text>
  ) : null;
