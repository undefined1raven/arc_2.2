import { useCallback, useState } from "react";
import { Button, View } from "react-native";
import { DatePickerModal } from "react-native-paper-dates";
import { SafeAreaProvider } from "react-native-safe-area-context";

function DayPlannerGraph() {
  const [range, setRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });
  const [open, setOpen] = useState(false);

  const onDismiss = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = useCallback(
    ({ startDate, endDate }) => {
      setOpen(false);
      setRange({ startDate, endDate });
    },
    [setOpen, setRange],
  );

  return (
    <View style={{ justifyContent: "center", flex: 1, alignItems: "center" }}>
      <Button
        title="string"
        onPress={() => setOpen(true)}
        uppercase={false}
        mode="outlined"
      >
        Pick range
      </Button>
      <DatePickerModal
        locale="en"
        mode="range"
        onChange={(r) => {
          console.log(r);
        }}
        visible={open}
        onDismiss={onDismiss}
        saveLabel="Save"
        label="Pick data range"
        startDate={new Date(2026, 8, 21)}
        validRange={{ startDate: new Date(2026, 6, 28), endDate: new Date() }}
        endDate={new Date()}
        onConfirm={onConfirm}
      />
    </View>
  );
}

export default DayPlannerGraph;
