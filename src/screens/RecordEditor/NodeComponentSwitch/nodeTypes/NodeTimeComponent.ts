import { NodeDateTimeComponent } from "./NodeDateTimeComponent";

export const NodeTimeComponent = (props) => (
  <NodeDateTimeComponent mode="time" {...props} />
);

NodeTimeComponent.propTypes = NodeDateTimeComponent.propTypes;
