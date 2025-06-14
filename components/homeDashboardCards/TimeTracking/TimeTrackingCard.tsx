import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  View,
} from "react-native";
import { ThemedView } from "../../ThemedView";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useCallback, useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { FlashList } from "@shopify/flash-list";
import {
  getUserDataKey,
  secureStoreKeyNames,
} from "../../utils/constants/secureStoreKeyNames";
import { useActiveUser } from "@/stores/activeUser";
import Text from "../../common/Text";
import Button from "../../common/Button";
import TextInput from "../../common/TextInput";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { CheckBox } from "../../common/CheckBox";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { timeTrackingChunkSize } from "../../utils/constants/chunking";
import { useNavMenuApi } from "@/stores/navMenuApi";
import { useVirtualKeyboard } from "@/stores/virtualKeyboard";
import { ArrowDeco } from "../../deco/ArrowDeco";
import { SearchIcon } from "../../deco/SearchIcon";
import { layoutAnimationsDuration } from "@/constants/animations";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import TimeTrackingVisualization from "./TimeTrackingVisualization";
import { EditDeco } from "@/components/deco/EditDeco";
import { AddIcon } from "@/components/deco/AddIcon";
import { router } from "expo-router";
//@ts-ignore
import FuzzySearch from "fuzzy-search";
import { Portal } from "react-native-portalize";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
function TimeTrackingCard() {
  const dataRetrivalAPI = dataRetrivalApi();
  const globalStyle = useGlobalStyleStore();
  const virtualKeyboardApi = useVirtualKeyboard();
  const featureConfigApi = useFeatureConfigs();
  const [isPickingActivity, setIsPickingActivity] = useState(false);
  const [hasPendingActivity, setHasPendingActivity] = useState<
    false | null | { name: string; start: number; taskID: string }
  >(null);
  const activeUserApi = useActiveUser();
  const [timeDisplayLabel, setTimeDisplayLabel] = useState("");
  const [activitySearchFilter, setActivitySearchFilter] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const customFadeInUp = useCallback((duration: number) => {
    return FadeInUp.duration(duration);
  }, []);

  const customFadeInDown = useCallback((duration: number) => {
    return FadeInDown.duration(duration);
  }, []);

  const getActivities = useCallback(() => {
    return featureConfigApi.timeTrackingFeatureConfig.filter(
      (r) => r.type === "task"
    );
  }, [featureConfigApi.timeTrackingFeatureConfig]);

  const searcher = useCallback(() => {
    const activitiesWithCategoryName = getActivities().map((r) => {
      const categoryName = getCategoryNameFromTaskObject(r).toLowerCase();
      return {
        ...r,
        itme: { ...r.itme, categoryName: categoryName },
      };
    });
    const searcher = new FuzzySearch(
      activitiesWithCategoryName,
      ["itme.name", "itme.categoryName"],
      {
        caseSensitive: false,
        sort: true,
      }
    );
    return searcher;
  }, [featureConfigApi.timeTrackingFeatureConfig]);

  useEffect(() => {
    if (activitySearchFilter.length > 0) {
      const results = searcher().search(activitySearchFilter);
      setActivities(results);
    } else {
      setActivities(getActivities());
    }
  }, [activitySearchFilter]);

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
    const menuApi = useNavMenuApi.getState();
    menuApi.setShowMenu(true);
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

  const getDisplayTimeAMPM = useCallback((unixTime: number) => {
    const date = new Date(unixTime);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format
    return `${hours}:${minutes} ${ampm}`;
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
      style={{
        backgroundColor:
          globalStyle.globalStyle.color + layoutCardLikeBackgroundOpacity,
        width: "100%",
        borderRadius: globalStyle.globalStyle.borderRadius,
        height: "20%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
              const menuApi = useNavMenuApi.getState();
              menuApi.setShowMenu(false);
              setActivitySearchFilter("");
              setIsPickingActivity(true);
            }}
            label="Pick activity"
          ></Button>
        </>
      )}
      {hasPendingActivity !== false && hasPendingActivity !== null && (
        <View
          style={{
            display: "flex",
            flexGrow: 1,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <View
            style={{
              height: "23%",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              display: "flex",
              flexDirection: "row",
              paddingLeft: 5,
              paddingRight: 5,
            }}
          >
            <Text
              fontSize={23}
              style={{ maxWidth: "58%", textAlign: "left" }}
              label={hasPendingActivity.name}
            ></Text>
            <View
              style={{
                width: "40%",
                height: "80%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 5,
              }}
            >
              <Button
                onClick={() => {
                  router.push("/timeTrackingFeatureConfig/EditActivities");
                }}
                style={{
                  width: "50%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <EditDeco height={"150%"}></EditDeco>
              </Button>
              <Button
                onClick={() => {}}
                style={{
                  width: "50%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <AddIcon height={"60%"} width={"50%"}></AddIcon>
              </Button>
            </View>
          </View>
          <View
            style={{
              height: "45%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                width: "80%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={styles.middleTextContainer}>
                <Text
                  fontSize={globalStyle.globalStyle.mediumMobileFont}
                  label="Started at"
                ></Text>
                <Text
                  label={getDisplayTimeAMPM(hasPendingActivity.start)}
                ></Text>
              </View>
              <View
                style={{
                  ...styles.middleTextContainer,
                  alignItems: "flex-end",
                }}
              >
                <Text
                  fontSize={globalStyle.globalStyle.mediumMobileFont}
                  label="Duration"
                ></Text>
                <Text label={getDisplayTime(hasPendingActivity.start)}></Text>
              </View>
            </View>
            <View
              style={{
                width: "80%",
                height: 21,
              }}
            >
              <TimeTrackingVisualization
                activityStartTime={hasPendingActivity.start}
                renderWidth={Dimensions.get("window").width * 0.8 - 10}
              ></TimeTrackingVisualization>
            </View>
          </View>
          <View
            style={{
              height: "32%",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              label="Save activity"
              style={{
                width: "80%",
                height: "80%",
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
                useNavMenuApi.getState().setShowMenu(false);
                setActivitySearchFilter("");
                setHasPendingActivity(false);
                setIsPickingActivity(true);
              }}
            ></Button>
          </View>
        </View>
      )}
    </Animated.View>
  ) : (
    <Portal>
      <SafeAreaView style={{ flexGrow: 1, width: "100%" }}>
        <LinearGradient
          colors={globalStyle.globalStyle.pageBackgroundColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 0.7 }}
          style={{
            position: "absolute",
            top: "-20%",
            left: 0,
            width: "120%",
            height: "150%",
          }}
        ></LinearGradient>
        <Animated.View
          style={{
            width: "100%",
            borderRadius: globalStyle.globalStyle.borderRadius,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bottom: 0,
            flexGrow: 1,
            paddingLeft: 5,
            paddingRight: 5,
          }}
        >
          {virtualKeyboardApi.isVisible && (
            <Animated.View
              style={{
                height: virtualKeyboardApi.keyboardHeight,
                width: "100%",
              }}
            ></Animated.View>
          )}
          <Animated.View
            style={{
              position: "relative",
              width: "100%",
              top: "0%",
              flexGrow: 1,
            }}
          >
            <FlashList
              inverted={true}
              data={activities}
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
                        zIndex: -1,
                      }}
                      backgroundColor={
                        globalStyle.globalStyle.color +
                        layoutCardLikeBackgroundOpacity
                      }
                      fontSize={15}
                      label={getCategoryNameFromTaskObject(item)}
                    ></Text>
                  </Button>
                );
              }}
            />
          </Animated.View>
          <Animated.View
            style={{
              marginTop: 5,
              height: 60,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Button
              style={{
                height: "100%",
                width: "30%",
                marginBottom: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 5,
              }}
              label=""
              onClick={() => {
                setIsPickingActivity(false);
                setActivitySearchFilter("");
                useNavMenuApi.getState().setShowMenu(true);
              }}
            >
              <ArrowDeco
                width={50}
                style={{
                  transform: [{ rotate: "180deg" }],
                  width: "60%",
                  height: "60%",
                }}
              ></ArrowDeco>
            </Button>
            <View
              style={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <TextInput
                textAlign="left"
                placeholder="Search activities or categories"
                onChange={(e) => {
                  const text = e.nativeEvent.text;
                  setActivitySearchFilter(text);
                }}
                style={{
                  height: "100%",
                  marginBottom: 0,
                  bottom: 0,
                  paddingLeft: 30,
                }}
              ></TextInput>
              <SearchIcon
                style={{ position: "absolute", left: 8, zIndex: -1 }}
              ></SearchIcon>
            </View>
          </Animated.View>
          {virtualKeyboardApi.isVisible && (
            <Animated.View
              style={{ height: 25, width: "100%" }}
            ></Animated.View>
          )}
        </Animated.View>
      </SafeAreaView>
    </Portal>
  );
}

const styles = {
  middleTextContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
};

export { TimeTrackingCard };
