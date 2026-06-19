import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import DayOverviewCard from "@/components/homeDashboardCards/dayOverviewCard";
import { WeekOverview } from "@/components/homeDashboardCards/weekOverview/weekOverview";
import { HabitTracker } from "@/components/homeDashboardCards/habitTracker/habitTracker";
import { TestTile } from "@/components/ui/TestTile";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Button from "@/components/common/Button";
import { EditDeco } from "@/components/deco/EditDeco";
import { router } from "expo-router";
import { StatsDeco } from "@/components/deco/StatsDeco";

function BudgetDayOverviewCard() {
  const globalStyle = useGlobalStyleStore((s) => s.globalStyle);

  return (
    <View
      style={{
        paddingRight: 5,
        paddingLeft: 5,
        width: "100%",
        borderRadius: globalStyle.borderRadius,
        height: "20%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderTopColor: globalStyle.colorAccent + "80",
        borderTopWidth: 1,
        gap: 5,
      }}
    >
      <View
        style={{
          height: 30,
          width: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <Button
          onClick={() => {
            router.push("/timeTrackingFeatureConfig/EditActivities");
          }}
          backgroundColor={globalStyle.colorAccent + "15"}
          style={{
            width: "20%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            alignItems: "center",
          }}
        >
          <EditDeco height={"150%"}></EditDeco>
        </Button>
      </View>
      <View
        style={{ height: 50, width: "100%", backgroundColor: "red" }}
      ></View>
      <View
        style={{
          height: 46,
          width: "100%",
          justifyContent: "center",
          display: "flex",
          flexDirection: "row",
          gap: 15,
        }}
      >
        <Button
          style={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={async () => {}}
        >
          <StatsDeco width={15} height={25}></StatsDeco>
        </Button>
        <Button
          backgroundColor={globalStyle.color + "20"}
          label="Log Transaction"
          style={{
            flexGrow: 1,
            width: "60%",
          }}
          onClick={async () => {}}
        ></Button>
      </View>
      <View></View>
    </View>
  );
}

export { BudgetDayOverviewCard };
