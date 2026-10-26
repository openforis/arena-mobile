import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { Surveys, UserGroup, Users } from "@openforis/arena-core";

import {
  HView,
  Icon,
  Link,
  LoadingIcon,
  Text,
  ViewMoreText,
  VView,
} from "components";
import { useIsNetworkConnected } from "hooks";
import { useTranslation } from "localization";
import { SurveyStatus, UpdateStatus } from "model";
import { RemoteConnectionSelectors, SurveySelectors } from "state";
import { log } from "utils/Logger";

import {
  bannerSecondaryTextColor,
  bannerTextColor,
  HomeBanner,
} from "./HomeBanner";
import { RecordsSummaryCard } from "./RecordsSummaryCard";
import { SurveyUpdateStatusIcon } from "./SurveyUpdateStatusIcon";
import { determineSurveyUpdateStatus } from "./surveyUpdateUtils";

const styles = StyleSheet.create({
  title: { color: bannerTextColor, fontWeight: "700" },
  secondaryText: { color: bannerSecondaryTextColor },
  titleContainer: { alignItems: "center" },
  titleTextContainer: { flex: 1 },
  details: { gap: 6, paddingHorizontal: 4 },
  detailRow: { alignItems: "center", gap: 6 },
  fieldManualLink: {
    color: bannerTextColor,
    marginVertical: 0,
    textDecorationLine: "underline",
  },
});

type SelectedSurveyBannerState = {
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

export const SelectedSurveyBanner = () => {
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
  const surveyLabel = Surveys.getLabel(lang)(survey) || surveyName;
  const surveyDescription = Surveys.getDescription(lang)(survey);
  const fieldManualUrl = Surveys.getFieldManualLink(lang)(survey);
  const isDemoSurvey = SurveySelectors.useIsCurrentSurveyDemo();

  const hasQualifierDefs = Surveys.getQualifierDefs({ survey }).length > 0;
  const userGroup = SurveySelectors.useCurrentSurveyUserGroup();
  const userGroupReady = SurveySelectors.useCurrentSurveyUserGroupReady();

  const [state, setState] = useState({
    updateStatus: UpdateStatus.loading,
    errorKey: null,
  } as SelectedSurveyBannerState);
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

  const userGroupTextKey = determineUserGroupStatusKey({
    userGroupReady,
    userGroup,
  });

  const header = (
    <HView style={styles.titleContainer}>
      <VView style={styles.titleTextContainer}>
        <Text
          style={styles.secondaryText}
          textKey="home:currentSurvey"
          variant="labelSmall"
        />
        <Text style={styles.title} variant="titleLarge">
          {surveyLabel}
        </Text>
        {surveyLabel !== surveyName && (
          <Text style={styles.secondaryText} variant="bodySmall">
            {surveyName}
          </Text>
        )}
      </VView>
      {!isDemoSurvey && (
        <SurveyUpdateStatusIcon
          errorKey={errorKey}
          onPress={determineStatus}
          updateStatus={updateStatus}
        />
      )}
    </HView>
  );

  const showUserRole = !!user && !!userRoleName;
  const showUserGroup = hasQualifierDefs && !!user;
  const hasDetails =
    !!surveyDescription || !!fieldManualUrl || showUserRole || showUserGroup;

  return (
    <HomeBanner header={header}>
      {hasDetails && (
        <VView style={styles.details}>
          {surveyDescription && (
            <ViewMoreText numberOfLines={2} textStyle={styles.secondaryText}>
              <Text style={styles.secondaryText} variant="bodyMedium">
                {surveyDescription}
              </Text>
            </ViewMoreText>
          )}
          {fieldManualUrl && (
            <HView style={styles.detailRow}>
              <Icon
                color={bannerTextColor}
                size={18}
                source="book-open-variant"
              />
              <Link
                labelKey="surveys:fieldManual"
                style={styles.fieldManualLink}
                url={fieldManualUrl}
              />
            </HView>
          )}
          {showUserRole && (
            <HView style={styles.detailRow}>
              <Icon color={bannerTextColor} size={18} source="account-key" />
              <Text
                style={styles.secondaryText}
                textKey="surveys:role.label"
                textParams={{
                  role: t(`surveys:authGroupName.${userRoleName}`),
                }}
              />
            </HView>
          )}
          {showUserGroup && (
            <HView style={styles.detailRow}>
              {userGroupReady ? (
                <Icon
                  color={bannerTextColor}
                  size={18}
                  source={userGroup ? "account-group" : "account-off"}
                />
              ) : (
                <LoadingIcon />
              )}
              <Text
                style={styles.secondaryText}
                textKey={userGroupTextKey}
                textParams={
                  userGroupReady && userGroup
                    ? { name: userGroup.props.name }
                    : undefined
                }
              />
            </HView>
          )}
        </VView>
      )}
      <RecordsSummaryCard />
    </HomeBanner>
  );
};
