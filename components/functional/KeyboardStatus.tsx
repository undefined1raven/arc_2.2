import { useVirtualKeyboard } from "@/stores/virtualKeyboard";
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { Dimensions } from "react-native";
export default function KeyboardVisible() {
  const keyboardApi = useVirtualKeyboard();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    keyboardApi.setVisible(keyboardVisible);
  }, [keyboardVisible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      const h = Dimensions.get("window").height;
      keyboardApi.setScreenWithoutKeyboard(h - e.endCoordinates.height);
      keyboardApi.setKeyboardHeight(e.endCoordinates.height);
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return null;
}
