import { useEffect } from "react";
import { checkChunkTableAndComputeHash } from "./hashColumnMigrationScript";

function HashColumnMigration() {
  useEffect(() => {
    /////IMPORTANT: IT IS IMPERATIVE TO RUN THAT FUNCTION SEQUENTIALLY FOR EACH TABLE. RUNNING IT IN PARALLEL WILL RESULT IN SOME CHUNKS NOT GETTING THEIR HASH SAVED DUE TO SOME CONUCRENCY ISSUE WITH SQLITE
    async function callFn() {
      await checkChunkTableAndComputeHash("timeTrackingChunks");
      await checkChunkTableAndComputeHash("dayPlannerChunks");
      await checkChunkTableAndComputeHash("personalDiaryChunks");
      await checkChunkTableAndComputeHash("personalDiaryGroups");
      await checkChunkTableAndComputeHash("featureConfigChunks");
    }
    callFn();
  }, []);

  return null;
}

export { HashColumnMigration };
