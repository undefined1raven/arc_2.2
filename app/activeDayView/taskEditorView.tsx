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
import { useCallback } from "react";
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
  const dayPlannerActiveDay = useDayPlannerActiveDay(
    (store) => store.activeDay,
  );

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

  const updateHighPrioLabel = useCallback(
    (isHighPrio: boolean) => {
      if (
        dayPlannerActiveDay === undefined ||
        dayPlannerActiveDay === null ||
        typeof dayPlannerTaskToEdit?.TTID !== "string"
      ) {
        return;
      }
      const taskIndex = dayPlannerActiveDay.tasks.findIndex(
        (task) => task.TTID === dayPlannerTaskToEdit?.TTID,
      );
      if (taskIndex === -1) {
        return;
      }
      let currentTask = dayPlannerActiveDay.tasks[taskIndex];

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
      const updatedTasks = [...dayPlannerActiveDay.tasks];
      updatedTasks[taskIndex] = currentTask;
      const updatedDay = {
        ...dayPlannerActiveDay,
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
    [dayPlannerTaskToEdit],
  );

  const updateTaskStatus = useCallback(
    (statusID: string) => {
      if (
        dayPlannerActiveDay === undefined ||
        dayPlannerActiveDay === null ||
        typeof statusID !== "string" ||
        typeof dayPlannerTaskToEdit?.TTID !== "string"
      ) {
        return;
      }
      const taskIndex = dayPlannerActiveDay.tasks.findIndex(
        (task) => task.TTID === dayPlannerTaskToEdit?.TTID,
      );
      if (taskIndex === -1) {
        return;
      }
      const updatedTask: TessTaskType = {
        ...dayPlannerActiveDay.tasks[taskIndex],
        statusID: statusID,
      };
      dayPlannerSetTaskToEdit(updatedTask);
      const updatedTasks = [...dayPlannerActiveDay.tasks];
      updatedTasks[taskIndex] = updatedTask;
      const updatedDay = {
        ...dayPlannerActiveDay,
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
    [dayPlannerTaskToEdit],
  );

  const debouncedUpdateTaskName = useCallback(
    debounce((e) => {
      if (!dayPlannerActiveDay || !dayPlannerTaskToEdit) return;
      const newName = e;

      const updatedTask: TessTaskType = {
        ...dayPlannerTaskToEdit,
        name: newName,
      };

      const updatedTasks = dayPlannerActiveDay?.tasks.map((t) =>
        t.TTID === dayPlannerTaskToEdit.TTID ? updatedTask : t,
      );

      if (!updatedTasks) {
        return;
      }
      const updatedDay = {
        ...dayPlannerActiveDay,
        tasks: updatedTasks,
      };

      useDayPlannerActiveDay
        .getState()
        //@ts-ignore
        .setActiveDay(updatedDay);

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
    }, 500),
    [dayPlannerTaskToEdit],
  );

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
          debouncedUpdateTaskName(e);
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
        values={dayPlannerFeatureConfig}
      ></FeatureConfigSelection>
    </FeatureConfigEmptySettingPage>
  );
}

export default TaskEditorView;
