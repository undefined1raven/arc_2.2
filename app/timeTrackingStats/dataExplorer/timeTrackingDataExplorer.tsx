import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { SimpleFooter } from "@/components/common/SimpleFooter";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import Text from "@/components/common/Text";
import { useTimeTrackingDataExplorer } from "@/stores/viewState/timeTrackingDataExplorer";
import { AddIcon } from "@/components/deco/AddIcon";
import Button from "@/components/common/Button";
import { Selection } from "@/components/common/Selection";
import { EditDeco } from "@/components/deco/EditDeco";
import { useCallback, useMemo } from "react";
import { useFeatureConfigs } from "@/stores/featureConfigs";
import { FlashList } from "@shopify/flash-list";

function TimeTrackingDataExplorer() {
  const globalStyle = useGlobalStyleStore((state) => state.globalStyle);
  const timeTrackingDataExplorer = useTimeTrackingDataExplorer();
  const timeTrackingFC = useFeatureConfigs(
    (fc) => fc.timeTrackingFeatureConfig
  );
  // Memoized filtered tasks
  const filteredTasks = useMemo(
    () => timeTrackingFC.filter((r) => r.type === "task"),
    [timeTrackingFC]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const task = timeTrackingFC.find((t) => t.itme.taskID === item);
      if (!task) {
        console.warn("Task not found for item:", item);
        return null;
      }
      const taskName = task.itme.name || "Unnamed Task";
      return (
        <View
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 10,
            borderRadius: globalStyle.borderRadius,
            backgroundColor:
              globalStyle.color + layoutCardLikeBackgroundOpacity,
            padding: 10,
            marginLeft: 10,
            marginRight: 10,
            borderTopRightRadius: index === 0 ? 0 : globalStyle.borderRadius,
            borderTopLeftRadius: index === 0 ? 0 : globalStyle.borderRadius,
          }}
        >
          <View
            style={{
              height: 30,
              width: 30,
              borderRadius: 5,
              backgroundColor: "red",
            }}
          ></View>
          <Text fontSize={globalStyle.regularMobileFont} label={taskName} />
        </View>
      );
    },
    [timeTrackingFC]
  );

  return (
    <>
      <ThemedView
        keyboardDismissMode={false}
        style={{ ...styles.container, height: "100%" }}
      >
        <View
          style={{
            flex: 1,
            gap: 5,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <View
            style={{
              height: 65,
              borderRadius: globalStyle.borderRadius,
              backgroundColor:
                globalStyle.color + layoutCardLikeBackgroundOpacity,
            }}
          ></View>
          <View
            style={{
              flex: 1,
              width: "100%",
              borderRadius: globalStyle.borderRadius,
            }}
          >
            <View
              style={{
                flex: 1,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {timeTrackingDataExplorer.viewState.length === 0 && (
                <>
                  <Text
                    style={{ zIndex: 1 }}
                    label="No Data"
                    color={globalStyle.errorColor}
                    fontSize={globalStyle.mediumMobileFont}
                  />
                  <AddIcon
                    width={30}
                    height={15}
                    color={globalStyle.errorColor}
                    style={{ zIndex: 1, transform: [{ rotate: "45deg" }] }}
                  />
                  <AddIcon
                    width={"50%"}
                    height={150}
                    color={globalStyle.errorColor + "08"}
                    style={{
                      zIndex: 0,
                      position: "absolute",
                      transform: [{ rotate: "45deg" }],
                    }}
                  />
                </>
              )}
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: globalStyle.color,
                marginLeft: 10,
                marginRight: 10,
                borderRadius: globalStyle.borderRadius,
              }}
            ></View>
            <View
              style={{
                flex: 1,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  flex: 1,
                  marginLeft: 10,
                  marginRight: 10,
                }}
              >
                <FlashList
                  data={timeTrackingDataExplorer.selectedActivities}
                  ItemSeparatorComponent={() => {
                    return <View style={{ height: 10 }} />;
                  }}
                  renderItem={renderItem}
                ></FlashList>
              </View>
              <Selection
                onMultiSelection={(e) => {
                  timeTrackingDataExplorer.setSelectedActivities(e);
                }}
                values={filteredTasks}
                labelKeys={["itme", "name"]}
                multiselectMatchKeys={["itme", "taskID"]}
                value={timeTrackingDataExplorer.selectedActivities}
                multiselect={true}
                customSelectionButton={(props: { onClick: () => void }) => (
                  <Button
                    onClick={props.onClick}
                    style={{
                      height: 35,
                      width: 120,
                      marginBottom: 5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <EditDeco />
                  </Button>
                )}
              />
            </View>
          </View>
        </View>
        <SimpleFooter label="Data Explorer"></SimpleFooter>
      </ThemedView>
    </>
  );
}
export default TimeTrackingDataExplorer;

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
