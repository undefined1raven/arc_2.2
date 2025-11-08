import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { TimeTrackingCard } from "@/components/homeDashboardCards/TimeTracking/TimeTrackingCard";
import { AfterInteractions } from "react-native-interactions";
import { HabitCard } from "@/components/homeDashboardCards/TimeTracking/habitCard";
import { useEffect } from "react";
import { requestAuthChallengeStack } from "@/components/utils/auth/authStackRequest";
import {
  checkAndSetDeviceId,
  getDeviceId,
} from "@/components/utils/auth/getDeviceId";
import axios from "axios";
import { API_URL } from "@/constants/API_URL";
import { APP_ID } from "@/constants/app_id";
import { useActiveUser } from "@/stores/activeUser";
import { getAuthToken } from "@/components/utils/auth/getAuthToken";
import * as SecureStore from "expo-secure-store";
import {
  authChallengeStack,
  deviceId,
} from "@/components/utils/constants/secureStoreKeyNames";
import { authenticatedApiRequest } from "@/components/utils/api/apiRequest";

function Home() {
  return (
    <>
      <ThemedView
        keyboardDismissMode={false}
        style={{ ...styles.container, height: "100%" }}
      >
        <AfterInteractions>
          <HabitCard></HabitCard>
        </AfterInteractions>
        <TimeTrackingCard></TimeTrackingCard>
      </ThemedView>
    </>
  );
}
export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: 5,
    paddingRight: 5,
    gap: 5,
    top: 0,
  },
});
