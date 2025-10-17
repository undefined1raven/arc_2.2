import { API_URL } from "@/constants/API_URL";
import { APP_ID } from "@/constants/app_id";
import { useActiveUser } from "@/stores/activeUser";
import axios from "axios";

function processAndSaveChallengeStack(challengeStack: string[]) {}

function requestAuthChallengeStack() {
  const activeUserId = useActiveUser.getState().activeUser?.userId || null;
  if (typeof activeUserId !== "string") {
    console.log(
      "No active user ID found. Cannot request auth challenge stack."
    );
    return;
  }
  console.log("Requesting auth challenge stack...");
  axios
    .post(`${API_URL}/auth/requestChallengeStack`, {
      data: { appID: APP_ID, accountID: activeUserId },
    })
    .then((response) => {
      const responseData = response.data;
      console.log(responseData.challenges.length);
      processAndSaveChallengeStack(responseData.challengeStack);
    })
    .catch((error) => {
      console.log("Error requesting auth challenge stack:", error);
    });
}

function getChallengeResponse() {}

export { requestAuthChallengeStack, getChallengeResponse };
