import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

import { Surveys, UserGroup, Users } from "@openforis/arena-core";

import {
  Button,
  Card,
  HView,
  Icon,
  LoadingIcon,
  Link,
  Text,
  ViewMoreText,
  VView,
} from "components";
import { useIsNetworkConnected } from "hooks";
import { useTranslation } from "localization";
import { SurveyStatus, UpdateStatus } from "model";
import { SurveyService } from "service";
import { RemoteConnectionSelectors, SurveySelectors } from "state";
import { log } from "utils/Logger";

import { screenKeys } from "../screenKeys";
import { SurveyUpdateStatusIcon } from "./SurveyUpdateStatusIcon";
import { determineSurveyUpdateStatus } from "./surveyUpdateUtils";

import styles from "./selectedSurveyContainerStyles";

type SelectedSurveyContainerState = {
  updateStatus: UpdateStatus | SurveyStatus;
  errorKey?: string | null;
};

const determineUserGroupStatusKey = ({
  userGroupReady,
  userGroup,
}: {
  userGroupReady: boolean;
  userGroup: UserGroup | null;
}) => {
  if (userGroupReady) {
    if (userGroup) {
      return "surveys:userGroup.label";
    }
    return "surveys:userGroup.none";
  }
  return "surveys:userGroup.fetching";
};

export const SelectedSurveyContainer = () => {
  const navigation = useNavigation();
  const networkAvailable = useIsNetworkConnected();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const { t } = useTranslation();

  const survey = SurveySelectors.useCurrentSurvey()!;
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const userAuthGroup = user
    ? Users.getAuthGroupBySurveyUuid(survey?.uuid, true)(user)
    : undefined;
  const userRoleName = userAuthGroup?.name;

  const surveyName = Surveys.getName(survey);
  const surveyLabelInDefaultLanguage = Surveys.getLabel(lang)(survey);
  const surveyTitle = surveyLabelInDefaultLanguage
    ? `${surveyLabelInDefaultLanguage} [${surveyName}]`
    : surveyName;
  const surveyDescription = Surveys.getDescription(lang)(survey);
  const fieldManualUrl = Surveys.getFieldManualLink(lang)(survey);
  const isDemoSurvey = survey?.uuid === SurveyService.demoSurveyUuid;

  const hasQualifierDefs = Surveys.getQualifierDefs({ survey }).length > 0;
  const userGroup = SurveySelectors.useCurrentSurveyUserGroup();
  const userGroupReady = SurveySelectors.useCurrentSurveyUserGroupReady();

  const [state, setState] = useState({
    updateStatus: UpdateStatus.loading,
    errorKey: null,
  } as SelectedSurveyContainerState);
  const { updateStatus, errorKey } = state;

  const fetchStatus = useCallback(async () => {
    if (!survey) {
      return;
    }

    return determineSurveyUpdateStatus({
      networkAvailable,
      survey,
      surveyName,
      user,
    });
  }, [networkAvailable, survey, surveyName, user]);

  const determineStatus = useCallback(async () => {
    const nextState = await fetchStatus();

    if (nextState) {
      setState(nextState);
    }
  }, [fetchStatus]);

  useEffect(() => {
    let cancelled = false;

    fetchStatus()
      .then((nextState) => {
        if (!cancelled && nextState) {
          setState(nextState);
        }
      })
      .catch((error) => {
        log.error("Failed to determine survey update status:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchStatus]);

  if (!survey) return null;

  let userGroupTextKey = determineUserGroupStatusKey({
    userGroupReady,
    userGroup,
  });

  return (
    <Card style={styles.container}>
      <VView style={styles.internalContainer} transparent>
        <HView style={styles.surveyTitleContainer} transparent>
          <Text style={styles.surveyTitle} variant="titleMedium">
            {surveyTitle}
          </Text>
          {!isDemoSurvey && (
            <SurveyUpdateStatusIcon
              onPress={determineStatus}
              updateStatus={updateStatus}
              errorKey={errorKey}
            />
          )}
        </HView>
        {surveyDescription && (
          <ViewMoreText numberOfLines={1}>
            <Text variant="titleSmall">{surveyDescription}</Text>
          </ViewMoreText>
        )}
        {fieldManualUrl && (
          <Link labelKey="surveys:fieldManual" url={fieldManualUrl} />
        )}
        {user && userRoleName && (
          <HView style={styles.userGroupContainer} transparent>
            <Icon source="account-key" />
            <Text
              textKey="surveys:role.label"
              textParams={{ role: t(`surveys:authGroupName.${userRoleName}`) }}
            />
          </HView>
        )}
        {hasQualifierDefs && user && (
          <HView style={styles.userGroupContainer} transparent>
            {userGroupReady ? (
              <Icon source={userGroup ? "account-group" : "account-off"} />
            ) : (
              <LoadingIcon />
            )}
            <Text
              textKey={userGroupTextKey}
              textParams={
                userGroupReady && userGroup
                  ? { name: userGroup.props.name }
                  : undefined
              }
            />
          </HView>
        )}
        <Button
          labelVariant="bodyLarge"
          style={styles.goToDataEntryButton}
          textKey="dataEntry:goToDataEntry"
          onPress={() => navigation.navigate(screenKeys.recordsList as never)}
        />
      </VView>
    </Card>
  );
};
