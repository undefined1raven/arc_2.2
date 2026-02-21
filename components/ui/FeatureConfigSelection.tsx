import Text from "../common/Text";
import { useGlobalStyleStore } from "@/stores/globalStyles";
import { StyleSheet, View } from "react-native";
import { useCallback } from "react";
import { Selection } from "../common/Selection";

type Props = {
  value: any;
  values: any[];
  labelKeys?: string[];
  onChange: (value: any) => void;
  inputProps?: { [key: string]: any };
  label: string;
  labelWidthPercentage?: number;
  showActionButton?: boolean;
  onActionButtonClick?: () => void;
};

function FeatureConfigSelection(props: Props) {
  const globalStyle = useGlobalStyleStore();

  const styles = useCallback(() => {
    return StyleSheet.create({
      inputCoreStyle: {
        height: "100%",
        flexGrow: 1,
        width: `${100 - (props.labelWidthPercentage || 35)}%`,
      },
    });
  }, [props.labelWidthPercentage, props.label]);

  return (
    <View
      style={{
        width: "100%",
        height: props.height ? props.height : 60,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      {typeof props.label === "string" && props.label.length > 0 && (
        <Text
          label={props.label}
          color={globalStyle.globalStyle.textColorAccent}
          textAlign="left"
          style={{
            backgroundColor: globalStyle.globalStyle.color + "10",
            height: "100%",
            width: props.labelWidthPercentage
              ? `${props.labelWidthPercentage}%`
              : "35%",
          }}
        ></Text>
      )}
      <View style={{ ...styles().inputCoreStyle }}>
        <Selection
          value={props.value}
          values={props.values}
          labelKeys={props.labelKeys}
          onSelection={(e) => {
            props.onChange(e);
          }}
          showActionButton={props.showActionButton}
          onActionButtonClick={props.onActionButtonClick}
          {...props.inputProps}
        ></Selection>
      </View>
    </View>
  );
}

export { FeatureConfigSelection };
