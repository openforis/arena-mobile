import { AlertIcon } from "./AlertIcon";
import { CompletionIndicator } from "./CompletionIndicator";
import { HView } from "./HView";

type Props = {
  completionPercent?: number;
  hasErrors?: boolean;
  hasWarnings?: boolean;
  size?: number;
};

export const EntityStatusIndicators = (props: Props) => {
  const { completionPercent, hasErrors, hasWarnings, size } = props;

  const hideCompletionIndicator = completionPercent === 0 && hasErrors;

  return (
    <HView transparent>
      {!hideCompletionIndicator && (
        <CompletionIndicator completionPercent={completionPercent} size={size} />
      )}
      <AlertIcon hasErrors={hasErrors} hasWarnings={hasWarnings} size={size} />
    </HView>
  );
};
