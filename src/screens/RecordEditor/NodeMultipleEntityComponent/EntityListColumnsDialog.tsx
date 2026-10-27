import { Fragment, useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import { NodeDef, NodeDefs } from "@openforis/arena-core";

import {
  Button,
  Checkbox,
  Dialog,
  HView,
  ListSubheader,
  ScrollView,
} from "components";
import { SurveySelectors } from "state";

type Props = {
  availableDefs: NodeDef<any>[];
  onApply: (columns: string[]) => void;
  onClose: () => void;
  onReset: () => void;
  visibleDefs: NodeDef<any>[];
};

const styles = StyleSheet.create({
  dialog: { maxHeight: "85%" },
  groupHeader: { alignItems: "center" },
  subheader: { flex: 1, paddingHorizontal: 0 },
});

export const EntityListColumnsDialog = (props: Props) => {
  const { availableDefs, onApply, onClose, onReset, visibleDefs } = props;

  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const cycle = SurveySelectors.useCurrentSurveyCycle();

  // key attributes are always visible
  const [selectedUuids, setSelectedUuids] = useState<string[]>(() =>
    availableDefs
      .filter((def) => NodeDefs.isKey(def) || visibleDefs.includes(def))
      .map((def) => def.uuid),
  );

  const groups = useMemo(() => {
    const keyDefs = availableDefs.filter(NodeDefs.isKey);
    const summaryDefs = availableDefs.filter(
      (def) =>
        !NodeDefs.isKey(def) &&
        NodeDefs.isIncludedInMultipleEntitySummary(cycle)(def),
    );
    const otherDefs = availableDefs.filter(
      (def) => !keyDefs.includes(def) && !summaryDefs.includes(def),
    );
    return [
      {
        textKey: "dataEntry:entityListColumns.keys",
        defs: keyDefs,
        fixed: true,
      },
      { textKey: "dataEntry:entityListColumns.summary", defs: summaryDefs },
      { textKey: "dataEntry:entityListColumns.other", defs: otherDefs },
    ].filter(({ defs }) => defs.length > 0);
  }, [availableDefs, cycle]);

  const toggle = (uuid: string) =>
    setSelectedUuids((prev) =>
      prev.includes(uuid)
        ? prev.filter((selectedUuid) => selectedUuid !== uuid)
        : [...prev, uuid],
    );

  const toggleGroup = (defs: NodeDef<any>[], allSelected: boolean) => {
    const groupUuids = defs.map((def) => def.uuid);
    setSelectedUuids((prev) =>
      allSelected
        ? prev.filter((uuid) => !groupUuids.includes(uuid))
        : [...prev, ...groupUuids.filter((uuid) => !prev.includes(uuid))],
    );
  };

  const onOkPress = () =>
    // keep the column order of the survey
    onApply(
      availableDefs
        .map((def) => def.uuid)
        .filter((uuid) => selectedUuids.includes(uuid)),
    );

  return (
    <Dialog
      actions={[
        { onPress: onReset, textKey: "dataEntry:entityListColumns.reset" },
        { onPress: onOkPress, textKey: "common:ok" },
      ]}
      onClose={onClose}
      style={styles.dialog}
      title="dataEntry:entityListColumns.title"
    >
      <ScrollView>
        {groups.map(({ textKey, defs, fixed }) => {
          const allSelected = defs.every((def) =>
            selectedUuids.includes(def.uuid),
          );
          const otherGroupsSelected = selectedUuids.some(
            (uuid) => !defs.some((def) => def.uuid === uuid),
          );
          return (
            <Fragment key={textKey}>
              <HView style={styles.groupHeader}>
                <ListSubheader style={styles.subheader} textKey={textKey} />
                {!fixed && (
                  <Button
                    compact
                    // at least one column must remain visible
                    disabled={allSelected && !otherGroupsSelected}
                    mode="text"
                    onPress={() => toggleGroup(defs, allSelected)}
                    textKey={
                      allSelected
                        ? "dataEntry:entityListColumns.hideAll"
                        : "dataEntry:entityListColumns.showAll"
                    }
                  />
                )}
              </HView>
              {defs.map((def) => {
                const checked = selectedUuids.includes(def.uuid);
                return (
                  <Checkbox
                    key={def.uuid}
                    checked={checked}
                    // at least one column must remain visible
                    disabled={fixed || (checked && selectedUuids.length === 1)}
                    label={NodeDefs.getLabelOrName(def, lang)}
                    labelIsI18nKey={false}
                    onPress={() => toggle(def.uuid)}
                  />
                );
              })}
            </Fragment>
          );
        })}
      </ScrollView>
    </Dialog>
  );
};
