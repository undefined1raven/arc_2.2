import { AvailableThemes, Themes } from "./colors";

export type ColorValueHex = `#${string}`;
export type FontSize =
  | "normal"
  | "small"
  | "smallx2"
  | "smallx3"
  | "large"
  | "largex2"
  | "largex3";
export type AlignType = "top" | "left" | "right" | "bottom";
export type PageBackgroundColorArrayType = ColorValueHex[];

type UserDataKeys = "currentActivities" | "currentMood";
type UserDataValues = {
  currentActivities: { taskID: string; tx: number }[];
  currentMood: { moodID: string; tx: number };
};

type BasicColorsType = {
  color: ColorValueHex;
  colorAccent?: ColorValueHex;
  textColor: ColorValueHex;
  textColorAccent?: ColorValueHex;
};

type ArcTaskLogType = {
  taskID: string;
  start: number;
  end: number | null;
};

type TessTaskType = {
  TTID: string;
  statusID: TessStatusType["statusID"];
  labels: TessLabelType["labelID"][];
  description: string;
  name: string;
  doRemind: boolean;
  start: number;
  end: number;
  deleted: boolean;
  version: "0.1.0";
};

type TessDayLogType = {
  day: string;
  isActive?: boolean;
  tasks: TessTaskType[];
};

type ARCTasksType = {
  itme: {
    taskID: string;
    name: string;
    routineConfig: {
      enabledDays: number[];
      isActive: boolean;
      timeConfig: { start: string; end: string }[] | null;
    };
    deleted: boolean;
    version: "0.1.0";
    categoryID: null | string;
    isSpecialStatus: boolean;
  };
  type: "task";
};
type ARCCategoryType = {
  categoryID: string;
  name: string;
  deleted: boolean;
  version: "0.1.0";
};
type FeatureConfigArcType = {
  tasks: ARCTasksType[];
  taskCategories: ARCCategoryType[];
};

type TessStatusType = {
  statusID: string;
  name: string;
  deleted: boolean;
  version: "0.1.1";
  colors: {
    [key in AvailableThemes]: {
      light: { [key in keyof BasicColorsType]: ColorValueHex };
      dark: { [key in keyof BasicColorsType]: ColorValueHex };
    };
  };
  completionEffect: number;
};

type TessLabelType = {
  labelID: string;
  name: string;
  colors: {
    [key in AvailableThemes]: {
      light: { [key in keyof BasicColorsType]: ColorValueHex };
      dark: { [key in keyof BasicColorsType]: ColorValueHex };
    };
  };
  deleted: boolean;
  version: "0.1.1";
  completionMultiplier: Function;
};
export type DayClassifierType = {
  dayClassID: string;
  threshold: number;
  colors: {
    [key in AvailableThemes]: {
      light: { [key in keyof BasicColorsType]: ColorValueHex };
      dark: { [key in keyof BasicColorsType]: ColorValueHex };
    };
  };
  label: string;
  version: "0.1.1";
};

type FeatureConfigTessType = {
  statusArray: TessStatusType[];
  labelArray: TessLabelType[];
  dayClassifier: DayClassifierType[];
  pinProtected: boolean;
};

type SIDMoodType = {
  moodID: string;
  name: string;
  deleted: boolean;
  version: "0.1.0";
  lightColor: ColorValueHex;
  textLightColor: ColorValueHex;
  darkColor: ColorValueHex;
  textDarkColor: ColorValueHex;
  score: number;
};
type FeatureConfigSIDType = { moodArray: SIDMoodType[]; pinProtected: boolean };

type FeatureConfigType = {
  arc: FeatureConfigArcType;
  tess: FeatureConfigTessType;
  sid: FeatureConfigSIDType;
};

type UserData = {
  id: string;
  signupTime: string;
  publicKey: string;
  passwordHash: string | null;
  emailAddress: string | null;
  passkeys: string | null;
  PIKBackup: string | null;
  PSKBackup: string | null;
  RCKBackup: string | null;
  trustedDevices: string | null;
  oauthState: string | null;
  securityLogs: string | null;
  arcFeatureConfig: string;
  SIDFeatureConfig: string;
  tessFeatureConfig: string;
  version: "0.1.0";
};

type localDBError = { code: string }; //currently uselessp

type FeatureConfigChunkType = {
  id: string;
  userID: string;
  encryptedContent: string;
  tx: number;
  version: "0.1.1";
  type: "timeTracking" | "dayPlanner" | "personalDiary";
};

type ARC_ChunksType = {
  id: string;
  userID: string;
  encryptedContent: string;
  tx: number;
  version: "0.1.1";
};

type Tess_ChunksType = {
  id: string;
  userID: string;
  encryptedContent: string;
  tx: number;
  version: "0.1.1";
};

type SID_ChunksType = {
  id: string;
  userID: string;
  encryptedContent: string;
  tx: number;
  version: "0.1.1";
};

type SIDGroups_ChunksType = {
  id: string;
  userID: string;
  encryptedContent: string;
  tx: number;
  version: "0.1.1";
};

type SIDGroupType = {
  groupID: string;
  name: string;
  type: "person" | "genericGroup";
  version: "0.1.1";
  metadata: {
    ring: number | null;
    alias: string;
    SID: string | null; //status id
    createdAt?: number;
  };
  deleted?: boolean;
};

type SIDNoteType = {
  noteID: string;
  groupID: string;
  version: "0.1.1";
  content: string;
  metdata: {
    readOnly: boolean;
    title: string;
    createdAt: number;
    updatedAt: number;
  };
};

export type {
  ARCTasksType,
  ARCCategoryType,
  TessStatusType,
  SIDNoteType,
  TessLabelType,
  TessDayLogType,
  SIDMoodType,
  SID_ChunksType,
  Tess_ChunksType,
  SIDGroupType,
  SIDGroups_ChunksType,
  ARC_ChunksType,
  FeatureConfigChunkType,
  FeatureConfigType,
  UserData,
  FeatureConfigArcType,
  FeatureConfigTessType,
  FeatureConfigSIDType,
  UserDataKeys,
  TessTaskType,
  ArcTaskLogType,
  UserDataValues,
};
