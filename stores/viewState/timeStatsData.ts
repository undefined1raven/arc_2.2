import { ArcTaskLogType, TessDayLogType } from "@/constants/CommonTypes";
import { create } from "zustand";

interface TimeStatsData {
  dataInTimeRange: ArcTaskLogType[] | null;
  viewRange: string[];
  setDataInTimeRange: (data: ArcTaskLogType[]) => void;
  activeDayView: string | null;
  setActiveDayView: (day: string | null) => void;
  isFetchingData: boolean;
  setIsFetchingData: (isFetching: boolean) => void;
}

const useTimeStatsData = create<TimeStatsData>((set, get) => ({
  dataInTimeRange: null,
  viewRange: [],
  activeDayView: null,
  isFetchingData: false,
  setIsFetchingData: (isFetching: boolean) => {
    set({ isFetchingData: isFetching });
  },
  setActiveDayView: (day: string | null) => {
    set({ activeDayView: day });
  },
  setDataInTimeRange: (data: ArcTaskLogType[]) => {
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
