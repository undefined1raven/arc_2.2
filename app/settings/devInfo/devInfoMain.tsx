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
import { checkChunkTableAndComputeHash } from "@/components/utils/db/migrations/hashColumnMigrationScript";

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

  const refreshData = useCallback(() => {
    let TTC = db.getAllSync(
      "SELECT id, hash, LENGTH(encryptedContent) as encryptedContentLen FROM timeTrackingChunks"
    );
    let DPC = db.getAllSync(
      "SELECT id, hash, LENGTH(encryptedContent) as encryptedContentLen FROM dayPlannerChunks"
    );
    let PDC = db.getAllSync(
      "SELECT id, hash, LENGTH(encryptedContent) as encryptedContentLen FROM personalDiaryChunks"
    );
    let PDG = db.getAllSync(
      "SELECT id, hash, LENGTH(encryptedContent) as encryptedContentLen FROM personalDiaryGroups"
    );
    let FCC = db.getAllSync(
      "SELECT id, hash, LENGTH(encryptedContent) as encryptedContentLen FROM featureConfigChunks"
    );

    TTC = TTC.map((r) => {
      //@ts-expect-error
      return { ...r, tableName: "timeTracking" };
    });
    DPC = DPC.map((r) => {
      //@ts-expect-error
      return { ...r, tableName: "dayPlanner" };
    });
    PDC = PDC.map((r) => {
      //@ts-expect-error
      return { ...r, tableName: "personalNotes" };
    });
    PDG = PDG.map((r) => {
      //@ts-expect-error
      return { ...r, tableName: "personalGroups" };
    });

    FCC = FCC.map((r) => {
      //@ts-expect-error
      return { ...r, tableName: "featureConfigChunks" };
    });

    const data = [...TTC, ...DPC, ...PDC, ...PDG, ...FCC];

    const errors = data.filter((d) => typeof d.hash !== "string");
    //@ts-expect-error
    setListData(data);
  }, []);

  useEffect(() => {
    refreshData();
  }, []);

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
        <View style={{ width: "100%", height: "100%", zIndex: 0 }}>
          <FlashList
            ItemSeparatorComponent={spaceItem}
            renderItem={renderItem}
            data={listData}
          ></FlashList>
        </View>
        <Button
          onClick={async () => {
            await checkChunkTableAndComputeHash("timeTrackingChunks", true);
            await checkChunkTableAndComputeHash("dayPlannerChunks", true);
            await checkChunkTableAndComputeHash("personalDiaryChunks"), true;
            await checkChunkTableAndComputeHash("personalDiaryGroups", true);
            await checkChunkTableAndComputeHash("featureConfigChunks", true);

            setTimeout(() => {
              refreshData();
            }, 50);
          }}
          label="R"
          style={{
            width: 60,
            position: "absolute",
            right: 5,
            bottom: 120,
            height: 60,
            zIndex: 1,
          }}
        ></Button>
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
