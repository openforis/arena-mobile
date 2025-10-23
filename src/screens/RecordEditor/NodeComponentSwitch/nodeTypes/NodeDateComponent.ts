import { NodeDateTimeComponent } from "./NodeDateTimeComponent";

export const NodeDateComponent = (props) => (
  <NodeDateTimeComponent mode="date" {...props} />
);

NodeDateComponent.propTypes = NodeDateTimeComponent.propTypes;
