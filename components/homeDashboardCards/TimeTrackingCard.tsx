import { ActivityIndicator, BackHandler, View } from "react-native";
import { ThemedView } from "../ThemedView";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useCallback, useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { FlashList } from "@shopify/flash-list";
import {
  getUserDataKey,
  secureStoreKeyNames,
} from "../utils/constants/secureStoreKeyNames";
import { useActiveUser } from "@/stores/activeUser";
import Text from "../common/Text";
import Button from "../common/Button";
import TextInput from "../common/TextInput";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { CheckBox } from "../common/CheckBox";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { timeTrackingChunkSize } from "../utils/constants/chunking";
function TimeTrackingCard() {
  const dataRetrivalAPI = dataRetrivalApi();
  const globalStyle = useGlobalStyleStore();
  const featureConfigApi = useFeatureConfigs();
  const [isPickingActivity, setIsPickingActivity] = useState(false);
  const [hasPendingActivity, setHasPendingActivity] = useState<
    false | null | { name: string; start: number; taskID: string }
  >(null);
  const activeUserApi = useActiveUser();
  const [timeDisplayLabel, setTimeDisplayLabel] = useState("");
  const [activitySearchFilter, setActivitySearchFilter] = useState("");

  useEffect(() => {
    if (hasPendingActivity !== null && hasPendingActivity !== false) {
      const startTime = hasPendingActivity.start;
      const interval = setInterval(() => {
        setTimeDisplayLabel(getDisplayTime(startTime));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [hasPendingActivity]);

  const startActivity = useCallback((task: any) => {
    if (!activeUserApi.activeUser.userId) {
      console.error("No active user");
      return;
    }
    const taskID = task.itme.taskID;
    const startTime = Date.now();

    const userDataPayload = {
      taskID: taskID,
      startTime: startTime,
    };

    setHasPendingActivity({
      start: startTime,
      name:
        featureConfigApi.timeTrackingFeatureConfig.find(
          (r) => r.itme.taskID === taskID
        )?.itme.name || "Unknown",
      taskID: taskID,
    });

    SecureStore.setItemAsync(
      getUserDataKey(
        activeUserApi.activeUser.userId,
        secureStoreKeyNames.userDataKeys.timeTrackingActiveTask
      ),
      JSON.stringify(userDataPayload)
    );

    setIsPickingActivity(false);
  }, []);

  const getDisplayTime = useCallback((startTime: number) => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const seconds = Math.floor((elapsedTime / 1000) % 60)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60)
      .toString()
      .padStart(2, "0");
    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));

    return hours > 0
      ? `${hours}:${minutes}:${seconds}`
      : `${minutes}:${seconds}`;
  }, []);

  useEffect(() => {
    const activeUser = activeUserApi.activeUser.userId;
    if (!activeUser) {
      return;
    }
    const pendingActivity = SecureStore.getItem(
      getUserDataKey(
        activeUser,
        secureStoreKeyNames.userDataKeys.timeTrackingActiveTask
      )
    );
    if (pendingActivity === null) {
      setHasPendingActivity(false);
    } else {
      const parsedActivity = JSON.parse(pendingActivity);
      if (typeof parsedActivity === "object") {
        setHasPendingActivity({
          start: parsedActivity.startTime,
          name:
            featureConfigApi.timeTrackingFeatureConfig.find(
              (r) => r.itme.taskID === parsedActivity.taskID
            )?.itme.name || "Unknown",
          taskID: parsedActivity.taskID,
        });
      }
    }
  }, []);

  const getCategoryNameFromTaskObject = useCallback(
    (taskObject) => {
      const categories = featureConfigApi.timeTrackingFeatureConfig.filter(
        (r) => r.type === "taskCategory"
      );
      const catId = taskObject.itme.categoryID;
      const category = categories.find(
        (r) => r.itme.categoryID === catId || r.itme.id === catId
      );
      if (category) {
        return category.itme.name;
      } else {
        return "Unknown";
      }
    },
    [featureConfigApi.timeTrackingFeatureConfig]
  );

  return isPickingActivity === false ? (
    <Animated.View
      entering={FadeInDown}
      style={{
        backgroundColor: globalStyle.globalStyle.color + "20",
        width: "100%",
        borderRadius: globalStyle.globalStyle.borderRadius,
        height: "20%",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bottom: 50,
      }}
    >
      {hasPendingActivity === null && (
        <ActivityIndicator
          color={globalStyle.globalStyle.color}
        ></ActivityIndicator>
      )}
      {hasPendingActivity === false && (
        <>
          <Text label="Pick an activity to keep track of your time"></Text>
          <Button
            textStyle={{
              fontSize: 21,
            }}
            style={{ marginTop: "5%", height: "35%", width: "90%" }}
            onClick={() => {
              setIsPickingActivity(true);
            }}
            label="Pick activity"
          ></Button>
        </>
      )}
      {hasPendingActivity !== false && hasPendingActivity !== null && (
        <>
          <Text
            style={{ position: "absolute", left: 10, top: "35%" }}
            label={hasPendingActivity.name}
          ></Text>
          <Text
            style={{ position: "absolute", left: 10, top: "51%" }}
            label={timeDisplayLabel}
          ></Text>
          <Button
            label="Done"
            style={{
              position: "absolute",
              height: "35%",
              width: "20%",
              right: 10,
            }}
            onClick={() => {
              if (activeUserApi.activeUser.userId === null) {
                console.error("No active user");
                return;
              }
              const newTaskRow = {
                start: hasPendingActivity.start,
                taskID: hasPendingActivity.taskID,
                end: Date.now(),
              };
              dataRetrivalAPI
                .appendEntry(
                  "timeTrackingChunks",
                  newTaskRow,
                  timeTrackingChunkSize
                )
                .then((res) => {})
                .catch((err) => {});
              SecureStore.deleteItemAsync(
                getUserDataKey(
                  activeUserApi.activeUser.userId,
                  secureStoreKeyNames.userDataKeys.timeTrackingActiveTask
                )
              );
              setHasPendingActivity(false);
              setIsPickingActivity(true);
            }}
          ></Button>
        </>
      )}
    </Animated.View>
  ) : (
    <Animated.View
      entering={FadeIn}
      style={{
        width: "100%",
        borderRadius: globalStyle.globalStyle.borderRadius,
        height: "100%",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bottom: 50,
      }}
    >
      <Animated.View style={{ height: "85%", width: "100%" }}>
        <TextInput
          textAlign="left"
          placeholder="Search activities or categories"
          onChange={(e) => {
            const text = e.nativeEvent.text;
            setActivitySearchFilter(text);
          }}
          style={{ height: "7%", width: "100%", marginBottom: 10 }}
        ></TextInput>
        <FlashList
          data={featureConfigApi.timeTrackingFeatureConfig.filter((r) => {
            const isTask = r.type === "task";
            if (!isTask) {
              return false;
            }
            if (activitySearchFilter.length > 0) {
              const searchText = activitySearchFilter.toLowerCase();
              const name = r.itme.name.toLowerCase();
              const categoryName =
                getCategoryNameFromTaskObject(r).toLowerCase();
              return (
                isTask &&
                (name.includes(searchText) || categoryName.includes(searchText))
              );
            } else {
              return isTask;
            }
          })}
          estimatedItemSize={55}
          renderItem={({ item }) => {
            return (
              <Button
                textStyle={{ textAlign: "left", paddingLeft: 10 }}
                onClick={() => {
                  startActivity(item);
                }}
                style={{
                  height: 55,
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                label={item.itme.name}
              >
                <Text
                  style={{
                    width: "35%",
                    position: "absolute",
                    right: 10,
                    paddingBottom: 3,
                    paddingTop: 3,
                  }}
                  backgroundColor={globalStyle.globalStyle.color + "20"}
                  fontSize={15}
                  label={getCategoryNameFromTaskObject(item)}
                ></Text>
              </Button>
            );
          }}
        />
      </Animated.View>
      <Button
        textStyle={{
          fontSize: 21,
        }}
        style={{ marginTop: "5%", height: "8%", width: "100%" }}
        onClick={() => {
          setIsPickingActivity(false);
        }}
        label="Back"
      ></Button>
    </Animated.View>
  );
}

export { TimeTrackingCard };
