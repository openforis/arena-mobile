import { memo, useCallback, useMemo } from "react";
import { FlatList } from "react-native";

import {
  LanguageCode,
  NodeDefType,
  NodeDefs,
  Records,
  Validations,
} from "@openforis/arena-core";

import { AlertIcon, ListItem, VView } from "components";
import { RecordPageNavigator } from "model";
import {
  DataEntryActions,
  DataEntrySelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";

import { NodePageNavigationButton } from "../BottomNavigationBar/NodePageNavigationButton";

import styles from "./styles";

const iconByNodeDefType: Record<string, any> = {
  [NodeDefType.boolean]: () => "checkbox-marked-outline",
  [NodeDefType.code]: () => "format-list-numbered",
  [NodeDefType.coordinate]: () => "map-marker-outline",
  [NodeDefType.date]: () => "calendar-range",
  [NodeDefType.decimal]: () => "decimal",
  [NodeDefType.entity]: ({ nodeDef }: any) =>
    NodeDefs.isSingle(nodeDef) ? "window-maximize" : "table",
  [NodeDefType.file]: () => "file-outline",
  [NodeDefType.integer]: () => "numeric",
  [NodeDefType.taxon]: () => "tree-outline",
  [NodeDefType.text]: () => "format-text",
  [NodeDefType.time]: () => "clock-time-three-outline",
};

const getNodeDefIcon = (nodeDef: any) =>
  iconByNodeDefType[nodeDef.type]?.({ nodeDef });

type ValidationStatus = { hasErrors: boolean; hasWarnings: boolean };

type PageNodesListItemProps = {
  active: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  index: number;
  lang: LanguageCode;
  nodeDef: any;
  onPress: (index: number) => void;
};

const PageNodesListItem = memo((props: PageNodesListItemProps) => {
  const { active, hasErrors, hasWarnings, index, lang, nodeDef, onPress } =
    props;

  const onItemPress = useCallback(() => onPress(index), [index, onPress]);

  const right = useMemo(
    () =>
      hasErrors || hasWarnings ? (
        <AlertIcon hasErrors={hasErrors} hasWarnings={hasWarnings} />
      ) : null,
    [hasErrors, hasWarnings],
  );

  return (
    <ListItem
      title={NodeDefs.getLabelOrName(nodeDef, lang)}
      onPress={onItemPress}
      leftIcon={getNodeDefIcon(nodeDef)}
      right={right}
      style={active ? styles.activeItem : undefined}
      titleStyle={active ? styles.activeItemText : undefined}
    />
  );
});

export const PageNodesList = () => {
  const dispatch = useAppDispatch();

  const childDefs = DataEntrySelectors.useCurrentPageEntityRelevantChildDefs();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const currentEntityPointer = DataEntrySelectors.useCurrentPageEntity();
  const { entityDef, entityUuid } = currentEntityPointer;
  const activeChildIndex =
    DataEntrySelectors.useCurrentPageEntityActiveChildIndex();

  const survey = SurveySelectors.useCurrentSurvey();
  const record = DataEntrySelectors.useRecord();
  const parentEntity = entityUuid
    ? Records.getNodeByUuid(entityUuid)(record)
    : null;
  const validation = Validations.getValidation(record);

  const prevEntityPointer = useMemo(
    () =>
      RecordPageNavigator.getPrevEntityPointer({
        survey,
        record,
        currentEntityPointer,
      }),
    [survey, record, currentEntityPointer],
  );

  const nextEntityPointer = useMemo(
    () =>
      RecordPageNavigator.getNextEntityPointer({
        survey,
        record,
        currentEntityPointer,
      }),
    [survey, record, currentEntityPointer],
  );

  const onItemPress = useCallback(
    (index: number) =>
      dispatch(DataEntryActions.selectCurrentPageEntityActiveChildIndex(index)),
    [dispatch],
  );

  // computed once per record: rows only re-render when their own status changes
  const validationStatusByDefUuid = useMemo(() => {
    const result = new Map<string, ValidationStatus>();
    if (!parentEntity) return result;
    for (const childDef of childDefs) {
      const nodes = Records.getChildren(parentEntity, childDef.uuid)(record);
      const fieldValidations = nodes.map((node) =>
        Validations.getFieldValidation(node.uuid)(validation),
      );
      if (fieldValidations.every(Validations.isValid)) continue;
      const hasErrors = fieldValidations.some(
        Validations.calculateHasNestedErrors,
      );
      result.set(childDef.uuid, { hasErrors, hasWarnings: !hasErrors });
    }
    return result;
  }, [childDefs, parentEntity, record, validation]);

  const renderItem = useCallback(
    ({ index, item }: { index: number; item: any }) => {
      const validationStatus = validationStatusByDefUuid.get(item.uuid);
      return (
        <PageNodesListItem
          active={index === activeChildIndex}
          hasErrors={!!validationStatus?.hasErrors}
          hasWarnings={!!validationStatus?.hasWarnings}
          index={index}
          lang={lang}
          nodeDef={item}
          onPress={onItemPress}
        />
      );
    },
    [activeChildIndex, lang, onItemPress, validationStatusByDefUuid],
  );

  return (
    <VView fullFlex style={styles.container}>
      {!NodeDefs.isRoot(entityDef) && prevEntityPointer && (
        <NodePageNavigationButton
          icon="chevron-left"
          entityPointer={prevEntityPointer}
        />
      )}
      {(NodeDefs.isSingleEntity(entityDef) || entityUuid) && (
        <FlatList
          data={childDefs}
          keyExtractor={(item) => item.uuid}
          renderItem={renderItem}
          scrollEnabled
          persistentScrollbar
          style={styles.list}
        />
      )}
      {nextEntityPointer && (
        <NodePageNavigationButton
          icon="chevron-right"
          entityPointer={nextEntityPointer}
        />
      )}
    </VView>
  );
};

PageNodesListItem.displayName = "PageNodesListItem";
