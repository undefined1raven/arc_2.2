import Button from "@/components/common/Button";
import { Selection } from "@/components/common/Selection";
import Text from "@/components/common/Text";
import { EditDeco } from "@/components/deco/EditDeco";
import { HexDeco } from "@/components/deco/HexDeco";
import { StrikeThroughHex } from "@/components/deco/StrikeThroughHex";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { AfterInteractions } from "react-native-interactions";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import {
  HabitCardDataType,
  useHabitCardDataApi,
} from "@/stores/viewState/habitCardData";
import { memo, useCallback, useEffect, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useActiveUser } from "@/stores/activeUser";
import { AddIcon } from "@/components/deco/AddIcon";

// Memoized components
const HabitIcon = memo(
  ({
    hasDoneActivity,
    globalStyle,
  }: {
    hasDoneActivity: boolean;
    globalStyle: any;
  }) => (
    <View style={{ marginLeft: 5, marginRight: 5, height: 20, width: 20 }}>
      {hasDoneActivity ? (
        <HexDeco width={20} height={20} color={globalStyle.successColor} />
      ) : (
        <StrikeThroughHex width={20} height={20} color={globalStyle.color} />
      )}
    </View>
  ),
);

const StreakItem = memo(
  ({
    streakItem,
    globalStyle,
    formatDateToMonthDay,
    formatDuration,
  }: {
    streakItem: any;
    globalStyle: any;
    formatDateToMonthDay: (date: string) => string;
    formatDuration: (seconds: number) => string;
  }) => {
    const hasDoneActivity = streakItem.duration > 0;

    return (
      <View
        style={{
          height: 50,

          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingBottom: 5,
        }}
      >
        <HabitIcon
          hasDoneActivity={hasDoneActivity}
          globalStyle={globalStyle}
        />
      </View>
    );
  },
);

const HabitItem = memo(
  ({
    item,
    globalStyle,
    formatDateToMonthDay,
    formatDuration,
  }: {
    item: any;
    globalStyle: any;
    formatDateToMonthDay: (date: string) => string;
    formatDuration: (seconds: number) => string;
  }) => (
    <View
      style={{
        userSelect: "none",
        height: 75,
        zIndex: -1,
        width: "100%",
        marginRight: 5,
      }}
    >
      <Text
        style={{ width: "100%", position: "relative", left: -7 }}
        textAlign="left"
        color={globalStyle.accentTextColor}
        label={item.activityName}
      />
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
        }}
      >
        {item.streakData.map((streakItem: any) => (
          <StreakItem
            key={streakItem.date}
            streakItem={streakItem}
            globalStyle={globalStyle}
            formatDateToMonthDay={formatDateToMonthDay}
            formatDuration={formatDuration}
          />
        ))}
      </View>
    </View>
  ),
);

const HabitCard = memo(() => {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const timeTrackingFC = useFeatureConfigs((r) => r.timeTrackingFeatureConfig);
  const habitCardDataApi = useHabitCardDataApi();
  const habitCardTrackedIds = useHabitCardDataApi((r) => r.trackedIds);
  const activeUserId = useActiveUser((state) => state.activeUser.userId);

  // Memoized render item
  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <HabitItem
        item={item}
        globalStyle={globalStyle}
        formatDateToMonthDay={formatDateToMonthDay}
        formatDuration={formatDuration}
      />
    ),
    [globalStyle, formatDateToMonthDay, formatDuration],
  );

  const keyExtractor = useCallback((item: any) => item.activityName, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        borderRadius: globalStyle.borderRadius,
        width: "100%",
        gap: 5,
        backgroundColor: globalStyle.color + layoutCardLikeBackgroundOpacity,
      }}
    >
      {habitCardDataApi.derivedData === null &&
        habitCardDataApi.hasLoadedData === false &&
        habitCardDataApi.hasTrackedIds === false && (
          <ActivityIndicator color={globalStyle.color} />
        )}
      {habitCardDataApi.derivedData === null &&
        habitCardDataApi.hasLoadedData === true && (
          <>
            <Text
              style={{ zIndex: 1 }}
              label="No Data"
              color={globalStyle.errorColor}
              fontSize={globalStyle.mediumMobileFont}
            />
            <AddIcon
              width={30}
              height={15}
              color={globalStyle.errorColor}
              style={{ zIndex: 1, transform: [{ rotate: "45deg" }] }}
            />
            <AddIcon
              width={"50%"}
              height={150}
              color={globalStyle.errorColor + "08"}
              style={{
                zIndex: 0,
                position: "absolute",
                transform: [{ rotate: "45deg" }],
              }}
            />
          </>
        )}

      {habitCardDataApi.hasTrackedIds === true &&
        (habitCardDataApi.trackedIds === null ||
          habitCardDataApi.trackedIds?.length === 0) && (
          <Selection
            onMultiSelection={handleSelection}
            values={filteredTasks || []}
            labelKeys={["itme", "name"]}
            multiselectMatchKeys={["itme", "taskID"]}
            value={habitCardTrackedIds || []}
            multiselect={true}
            customSelectionButton={(props: { onClick: () => void }) => (
              <Button
                fontSize={globalStyle.regularMobileFont}
                label="Tap to choose activities to track habits for"
                onClick={props.onClick}
                style={{
                  height: "100%",
                  paddingLeft: 10,
                  paddingRight: 10,
                  width: "100%",
                  display: "flex",
                  borderWidth: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ></Button>
            )}
          />
        )}
      {habitCardDataApi.derivedData !== null && <></>}
      <View
        style={{
          flex: 1,
          position: "absolute",
          paddingLeft: 5,
          paddingRight: 5,
          marginTop: 5,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Text label="Habit Tracker" fontSize={globalStyle.regularMobileFont} />
      </View>
      <View
        style={{
          width: "100%",
          height: "80%",
          display: "flex",
          flexGrow: 1,
        }}
      >
        <FlatList
          data={habitCardDataApi.derivedData}
          extraData={habitCardTrackedIds}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
        />
      </View>
    </SafeAreaView>
  );
});

export { HabitCard };
