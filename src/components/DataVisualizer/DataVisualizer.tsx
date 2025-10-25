import PropTypes from "prop-types";

import { ScreenViewMode } from "model/ScreenViewMode";

import { DataTable } from "../DataTable";
import { DataList } from "../DataList";
import { VView } from "../VView";

export const DataVisualizer = (props: any) => {
  const { mode } = props;
  return (
    <VView style={{ flex: 1 }}>
      {mode === ScreenViewMode.table ? (
        <DataTable {...props} />
      ) : (
        <DataList {...props} />
      )}
    </VView>
  );
};

DataVisualizer.propTypes = {
  mode: PropTypes.string.isRequired,
};
