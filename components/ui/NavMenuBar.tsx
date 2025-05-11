import { useGlobalStyleStore } from "@/stores/globalStyles";
import Animated from "react-native-reanimated";
import Button from "../common/Button";
import { useNavMenuApi } from "@/stores/navMenuApi";
import { layoutCardLikeBackgroundOpacity } from "@/constants/colors";
import { useRouter, usePathname, router } from "expo-router";
import { useEffect, useState } from "react";
import { useActiveUser } from "@/stores/activeUser";
import { StorageAccessFramework } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { useSQLiteContext } from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import {
  getPrivateKey,
  getSymmetricKey,
} from "../utils/constants/secureStoreKeyNames";
function NavMenuBar() {
  const menuApi = useNavMenuApi();
  const globalStyle = useGlobalStyleStore();
  const [currentRoute, setCurrentRoute] = useState("home");
  const pathname = usePathname();
  const db = useSQLiteContext();
  useEffect(() => {
    console.log("pathname", pathname);
  }, [pathname]);

  async function saveFile() {
    const activeUserID = useActiveUser.getState().activeUser.userId;
    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
      console.log("Permission denied");
      return;
    }

    const userData = await db.getFirstAsync(
      `SELECT * FROM users WHERE id = '${activeUserID}'`
    );
    const timeTrackingChunks = await db.getAllAsync(
      `SELECT * FROM timeTrackingChunks WHERE userID = '${activeUserID}'`
    );
    const personalDiaryChunks = await db.getAllAsync(
      `SELECT * FROM personalDiaryChunks WHERE userID = '${activeUserID}'`
    );
    const personalDiaryGroups = await db.getAllAsync(
      `SELECT * FROM personalDiaryGroups WHERE userID = '${activeUserID}'`
    );
    const dayPlannerChunks = await db.getAllAsync(
      `SELECT * FROM dayPlannerChunks WHERE userID = '${activeUserID}'`
    );
    const fcData = await db.getAllAsync(
      `SELECT * FROM featureConfigChunks WHERE userID = '${activeUserID}'`
    );
    const pk = await SecureStore.getItemAsync(getPrivateKey(activeUserID));
    const symkey = await SecureStore.getItemAsync(
      getSymmetricKey(activeUserID)
    );
    let accountBackup = {
      userData,
      timeTrackingChunks,
      personalDiaryChunks,
      personalDiaryGroups,
      dayPlannerChunks,
      pk,
      symkey,
    };

    function getUTC() {
      const date = new Date();
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    try {
      await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        `ARC_AccountBackup-${getUTC()}-${activeUserID}.arc2v2.backup.txt`,
        "text/plain"
      )
        .then(async (uri) => {
          await FileSystem.writeAsStringAsync(
            uri,
            JSON.stringify(accountBackup),
            {
              encoding: FileSystem.EncodingType.UTF8,
            }
          );
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      throw new Error(e);
    }
  }

  return (
    <Animated.View
      style={{
        backgroundColor:
          globalStyle.globalStyle.color + layoutCardLikeBackgroundOpacity,
        width: "100%",
        borderRadius: globalStyle.globalStyle.borderRadius,
        height: "6%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {menuApi.menuItems.map((menuItem, index) => (
        <Button
          key={index}
          onClick={() => {
            if (pathname === menuItem.pathname) {
              return;
            }
            if (menuItem.pathname === "/settings/settings") {
              saveFile();
              return;
            }
            router.push(menuItem.pathname);
          }}
          style={{
            width: "20%",
            height: "100%",
            borderColor: "#00000000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {menuItem.icon({
            color:
              menuItem.pathname === pathname
                ? globalStyle.globalStyle.color
                : globalStyle.globalStyle.color + "AA",
          })}
          <Animated.View
            style={{
              backgroundColor:
                menuItem.pathname === pathname
                  ? globalStyle.globalStyle.color
                  : globalStyle.globalStyle.color + "20",
              width: "65%",
              borderRadius: globalStyle.globalStyle.borderRadius,
              position: "absolute",
              height: 3,
              bottom: 2,
            }}
          ></Animated.View>
        </Button>
      ))}
    </Animated.View>
  );
}

export { NavMenuBar };
