import "react-native-get-random-values";
import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect } from "react";
import { BackgroundTaskRunner } from "@/components/utils/LocalWebView";
import { getCryptoOpsFn } from "@/components/utils/cryptoOps";
import { CryptoWorkers } from "@/components/utils/CryptoWorkers";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";

export default function Main() {
  const cryptoOpsApi = useCryptoOpsQueue();
  useEffect(() => {
    console.log("Main mounted");
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(cryptoOpsApi.performOperation("generateSymmetricKey"));
    }
  }, []);

  return (
    <>
      <CryptoWorkers></CryptoWorkers>
      <Stack.Screen options={{ title: "Oops! 2" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">whyyyy.</ThemedText>
        <Link href="/home" style={styles.link}>
          <ThemedText type="link">Go to home screen hehe</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
