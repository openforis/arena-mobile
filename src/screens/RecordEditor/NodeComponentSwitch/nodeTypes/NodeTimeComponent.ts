import { NodeDateTimeComponent } from "./NodeDateTimeComponent";

// @ts-expect-error TS(2709): Cannot use namespace 'NodeDateTimeComponent' as a ... Remove this comment to see the full error message
export const NodeTimeComponent = (props: any) => <NodeDateTimeComponent mode="time" {...props} />;

NodeTimeComponent.propTypes = NodeDateTimeComponent.propTypes;
