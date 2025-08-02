import {
  ARCCategoryType,
  ArcTaskLogType,
  ARCTasksType,
  TessDayLogType,
} from "@/constants/CommonTypes";
import { create } from "zustand";
import { useFeatureConfigs } from "../featureConfigs";
import { useGlobalStyleStore } from "../globalStyles";
import { appendColorToArrayItems } from "@/components/utils/data/appentColorToArrayItems";

interface TimeStatsData {
  dataInTimeRange: ArcTaskLogType[] | null;
  viewRange: string[];
  setDataInTimeRange: (data: ArcTaskLogType[]) => void;
  activeDayView: string | null;
  setActiveDayView: (day: string | null) => void;
  derivedActiveDayData: { categoryBreakdown: any[] } | null;
  isFetchingData: boolean;
  setIsFetchingData: (isFetching: boolean) => void;
}

const useTimeStatsData = create<TimeStatsData>((set, get) => ({
  dataInTimeRange: null,
  derivedActiveDayData: null,
  viewRange: [],
  activeDayView: null,
  isFetchingData: false,
  setIsFetchingData: (isFetching: boolean) => {
    set({ isFetchingData: isFetching });
  },
  setActiveDayView: (day: string | null) => {
    if (day) {
      const dayStart = new Date(day + "T00:00:00");
      const dayEnd = new Date(day + "T23:59:59.999");

      ////[Start] Derive the active day data
      const activeDayData =
        get().dataInTimeRange?.filter((item) => {
          const itemDate = new Date(item.start);
          return itemDate >= dayStart && itemDate <= dayEnd;
        }) || [];

      if (activeDayData.length === 0) {
        set({ derivedActiveDayData: null });
      } else {
        const timeTrackingFeatureConfig =
          useFeatureConfigs.getState().timeTrackingFeatureConfig;

        function getTaskCategory(log: ArcTaskLogType) {
          if (timeTrackingFeatureConfig) {
            const task = timeTrackingFeatureConfig.find(
              (t: ARCTasksType) => t.itme.taskID === log.taskID
            );
            if (!task) return "Uncategorized";
            const taskCategoryId = task.itme.categoryID;
            if (!taskCategoryId) {
              return "Uncategorized";
            }
            const category = timeTrackingFeatureConfig.find(
              (c: ARCCategoryType) =>
                c.itme.categoryID === taskCategoryId ||
                c.itme.id === taskCategoryId
            );
            if (category) return category.itme.name;
          }
          return "Uncategorized";
        }

        const dayCategoryBreakdownByDuration: Record<string, number> = {};

        activeDayData.forEach((task) => {
          const duration = task.end ? task.end - task.start : 0;
          const category = getTaskCategory(task);

          if (!dayCategoryBreakdownByDuration[category]) {
            dayCategoryBreakdownByDuration[category] = 0;
          }
          dayCategoryBreakdownByDuration[category] += duration;

          const numberOfMsInDay = 24 * 60 * 60 * 1000;

          const dayCategoryBreakdownByPercentage: {
            value: number;
            label: string;
            duration: number;
          }[] = [];

          for (const [category, duration] of Object.entries(
            dayCategoryBreakdownByDuration
          )) {
            dayCategoryBreakdownByPercentage.push({
              value: Math.round((duration / numberOfMsInDay) * 100),
              label: category,
              duration,
            });
          }

          const totalPercentage = dayCategoryBreakdownByPercentage.reduce(
            (sum, item) => sum + item.value,
            0
          );
          const uncategorizedPercentage = 100 - totalPercentage;

          if (uncategorizedPercentage > 0) {
            dayCategoryBreakdownByPercentage.push({
              value: uncategorizedPercentage,
              label: "Uncategorized",
              duration: (uncategorizedPercentage * numberOfMsInDay) / 100,
            });
          }

          //Append colors to it from the color set
          const colorSet =
            useGlobalStyleStore.getState().globalStyle.chartColorSet;

          const dayCategoryBreakdownByPercentageWithColors =
            appendColorToArrayItems(
              colorSet,
              dayCategoryBreakdownByPercentage,
              "color"
            );

          dayCategoryBreakdownByPercentageWithColors.sort(
            (a, b) => b.value - a.value
          );

          set({
            derivedActiveDayData: {
              categoryBreakdown: dayCategoryBreakdownByPercentageWithColors,
            },
          });
        });
      }
    } else {
      set({ derivedActiveDayData: null });
    }
    ////[End] Derive the active day data

    set({ activeDayView: day });
  },
  setDataInTimeRange: (data: ArcTaskLogType[]) => {
    if (data.length === 0) {
      return;
    }
    const dataStartDay = new Date(data[0]?.start).toISOString().split("T")[0];
    const dataEndDay = new Date(data[data.length - 1]?.start)
      .toISOString()
      .split("T")[0];

    const dateRange = [];
    const startDate = new Date(dataStartDay);
    const endDate = new Date(dataEndDay);

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      dateRange.push(date.toISOString().split("T")[0]);
    }
    dateRange.shift();

    set({ viewRange: dateRange.reverse() });
    set({ dataInTimeRange: data });
  },
}));

export { useTimeStatsData };
