import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { computeDayPlannerCompletion } from "../utils/dataProcessing/computeDayPlannerCompletion";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import Text from "../common/Text";
import Button from "../common/Button";
import { useRouter } from "expo-router";
import { EditDeco } from "../deco/EditDeco";
import { countDoneTasksInDay } from "../utils/dataProcessing/countDoneTasksInDay";
import { getColorFromDayCompletion } from "../utils/dataProcessing/getColorFromDayCompletion";

function DayOverviewCard() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const dayPlannerActiveDay = useDayPlannerActiveDay((dp) => dp.activeDay);
  const [dayCompletion, setDayCompletion] = useState<null | number>(null);
  const [highPriorityTasksLeft, setHighPriorityTasksLeft] = useState<
    null | number
  >(0);
  const [numberOfCompletedTasks, setNumberOfCompletedTasks] = useState<
    null | number
  >(null);
  const [taskCount, setTaskCount] = useState<null | number>(null);
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (state) => state.dayPlannerFeatureConfig,
  );
  const router = useRouter();

  const progressBarColors = useMemo(() => {
    if (dayCompletion === null) {
      return { textColor: globalStyle.textColor, color: globalStyle.color };
    }
    return getColorFromDayCompletion(dayCompletion);
  }, [dayCompletion, globalStyle]);

  useEffect(() => {
    if (dayPlannerActiveDay === null || dayPlannerActiveDay === undefined) {
      return;
    }
    const dayCompletion = computeDayPlannerCompletion(
      dayPlannerFeatureConfig,
      dayPlannerActiveDay,
    );
    const completedTasks = countDoneTasksInDay(
      dayPlannerFeatureConfig,
      dayPlannerActiveDay,
    );
    setTaskCount(dayPlannerActiveDay.tasks.length);
    setNumberOfCompletedTasks(completedTasks);
    setDayCompletion(dayCompletion);
  }, [dayPlannerActiveDay]);

  return dayPlannerActiveDay === null ? null : (
    <View
      style={{
        width: "100%",
        height: "20%",
        borderTopWidth: 1,
        borderTopColor: globalStyle.color + "80",
        borderRadius: globalStyle.borderRadius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {dayCompletion === null && (
        <ActivityIndicator
          size={"small"}
          color={globalStyle.color}
        ></ActivityIndicator>
      )}
      {dayCompletion !== null && dayPlannerActiveDay !== null && (
        <View
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
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
              top: 0,
            }}
          >
            <Text
              fontSize={12}
              style={{ maxWidth: "58%", textAlign: "left" }}
              label="Day Overview"
            ></Text>
            <View
              style={{
                width: "40%",
                height: "80%",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                flexDirection: "row",
                gap: 5,
              }}
            >
              <Button
                onClick={() => {
                  router.push("/dayPlanner/statusEditor/statusEditor");
                }}
                backgroundColor={globalStyle.colorAccent + "15"}
                style={{
                  width: "50%",
                  height: "100%",
                  display: "flex",
                  borderColor: globalStyle.colorAccent,
                  justifyContent: "center",
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                  alignItems: "center",
                }}
              >
                <EditDeco
                  color={globalStyle.colorAccent}
                  height={"150%"}
                ></EditDeco>
              </Button>
              <Button
                onClick={() => {
                  router.push("/dayPlanner/dayPlanner");
                }}
                fontSize={globalStyle.smallMobileFont}
                label="View More"
                backgroundColor={globalStyle.colorAccent + "15"}
                style={{
                  width: "50%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                  alignItems: "center",
                }}
              ></Button>
            </View>
          </View>
          <View
            style={{
              width: "100%",
              height: "40%",
              paddingTop: 5,
              paddingBottom: 5,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                width: "100%",
                height: "50%",
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingLeft: 5,
                paddingRight: 5,
                gap: 15,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: globalStyle.color,
                  borderRadius: 3,
                  left: 5,
                }}
              ></View>
              <Text
                fontSize={globalStyle.mediumMobileFont}
                label={`${numberOfCompletedTasks}/${taskCount} tasks completed`}
              ></Text>
            </View>
            <View
              style={{
                width: "100%",
                height: "50%",
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingLeft: 5,
                paddingRight: 5,
                gap: 15,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor:
                    highPriorityTasksLeft === 0 ||
                    highPriorityTasksLeft === null
                      ? globalStyle.colorAccent
                      : globalStyle.errorColor,
                  borderRadius: 3,
                  left: 5,
                  transform:
                    highPriorityTasksLeft === 0 ||
                    highPriorityTasksLeft === null
                      ? []
                      : [{ rotate: "45deg" }],
                }}
              ></View>
              <Text
                color={
                  highPriorityTasksLeft === 0 || highPriorityTasksLeft === null
                    ? globalStyle.textColorAccent
                    : globalStyle.errorColor
                }
                fontSize={globalStyle.mediumMobileFont}
                label={`${
                  highPriorityTasksLeft === 0 || highPriorityTasksLeft === null
                    ? "No high priority tasks remaining"
                    : `${highPriorityTasksLeft} high priority tasks left`
                }`}
              ></Text>
            </View>
          </View>
          <View
            style={{
              width: "100%",
              height: "37%",
              display: "flex",
              flexDirection: "column",
              paddingTop: 5,
              paddingBottom: 5,
            }}
          >
            <View
              style={{
                width: "100%",
                flex: 1,
                paddingBottom: 0,
                padding: 10,
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: globalStyle.borderRadius,
                  backgroundColor: globalStyle.colorAccent + "40",
                }}
              >
                <View
                  style={{
                    width: `${dayCompletion}%`,
                    height: "100%",
                    backgroundColor: progressBarColors.color,
                  }}
                ></View>
              </View>
            </View>
            <View
              style={{
                width: "100%",
                flex: 1,
                paddingLeft: 10,
                paddingRight: 10,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                color={progressBarColors.textColor}
                fontSize={globalStyle.mediumMobileFont}
                label={`${dayCompletion}%`}
              ></Text>
              <Text
                color={globalStyle.colorAccent}
                fontSize={globalStyle.mediumMobileFont}
                label=""
              ></Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default DayOverviewCard;
