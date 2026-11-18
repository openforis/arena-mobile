import { createElement } from "react";

import { ScreenViewMode } from "model";

import { DataCardList } from "../DataCards";
import { DataTable } from "../DataTable";
import { DataList } from "../DataList";
import { VView } from "../VView";
import { DataVisualizerItem, DataVisualizerProps } from "./types";

type Props<T extends DataVisualizerItem> = DataVisualizerProps<T> & {
  mode: string;
};

type DataVisualizerComponent = <T extends DataVisualizerItem>(
  props: DataVisualizerProps<T>,
) => React.ReactElement;

const componentByMode: Record<ScreenViewMode, DataVisualizerComponent> = {
  [ScreenViewMode.table]: DataTable,
  [ScreenViewMode.list]: DataList,
  [ScreenViewMode.cards]: DataCardList,
};

export const DataVisualizer = <T extends DataVisualizerItem>(
  props: Props<T>,
) => {
  const { mode } = props;
  return (
    <VView fullFlex>
      {createElement<DataVisualizerProps<T>>(
        componentByMode[mode as ScreenViewMode] ?? DataTable,
        props,
      )}
    </VView>
  );
};
