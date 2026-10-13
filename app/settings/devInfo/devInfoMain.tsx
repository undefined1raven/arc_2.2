import { ActivityIndicator } from "react-native";
import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useCallback, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { FlashList } from "@shopify/flash-list";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import Text from "@/components/common/Text";
import Button from "@/components/common/Button";
import { useSyncLog } from "@/stores/sync/syncOps";
import { ArrowDeco } from "@/components/deco/ArrowDeco";

function devInfoMain() {
  const [listData, setListData] = useState<
    {
      tableName: string;
      hash: string;
      id: string;
      encryptedContentLen: number;
    }[]
  >([]);
  const globalStyle = useGlobalStyleStore((gs) => gs.globalStyle);
  const db = useSQLiteContext();
  const syncLog = useSyncLog();
  // const refreshData = useCallback(() => {
  //   let TTC = db.getAllSync(
  //     "SELECT id, hash, LENGTH(encryptedContent) as encryptedContentLen FROM timeTrackingChunks"
  //   );
  //   let DPC = db.getAllSync(
  //     "SELECT id, hash, LENGTH(encryptedContent) as encryptedContentLen FROM dayPlannerChunks"
  //   );
  //   let PDC = db.getAllSync(
  //     "SELECT id, hash, LENGTH(encryptedContent) as encryptedContentLen FROM personalDiaryChunks"
  //   );
  //   let PDG = db.getAllSync(
  //     "SELECT id, hash, LENGTH(encryptedContent) as encryptedContentLen FROM personalDiaryGroups"
  //   );
  //   let FCC = db.getAllSync(
  //     "SELECT id, hash, LENGTH(encryptedContent) as encryptedContentLen FROM featureConfigChunks"
  //   );

  //   TTC = TTC.map((r) => {
  //     //@ts-expect-error
  //     return { ...r, tableName: "timeTracking" };
  //   });
  //   DPC = DPC.map((r) => {
  //     //@ts-expect-error
  //     return { ...r, tableName: "dayPlanner" };
  //   });
  //   PDC = PDC.map((r) => {
  //     //@ts-expect-error
  //     return { ...r, tableName: "personalNotes" };
  //   });
  //   PDG = PDG.map((r) => {
  //     //@ts-expect-error
  //     return { ...r, tableName: "personalGroups" };
  //   });

  //   FCC = FCC.map((r) => {
  //     //@ts-expect-error
  //     return { ...r, tableName: "featureConfigChunks" };
  //   });

  //   const data = [...TTC, ...DPC, ...PDC, ...PDG, ...FCC];

  //   //@ts-expect-error
  //   setListData(data);
  // }, []);

  // useEffect(() => {
  //   refreshData();
  // }, []);

  const spaceItem = useCallback(() => {
    return (
      <View
        style={{
          width: "100%",
          height: 10,
        }}
      ></View>
    );
  }, []);

  const renderItem = useCallback(({ item }) => {
    const typedItem = item as {
      tableName: string;
      hash: string;
      id: string;
      encryptedContentLen: number;
    };
    const hasHash = typeof typedItem.hash === "string";
    return (
      <View
        style={{
          width: "100%",
          height: 50,
          zIndex: -1,
          display: "flex",
          borderRadius: globalStyle.borderRadius,
          justifyContent: "space-between",
          backgroundColor:
            (hasHash ? globalStyle.color : globalStyle.errorColor) +
            layoutCardLikeBackgroundOpacity,
          paddingLeft: 10,
          paddingRight: 10,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Text
            ellipsizeMode={null}
            fontSize={globalStyle.mediumMobileFont}
            color={hasHash ? globalStyle.textColor : globalStyle.errorColor}
            label={typedItem.id}
          ></Text>
          <Text
            ellipsizeMode={null}
            color={hasHash ? globalStyle.textColor : globalStyle.errorColor}
            fontSize={globalStyle.mediumMobileFont}
            label={typedItem.hash ? typedItem.hash : "<NO HASH>"}
          ></Text>
        </View>
        <View
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Text
            fontSize={globalStyle.regularMobileFont}
            color={hasHash ? globalStyle.textColor : globalStyle.errorColor}
            label={`${typedItem.encryptedContentLen} | ${typedItem.tableName}`}
          ></Text>
        </View>
      </View>
    );
  }, []);

  return (
    <>
      <ThemedView
        keyboardDismissMode={false}
        style={{ ...styles.container, height: "100%" }}
      >
        <View style={{ width: "100%", height: "50%", zIndex: 0 }}>
          {/* <FlashList
            ItemSeparatorComponent={spaceItem}
            renderItem={renderItem}
            data={listData}
          ></FlashList> */}
        </View>
        <View
          style={{
            width: "100%",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <View
            style={{
              width: "100%",
              height: 80,
              display: "flex",
              flexDirection: "row",
              gap: 5,
              alignItems: "center",
              borderRadius: globalStyle.borderRadius,
              backgroundColor:
                (syncLog.pullStatus === null
                  ? globalStyle.color
                  : syncLog.pullStatus.status === "success"
                    ? globalStyle.successColor
                    : globalStyle.errorColor) + layoutCardLikeBackgroundOpacity,
            }}
          >
            <View style={{ width: 50, height: "35%" }}>
              <ArrowDeco
                style={{
                  width: 15,
                  height: 15,
                  transform: [{ rotate: "90deg" }],
                }}
              ></ArrowDeco>
            </View>
            <Text
              label={syncLog.pullStatus?.message || "No pull request"}
            ></Text>
          </View>
          <View
            style={{
              width: "100%",
              height: 80,
              display: "flex",
              flexDirection: "row",
              gap: 5,
              alignItems: "center",
              borderRadius: globalStyle.borderRadius,
              backgroundColor:
                (syncLog.pushStatus === null
                  ? globalStyle.color
                  : syncLog.pushStatus.status === "success"
                    ? globalStyle.successColor
                    : globalStyle.errorColor) + layoutCardLikeBackgroundOpacity,
            }}
          >
            <View style={{ width: 50, height: "35%" }}>
              <ArrowDeco
                style={{
                  width: 15,
                  height: 15,
                  transform: [{ rotate: "-90deg" }],
                }}
              ></ArrowDeco>
            </View>
            <Text
              label={syncLog.pushStatus?.message || "No push request"}
            ></Text>
          </View>
        </View>
      </ThemedView>
    </>
  );
}
export default devInfoMain;

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
