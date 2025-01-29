import { useCallback, useMemo } from "react";
import { FlatList } from "react-native";
import { useDispatch } from "react-redux";
import { List } from "react-native-paper";

import {
  NodeDefType,
  NodeDefs,
  Records,
  Validations,
} from "@openforis/arena-core";

import { AlertIcon, VView } from "components";
import { RecordPageNavigator, ValidationUtils } from "model";
import { DataEntryActions, DataEntrySelectors, SurveySelectors } from "state";

import { NodePageNavigationButton } from "../BottomNavigationBar/NodePageNavigationButton";

import styles from "./styles";

const iconByNodeDefType = {
  [NodeDefType.boolean]: () => "checkbox-marked-outline",
  [NodeDefType.code]: () => "format-list-numbered",
  [NodeDefType.coordinate]: () => "map-marker-outline",
  [NodeDefType.date]: () => "calendar-range",
  [NodeDefType.decimal]: () => "decimal",
  [NodeDefType.entity]: ({ nodeDef }) =>
    NodeDefs.isSingle(nodeDef) ? "window-maximize" : "table",
  [NodeDefType.file]: () => "file-outline",
  [NodeDefType.integer]: () => "numeric",
  [NodeDefType.taxon]: () => "tree-outline",
  [NodeDefType.text]: () => "format-text",
  [NodeDefType.time]: () => "clock-time-three-outline",
};

const getNodeDefIcon = (nodeDef) =>
  iconByNodeDefType[nodeDef.type]?.({ nodeDef });

export const PageNodesList = () => {
  const dispatch = useDispatch();

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
    [survey, record, currentEntityPointer]
  );

  const nextEntityPointer = useMemo(
    () =>
      RecordPageNavigator.getNextEntityPointer({
        survey,
        record,
        currentEntityPointer,
      }),
    [survey, record, currentEntityPointer]
  );

  const onItemPress = useCallback(
    (index) => () =>
      dispatch(DataEntryActions.selectCurrentPageEntityActiveChildIndex(index)),
    [dispatch]
  );

  const renderItemLeftIcon = useCallback(
    ({ item, ...otherProps }) => (
      <List.Icon {...otherProps} icon={getNodeDefIcon(item)} />
    ),
    []
  );

  const renderItemRightIcon = useCallback(
    ({ item }) => {
      const nodeDefUuid = item.uuid;
      const nodes = Records.getChildren(parentEntity, nodeDefUuid)(record);
      const fieldValidations = nodes.map((node) =>
        Validations.getFieldValidation(node.uuid)(validation)
      );
      if (
        fieldValidations.length === 0 ||
        fieldValidations.every(ValidationUtils.isValid)
      )
        return null;
      const hasErrors = fieldValidations.some(ValidationUtils.hasNestedErrors);
      const hasWarnings = !hasErrors;
      return <AlertIcon hasErrors={hasErrors} hasWarnings={hasWarnings} />;
    },
    [parentEntity, record, validation]
  );

  const renderItem = useCallback(
    ({ index, item }) => {
      const isActiveItem = index === activeChildIndex;

      return (
        <List.Item
          title={NodeDefs.getLabelOrName(item, lang)}
          onPress={onItemPress(index)}
          left={(iconProps) => renderItemLeftIcon({ ...iconProps, item })}
          right={(iconProps) => renderItemRightIcon({ ...iconProps, item })}
          style={isActiveItem ? styles.activeItem : undefined}
          titleStyle={isActiveItem ? styles.activeItemText : undefined}
        />
      );
    },
    [
      activeChildIndex,
      lang,
      onItemPress,
      renderItemLeftIcon,
      renderItemRightIcon,
    ]
  );

  return (
    <VView fullFlex style={styles.container} transparent>
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
          style={{ flex: 1 }}
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
