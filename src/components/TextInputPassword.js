import { useCallback, useState } from "react";
import { TextInput as RNPTextInput } from "react-native-paper";

import { TextInput } from "./TextInput";

export const TextInputPassword = (props) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const toggleSecureTextEntry = useCallback(() => {
    setSecureTextEntry(!secureTextEntry);
  }, [secureTextEntry]);

  return (
    <TextInput
      autoCapitalize="none"
      right={
        <RNPTextInput.Icon
          icon={secureTextEntry ? "eye-off" : "eye"}
          onPress={toggleSecureTextEntry}
        />
      }
      secureTextEntry={secureTextEntry}
      {...props}
    />
  );
};
