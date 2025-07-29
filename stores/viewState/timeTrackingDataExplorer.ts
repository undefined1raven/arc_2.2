import { ArcTaskLogType, ARCTasksType } from "@/constants/CommonTypes";
import { create } from "zustand";
import { useFeatureConfigs } from "../featureConfigs";
import { appendColorToArrayItems } from "@/components/utils/data/appentColorToArrayItems";
import { useGlobalStyleStore } from "../globalStyles";

function processDataInTimeRange(
  data: ArcTaskLogType[],
  filteredActivities: string[]
) {
  if (Array.isArray(data) === false || data.length === 0) {
    console.warn("No data provided or data is not an array.");
    return [];
  }
  const filteredData = data.filter((log) => {
    return filteredActivities.includes(log.taskID) && log.end;
  });
  const sortedData = filteredData.sort((a, b) => {
    return a.start - b.start;
  });
  const latestFeatureConfig =
    useFeatureConfigs.getState().timeTrackingFeatureConfig;

  const timeRangeStart = sortedData[0].start;
  const timeRangeEnd = sortedData[sortedData.length - 1].end;

  // Get date range in days
  const startDate = new Date(timeRangeStart);
  const endDate = new Date(timeRangeEnd);
  const dayCount =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  // Create dataset for each activity
  const datasets = filteredActivities.map((activityId) => {
    const activityData = [];

    for (let dayOffset = 0; dayOffset < dayCount; dayOffset++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayOffset);
      const dayStart = new Date(currentDate).setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate).setHours(23, 59, 59, 999);

      // Sum duration for this activity on this day
      const dayDuration = sortedData
        .filter(
          (log) =>
            log.taskID === activityId &&
            log.start >= dayStart &&
            log.end <= dayEnd
        )
        .reduce((sum, log) => sum + (log.end - log.start), 0);

      // Convert to hours with one decimal place
      const durationInHours =
        Math.round((dayDuration / (1000 * 60 * 60)) * 10) / 10;
      const dateLabel = currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      activityData.push({ value: durationInHours, label: dateLabel });
    }
    const activityName =
      latestFeatureConfig.find(
        (activity) => activity.itme.taskID === activityId
      )?.itme.name || "Unnamed Activity";
    return { data: activityData, activityName };
  });

  const colorSet = useGlobalStyleStore.getState().globalStyle.chartColorSet;
  const finalDataSet = appendColorToArrayItems(colorSet, datasets, "color");

  return finalDataSet;
}

function getDataSetMaxValue(dataSet: any[]) {
  if (dataSet.length === 0) {
    return { maxValue: 1 };
  }
  const maxValues = dataSet.map((data) => {
    return Math.max(...data.data.map((item) => item.value));
  });
  return { maxValue: Math.max(...maxValues) }; // Adding 1 to ensure the max value is above the highest data point
}

function getChartDataProps(dataSet) {
  const keys = [];
  const data = dataSet;
  for (let ix = 0; ix < data.length; ix++) {
    if (ix === 0) {
      keys.push("data");
    } else {
      keys.push(`data${ix + 1}`);
    }
  }
  const dataProps = {};
  keys.forEach((key, index) => {
    dataProps[key] = data[index].data;
  });
  return dataProps;
}

function getChartColorProps(dataSet: any[]) {
  const colors = [];
  for (let ix = 0; ix < dataSet.length; ix++) {
    colors.push(`color${ix + 1}`);
  }
  const colorProps: { [key: string]: string } = {};
  colors.forEach((color, index) => {
    colorProps[color] = dataSet[index].color;
  });
  return colorProps;
}

function getChartPointColors(dataSet: any[]) {
  const pointColors = [];
  for (let ix = 0; ix < dataSet.length; ix++) {
    pointColors.push(`dataPointsColor${ix + 1}`);
  }
  const pointColorProps: { [key: string]: string } = {};
  pointColors.forEach((color, index) => {
    pointColorProps[color] = dataSet[index].color;
  });
  return pointColorProps;
}

interface ITimeTrackingDataExplorer {
  selectedActivities: ARCTasksType[];
  setSelectedActivities: (activities: ARCTasksType[]) => void;
  dataInTimeRange: ArcTaskLogType[] | null;
  setDataInTimeRange: (data: ArcTaskLogType[] | null) => void;
  isFetchingData: boolean;
  setIsFetchingData: (isFetching: boolean) => void;
  viewState: [];
  setViewState: (viewState: []) => void;
}

const useTimeTrackingDataExplorer = create<ITimeTrackingDataExplorer>(
  (set, get) => ({
    selectedActivities: [],
    setSelectedActivities: (activities: ARCTasksType[]) => {
      set({ selectedActivities: activities });
    },
    dataInTimeRange: null,
    setDataInTimeRange: (data: ArcTaskLogType[] | null) =>
      set({ dataInTimeRange: data }),
    isFetchingData: false,
    setIsFetchingData: (isFetching: boolean) => {
      set({ isFetchingData: isFetching });
    },
    viewState: [],
    setViewState: (viewState: []) => {
      set({ viewState: viewState });
    },
  })
);

export {
  getChartPointColors,
  useTimeTrackingDataExplorer,
  processDataInTimeRange,
  getChartDataProps,
  getChartColorProps,
  getDataSetMaxValue,
};
