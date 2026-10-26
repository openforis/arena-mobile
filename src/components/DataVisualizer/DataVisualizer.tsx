import { createElement } from "react";

import { ScreenViewMode } from "model";

import { DataCardList } from "../DataCards";
import { DataTable } from "../DataTable";
import { DataList } from "../DataList";
import { VView } from "../VView";
import { DataVisualizerProps } from "./types";

type Props = DataVisualizerProps & {
  mode: string;
};

const componentByMode: Record<ScreenViewMode, any> = {
  [ScreenViewMode.table]: DataTable,
  [ScreenViewMode.list]: DataList,
  [ScreenViewMode.cards]: DataCardList,
};

export const DataVisualizer = (props: Props) => {
  const { mode } = props;
  return (
    <VView fullFlex>
      {createElement(
        componentByMode[mode as ScreenViewMode] ?? DataTable,
        props,
      )}
    </VView>
  );
};
