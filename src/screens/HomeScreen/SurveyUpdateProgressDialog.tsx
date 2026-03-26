import { StyleSheet } from "react-native";

import { Dialog, Loader, Text, VView } from "components";

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
  },
});

type Props = {
  titleKey?: string;
};

export const SurveyUpdateProgressDialog = ({
  titleKey = "surveys:updateSurvey",
}: Props) => {
  return (
    <Dialog dismissable={false} showActions={false} title={titleKey}>
      <VView style={styles.content} transparent>
        <Loader />
        <Text textKey="app:pleaseWaitMessage" variant="bodyLarge" />
      </VView>
    </Dialog>
  );
};
