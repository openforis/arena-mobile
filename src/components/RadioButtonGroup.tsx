import { RadioButton as RNPRadioButton } from "react-native-paper";

type Props = {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  value?: string;
};

export const RadioButtonGroup = (props: Props) => {
  const { children, onValueChange, value } = props;
  return (
    <RNPRadioButton.Group onValueChange={onValueChange} value={value}>
      {children}
    </RNPRadioButton.Group>
  );
};
