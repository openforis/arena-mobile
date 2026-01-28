import { createElement } from "react";

import { ScreenViewMode } from "model";

import { DataTable } from "../DataTable";
import { DataList } from "../DataList";
import { VView } from "../VView";
import { DataVisualizerProps } from "./types";

type Props = DataVisualizerProps & {
  mode: string;
};

export const DataVisualizer = (props: Props) => {
  const { mode } = props;
  return (
    <VView fullFlex>
      {createElement(
        mode === ScreenViewMode.table ? DataTable : DataList,
        props,
      )}
    </VView>
  );
};
