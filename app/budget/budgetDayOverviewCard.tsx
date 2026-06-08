import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import DayOverviewCard from "@/components/homeDashboardCards/dayOverviewCard";
import { WeekOverview } from "@/components/homeDashboardCards/weekOverview/weekOverview";
import { HabitTracker } from "@/components/homeDashboardCards/habitTracker/habitTracker";
import { TestTile } from "@/components/ui/TestTile";
import { useGlobalStyleStore } from "@/stores/globalStyles";

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
      }}
    ></View>
  );
}

export { BudgetDayOverviewCard };
