type Tables = "arc" | "dayPlanner" | "personalNotes" | "noteGroups";

const chunkingConfig = {
  arc: {
    chunkSize: 4,
    table: "arcChunks",
  },
  dayPlanner: {
    chunkSize: 100,
    table: "dayPlannerChunks",
  },
  personalNotes: {
    chunkSize: 100,
    table: "personalNotesChunks",
  },
  noteGroups: {
    chunkSize: 100,
    table: "noteGroupsChunks",
  },
};
