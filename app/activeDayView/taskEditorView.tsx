import { FeatureConfigBooleanInput } from "@/components/ui/FeatureConfigBooleanInput copy";
import FeatureConfigEmptySettingPage from "@/components/ui/FeatureConfigEmptySettingPage";
import { FeatureConfigSelection } from "@/components/ui/FeatureConfigSelection";
import { FeatureConfigValueInput } from "@/components/ui/FeatureConfigValueInput";
import {
  TessDayLogType,
  TessStatusType,
  TessTaskType,
} from "@/constants/CommonTypes";
import { dataRetrivalApi } from "@/stores/dataRetriavalApi";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { useDayPlannerActiveDay } from "@/stores/viewState/dayPlannerActiveDay";
import { useDayPlannerTaskToEdit } from "@/stores/viewState/dayPlannerTaskToEdit";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { debounce } from "lodash";

function TaskEditorView() {
  const dayPlannerTaskToEdit = useDayPlannerTaskToEdit((r) => r.taskToEdit);
  const dayPlannerSetTaskToEdit = useDayPlannerTaskToEdit(
    (r) => r.setTaskToEdit,
  );
  const dayPlannerFeatureConfig = useFeatureConfigs(
    (f) => f.dayPlannerFeatureConfig,
  );
  const dayPlannerRecentDaysApi = useDayPlannerActiveDay();
  const dataRetriavalAPI = dataRetrivalApi();

  const debouncedUpdateTaskNameRef = useRef<
    | (((name: string) => void) & { cancel: () => void; flush: () => void })
    | null
  >(null);

  const updateRecentDaysWithUpdatedDay = useCallback(
    (updatedDay: TessDayLogType) => {
      const currentRecentDays = useDayPlannerActiveDay.getState().recentDays;
      if (Array.isArray(currentRecentDays) === false) {
        return;
      }
      const newDayPlannerRecentDays = [...currentRecentDays];
      const newDate = new Date();
      const formattedTodayDate = newDate.toDateString();

      const currentDayIndex = newDayPlannerRecentDays.findIndex(
        (dayLog) => dayLog.day === formattedTodayDate,
      );

      if (currentDayIndex === -1) {
        return;
      } else {
        newDayPlannerRecentDays.splice(currentDayIndex, 1, updatedDay);
        dayPlannerRecentDaysApi.setRecentDays(newDayPlannerRecentDays);
      }
    },
    [],
  );

  useEffect(() => {
    debouncedUpdateTaskNameRef.current = debounce((newName: string) => {
      const activeDay = useDayPlannerActiveDay.getState().activeDay;
      const taskToEdit = useDayPlannerTaskToEdit.getState().taskToEdit;
      if (!activeDay || !taskToEdit) return;

      const updatedTask: TessTaskType = {
        ...taskToEdit,
        name: newName,
      };

      dayPlannerSetTaskToEdit(updatedTask);

      const updatedTasks = activeDay.tasks.map((t) =>
        t.TTID === taskToEdit.TTID ? updatedTask : t,
      );

      const updatedDay = {
        ...activeDay,
        tasks: updatedTasks,
      };

      useDayPlannerActiveDay.getState().setActiveDay(updatedDay);
      updateRecentDaysWithUpdatedDay(updatedDay);
      dataRetriavalAPI
        .modifyEntry(
          "dayPlannerChunks",
          ["day"],
          updatedDay.day,
          updatedDay,
          undefined,
          "replace",
        )
        .then((r) => {
          console.log("Task name updated", r);
        })
        .catch((e) => {
          console.log("Error updating task name", e);
        });
    }, 1500);

    return () => {
      debouncedUpdateTaskNameRef.current?.cancel();
    };
  }, [dataRetriavalAPI, updateRecentDaysWithUpdatedDay]);

  const updateHighPrioLabel = useCallback(
    (isHighPrio: boolean) => {
      debouncedUpdateTaskNameRef.current?.flush();

      const activeDay = useDayPlannerActiveDay.getState().activeDay;
      const taskToEdit = useDayPlannerTaskToEdit.getState().taskToEdit;
      if (
        activeDay === undefined ||
        activeDay === null ||
        typeof taskToEdit?.TTID !== "string"
      ) {
        return;
      }

      const taskIndex = activeDay.tasks.findIndex(
        (task) => task.TTID === taskToEdit.TTID,
      );
      if (taskIndex === -1) {
        return;
      }

      let currentTask = activeDay.tasks[taskIndex];

      if (isHighPrio === false) {
        currentTask = {
          ...currentTask,
          labels: currentTask.labels.filter((l) => l !== "highPriority"),
        };
      } else {
        currentTask = {
          ...currentTask,
          labels: [...currentTask.labels, "highPriority"],
        };
      }

      dayPlannerSetTaskToEdit(currentTask);
      const updatedTasks = [...activeDay.tasks];
      updatedTasks[taskIndex] = currentTask;
      const updatedDay = {
        ...activeDay,
        tasks: updatedTasks,
      };
      useDayPlannerActiveDay.getState().setActiveDay(updatedDay);
      updateRecentDaysWithUpdatedDay(updatedDay);
      dataRetriavalAPI
        .modifyEntry(
          "dayPlannerChunks",
          ["day"],
          updatedDay.day,
          updatedDay,
          undefined,
          "replace",
        )
        .then((r) => {
          console.log("Task status updated", r);
        })
        .catch((e) => {
          console.error("Error updating task status", e);
        });
    },
    [dataRetriavalAPI, updateRecentDaysWithUpdatedDay],
  );

  const updateTaskStatus = useCallback(
    (statusID: string) => {
      debouncedUpdateTaskNameRef.current?.flush();

      const activeDay = useDayPlannerActiveDay.getState().activeDay;
      const taskToEdit = useDayPlannerTaskToEdit.getState().taskToEdit;
      if (
        activeDay === undefined ||
        activeDay === null ||
        typeof statusID !== "string" ||
        typeof taskToEdit?.TTID !== "string"
      ) {
        return;
      }
      const taskIndex = activeDay.tasks.findIndex(
        (task) => task.TTID === taskToEdit.TTID,
      );
      if (taskIndex === -1) {
        return;
      }
      const updatedTask: TessTaskType = {
        ...activeDay.tasks[taskIndex],
        statusID: statusID,
      };
      dayPlannerSetTaskToEdit(updatedTask);
      const updatedTasks = [...activeDay.tasks];
      updatedTasks[taskIndex] = updatedTask;
      const updatedDay = {
        ...activeDay,
        tasks: updatedTasks,
      };
      useDayPlannerActiveDay.getState().setActiveDay(updatedDay);
      updateRecentDaysWithUpdatedDay(updatedDay);
      dataRetriavalAPI
        .modifyEntry(
          "dayPlannerChunks",
          ["day"],
          updatedDay.day,
          updatedDay,
          undefined,
          "replace",
        )
        .then((r) => {
          console.log("Task status updated", r);
        })
        .catch((e) => {
          console.error("Error updating task status", e);
        });
    },
    [dataRetriavalAPI, updateRecentDaysWithUpdatedDay],
  );

  const updateTaskName = (name: string) => {
    debouncedUpdateTaskNameRef.current?.(name);
  };

  return (
    <FeatureConfigEmptySettingPage
      bottomHeaderButtonLabel=""
      bottomHeaderButtonOnPress={() => {
        router.back();
      }}
      bototmHeaderLabel="Edit task"
    >
      <FeatureConfigBooleanInput
        value={dayPlannerTaskToEdit?.labels.indexOf("highPriority") !== -1}
        label="High Priority"
        onChange={(e) => {
          updateHighPrioLabel(e);
        }}
      ></FeatureConfigBooleanInput>
      <FeatureConfigValueInput
        inputType="text"
        label="Name"
        value={dayPlannerTaskToEdit?.name || ""}
        onChange={(e) => {
          updateTaskName(e);
        }}
      ></FeatureConfigValueInput>
      <FeatureConfigSelection
        onChange={(status: TessStatusType) => {
          const newStatusId = status.statusID;
          updateTaskStatus(newStatusId);
        }}
        labelKeys={["name"]}
        value={
          dayPlannerFeatureConfig.find(
            (r) => r.statusID === dayPlannerTaskToEdit?.statusID,
          ) || "Unknown"
        }
        label="Status"
        values={dayPlannerFeatureConfig.filter((r) => r.deleted === false)}
      ></FeatureConfigSelection>
    </FeatureConfigEmptySettingPage>
  );
}

export default TaskEditorView;
