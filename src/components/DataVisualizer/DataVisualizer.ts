// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { ScreenViewMode } from "model/ScreenViewMode";

import { DataTable } from "../DataTable";
import { DataList } from "../DataList";
import { VView } from "../VView";

export const DataVisualizer = (props: any) => {
  const { mode } = props;
  return (
    // @ts-expect-error TS(7027): Unreachable code detected.
    <VView style={{ flex: 1 }}>
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      {mode === ScreenViewMode.table ? (
        // @ts-expect-error TS(2709): Cannot use namespace 'DataTable' as a type.
        <DataTable {...props} />
      ) : (
        // @ts-expect-error TS(2709): Cannot use namespace 'DataList' as a type.
        <DataList {...props} />
      )}
    </VView>
  );
};

DataVisualizer.propTypes = {
  mode: PropTypes.string.isRequired,
};
