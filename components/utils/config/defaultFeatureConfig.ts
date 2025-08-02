import { randomUUID } from "expo-crypto";
import themeColors from "@/constants/colors";
import {
  FeatureConfigArcType,
  FeatureConfigSIDType,
  FeatureConfigTessType,
  FeatureConfigType,
} from "@/constants/CommonTypes";

const randomCatIDs = {
  selfCare: randomUUID(),
  social: randomUUID(),
  relaxation: randomUUID(),
  meal: randomUUID(),
  workout: randomUUID(),
};

const arcDefaultConfig: FeatureConfigArcType = [
  {
    itme: {
      taskID: `TID-${randomUUID()}`,
      name: "Sleeping",
      deleted: false,
      version: "0.1.0",
      categoryID: randomCatIDs.selfCare,
      routineConfig: {
        enabledDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: false,
        timeConfig: [{ start: "22:00", end: "05:00" }],
      },
      isSpecialStatus: false,
    },
    type: "task",
  },
  {
    itme: {
      taskID: `TID-${randomUUID()}`,
      name: "Breakfast",
      deleted: false,
      version: "0.1.0",
      categoryID: randomCatIDs.meal,
      routineConfig: {
        enabledDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: false,
        timeConfig: null,
      },
      isSpecialStatus: false,
    },
    type: "task",
  },
  {
    itme: {
      taskID: `TID-${randomUUID()}`,
      name: "Dinner",
      deleted: false,
      version: "0.1.0",
      categoryID: randomCatIDs.meal,
      routineConfig: {
        enabledDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: false,
        timeConfig: null,
      },
      isSpecialStatus: false,
    },
    type: "task",
  },
  {
    itme: {
      taskID: `TID-${randomUUID()}`,
      name: "Walk",
      deleted: false,
      version: "0.1.0",
      categoryID: randomCatIDs.workout,
      routineConfig: {
        enabledDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: false,
        timeConfig: null,
      },
      isSpecialStatus: false,
    },
    type: "task",
  },
  {
    itme: {
      taskID: `TID-${randomUUID()}`,
      name: "Running",
      deleted: false,
      version: "0.1.0",
      categoryID: randomCatIDs.workout,
      routineConfig: {
        enabledDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: false,
        timeConfig: null,
      },
      isSpecialStatus: false,
    },
    type: "task",
  },
  {
    itme: {
      taskID: `TID-${randomUUID()}`,
      name: "Shower",
      deleted: false,
      version: "0.1.0",
      categoryID: randomCatIDs.selfCare,
      routineConfig: {
        enabledDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: false,
        timeConfig: null,
      },
      isSpecialStatus: false,
    },
    type: "task",
  },
  {
    itme: {
      taskID: `TID-${randomUUID()}`,
      name: "Hanging Out",
      deleted: false,
      version: "0.1.0",
      categoryID: randomCatIDs.social,
      routineConfig: {
        enabledDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: false,
        timeConfig: null,
      },
      isSpecialStatus: false,
    },
    type: "task",
  },
  {
    itme: {
      taskID: `TID-${randomUUID()}`,
      name: "Skin Care",
      deleted: false,
      version: "0.1.0",
      categoryID: randomCatIDs.selfCare,
      routineConfig: {
        enabledDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: false,
        timeConfig: null,
      },
      isSpecialStatus: false,
    },
    type: "task",
  },
  {
    itme: {
      categoryID: randomCatIDs.selfCare,
      name: "Self-care",
      version: "0.1.0",
      deleted: false,
    },
    type: "taskCategory",
  },
  {
    itme: {
      categoryID: randomCatIDs.social,
      name: "Social",
      version: "0.1.0",
      deleted: false,
    },
    type: "taskCategory",
  },
  {
    itme: {
      categoryID: randomCatIDs.relaxation,
      name: "Relaxation",
      version: "0.1.0",
      deleted: false,
    },
    type: "taskCategory",
  },
  {
    itme: {
      categoryID: randomCatIDs.meal,
      name: "Meal",
      version: "0.1.0",
      deleted: false,
    },
    type: "taskCategory",
  },
  {
    itme: {
      categoryID: randomCatIDs.workout,
      name: "Workout",
      version: "0.1.0",
      deleted: false,
    },
    type: "taskCategory",
  },
];
const tessDefaultConfig: FeatureConfigTessType = [
  {
    statusID: "SID-000000-0000-0000-000001",
    name: "To Do",
    completionEffect: 0,
    version: "0.1.1",
    deleted: false,
    colors: {
      cloudy: {
        light: {
          color: themeColors.cloudy.light.color,
          textColor: themeColors.cloudy.light.textColor,
        },
        dark: {
          color: themeColors.cloudy.dark.color,
          textColor: themeColors.cloudy.dark.textColor,
        },
      },
    },
  },
  {
    statusID: "SID-000000-0000-0000-000002",
    name: "Completed",
    completionEffect: 1,
    version: "0.1.1",
    deleted: false,
    colors: {
      cloudy: {
        light: {
          color: themeColors.cloudy.light.successColor,
          textColor: themeColors.cloudy.light.successTextColor,
        },
        dark: {
          color: themeColors.cloudy.dark.successColor,
          textColor: themeColors.cloudy.dark.successTextColor,
        },
      },
    },
  },

  {
    statusID: "SID-000000-0000-0000-000003",
    name: "Incomplete",
    completionEffect: 0.5,
    version: "0.1.1",
    deleted: false,
    colors: {
      cloudy: {
        light: {
          color: "#DBE03F",
          textColor: "#846732",
        },
        dark: {
          color: "#3C3E09",
          textColor: "#3C3E09",
        },
      },
    },
  },

  {
    statusID: "SID-000000-0000-0000-000004",
    name: "Failed",
    completionEffect: 0,
    version: "0.1.1",
    deleted: false,
    colors: {
      cloudy: {
        light: {
          color: themeColors.cloudy.light.errorColor,
          textColor: themeColors.cloudy.light.errorTextColor,
        },
        dark: {
          color: themeColors.cloudy.dark.errorColor,
          textColor: themeColors.cloudy.dark.errorTextColor,
        },
      },
    },
  },
  {
    statusID: "SID-000000-0000-0000-000005",
    name: "In Progress",
    completionEffect: 0.1,
    version: "0.1.1",
    deleted: false,
    colors: {
      cloudy: {
        light: {
          color: "#3D0861",
          textColor: "#3D0861",
        },
        dark: {
          color: "#BE79EC",
          textColor: "#BE79EC",
        },
      },
    },
  },
];

const sidDefaultConfig: FeatureConfigSIDType = {
  moodArray: [],
  pinProtected: false,
};

const defaultFeatureConfig: FeatureConfigType = {
  tess: tessDefaultConfig,
  arc: arcDefaultConfig,
  sid: sidDefaultConfig,
};

export { defaultFeatureConfig };
