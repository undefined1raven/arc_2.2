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
  )
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
          width: "100%",
          height: 35,
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
        <Text
          fontSize={globalStyle.mediumMobileFont}
          label={`${formatDateToMonthDay(streakItem.date)}${
            streakItem.duration > 0
              ? ` | ${formatDuration(streakItem.duration)}`
              : ""
          }`}
        />
      </View>
    );
  }
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
        height: "100%",
        zIndex: -1,
        width: 180,
        borderRightWidth: 1,
        marginRight: 5,
        borderRightColor: globalStyle.color,
      }}
    >
      <Text
        style={{ width: "100%", position: "relative", left: -7 }}
        textAlign="left"
        label={item.activityName}
      />
      <View>
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
  )
);

const HabitCard = memo(() => {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const timeTrackingFC = useFeatureConfigs((r) => r.timeTrackingFeatureConfig);
  const habitCardDataApi = useHabitCardDataApi();
  const habitCardTrackedIds = useHabitCardDataApi((r) => r.trackedIds);
  const activeUserId = useActiveUser((state) => state.activeUser.userId);

  // Memoized utility functions
  const getDateFromTimestamp = useCallback((timestamp: number) => {
    return new Date(timestamp).toISOString().split("T")[0];
  }, []);

  const formatDateToMonthDay = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  }, []);

  const formatDuration = useCallback((seconds: number): string => {
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} mins`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }, []);

  // Memoized constants
  const timeConstants = useMemo(
    () => ({
      twoWeeksAgo: Date.now() - 120 * 24 * 60 * 60 * 1000,
      twoWeeksAgoA: Date.now() - 14 * 24 * 60 * 60 * 1000,
    }),
    []
  );

  // Memoized task map for O(1) lookups
  const taskMap = useMemo(() => {
    const map = new Map();
    timeTrackingFC.forEach((task) => {
      map.set(task.itme.taskID, task);
    });
    return map;
  }, [timeTrackingFC]);

  // Load stored data
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const data = await AsyncStorage.getItem(
          `${activeUserId}-habitCardData`
        );
        if (data) {
          const parsedData: string[] = JSON.parse(data);
          const habitDataApi = useHabitCardDataApi.getState();
          habitDataApi.setTrackedIds(parsedData);
        } else {
          habitCardDataApi.setTrackedIds(null);
        }
        habitCardDataApi.setHasTrackedIds(true);
      } catch (error) {
        console.error("Error loading habit card data:", error);
      }
    };

    loadStoredData();
  }, [activeUserId]);

  const getHabitData = useCallback(
    (trackedIds: string[]) => {
      const dataRetrivalAPI = dataRetrivalApi.getState();
      if (!trackedIds || trackedIds.length === 0) {
        return;
      }
      dataRetrivalAPI
        .getDataInTimeRange(
          "timeTrackingChunks",
          timeConstants.twoWeeksAgo,
          null,
          null
        )
        .then((data) => {
          const habitData: HabitCardDataType = [];
          // Filter and sort data once
          const filteredData = data.payload
            .filter(
              (t: any) =>
                t.start > timeConstants.twoWeeksAgoA &&
                trackedIds.includes(t.taskID)
            )
            .sort((a: any, b: any) => a.start - b.start);

          // Process data more efficiently
          const habitMap = new Map();

          for (const item of filteredData) {
            const task = taskMap.get(item.taskID);
            if (!task) continue;

            const activityName = task.itme.name;
            const activityDuration = Math.floor((item.end - item.start) / 1000);
            const activityDate = getDateFromTimestamp(item.start);

            if (!habitMap.has(activityName)) {
              habitMap.set(activityName, new Map());
            }

            const streakMap = habitMap.get(activityName);
            const currentDuration = streakMap.get(activityDate) || 0;
            streakMap.set(activityDate, currentDuration + activityDuration);
          }

          // Add empty habits for tracked IDs without data
          for (const taskId of trackedIds) {
            const task = taskMap.get(taskId);
            if (task && !habitMap.has(task.itme.name)) {
              habitMap.set(task.itme.name, new Map());
            }
          }

          // Convert to final format and fill blank days
          const startDate = new Date(timeConstants.twoWeeksAgoA);
          const endDate = new Date();

          for (const [activityName, streakMap] of habitMap) {
            const streakData = [];
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
              const dateString = currentDate.toISOString().split("T")[0];
              const duration = streakMap.get(dateString) || 0;
              streakData.push({ date: dateString, duration });
              currentDate.setDate(currentDate.getDate() + 1);
            }

            habitData.push({ activityName, streakData });
          }
          habitCardDataApi.setHasLoadedData(true);
          habitCardDataApi.setDerivedData(habitData);
        })
        .catch((error) => {
          console.error("Error retrieving habit data:", error);
        });
    },
    [
      timeConstants,
      taskMap,
      getDateFromTimestamp,
      habitCardDataApi.setHasLoadedData,
    ]
  );

  useEffect(() => {
    if (
      habitCardTrackedIds?.length > 0 &&
      habitCardDataApi.derivedData === null
    ) {
      getHabitData(habitCardTrackedIds);
    }
  }, [habitCardDataApi.derivedData, habitCardTrackedIds, getHabitData]);

  // Memoized selection handler
  const handleSelection = useCallback(
    async (taskIds: string[]) => {
      const stringified = JSON.stringify(taskIds);
      const habitDataApi = useHabitCardDataApi.getState();
      habitDataApi.setTrackedIds(taskIds);
      getHabitData(taskIds);

      try {
        await AsyncStorage.setItem(
          `${activeUserId}-habitCardData`,
          stringified
        );
      } catch (error) {
        console.error("Error saving habit card data:", error);
      }
    },
    [activeUserId, getHabitData]
  );

  // Memoized filtered tasks
  const filteredTasks = useMemo(
    () => timeTrackingFC.filter((r) => r.type === "task"),
    [timeTrackingFC]
  );

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
    [globalStyle, formatDateToMonthDay, formatDuration]
  );

  const keyExtractor = useCallback((item: any) => item.activityName, []);

  return (
    <SafeAreaView
      style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: globalStyle.borderRadius,
        width: "100%",
        position: "relative",
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
        habitCardDataApi.trackedIds === null && (
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
      {habitCardDataApi.derivedData !== null && (
        <>
          <View
            style={{
              top: -50,
              height: 20,
              marginLeft: 5,
              marginRight: 5,
              marginTop: 5,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <Text
              label="Habit Tracker"
              fontSize={globalStyle.regularMobileFont}
            />
            <Selection
              onMultiSelection={handleSelection}
              values={filteredTasks || []}
              labelKeys={["itme", "name"]}
              multiselectMatchKeys={["itme", "taskID"]}
              value={habitCardTrackedIds || []}
              multiselect={true}
              customSelectionButton={(props: { onClick: () => void }) => (
                <Button
                  onClick={props.onClick}
                  style={{
                    height: 30,
                    width: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EditDeco />
                </Button>
              )}
            />
          </View>
          <View
            style={{
              top: -30,
              width: "100%",
              display: "flex",
              flexGrow: 1,
            }}
          >
            <FlatList
              data={habitCardDataApi.derivedData}
              horizontal={true}
              extraData={habitCardTrackedIds}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              getItemLayout={(data, index) => ({
                length: 180,
                offset: 180 * index,
                index,
              })}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
});

export { HabitCard };
