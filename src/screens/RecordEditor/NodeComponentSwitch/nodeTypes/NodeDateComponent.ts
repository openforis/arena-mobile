import { NodeDateTimeComponent } from "./NodeDateTimeComponent";

// @ts-expect-error TS(2709): Cannot use namespace 'NodeDateTimeComponent' as a ... Remove this comment to see the full error message
export const NodeDateComponent = (props: any) => <NodeDateTimeComponent mode="date" {...props} />;

NodeDateComponent.propTypes = NodeDateTimeComponent.propTypes;
