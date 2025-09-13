import { API_URL } from "@/constants/API_URL";
import { APP_ID } from "@/constants/app_id";
import axios from "axios";
import { useEffect } from "react";

function OnlineSyncHandler() {
  useEffect(() => {
    axios
      .post(`${API_URL}/account/createOnlineAccountFromLocal`, {
        data: {
          appID: APP_ID,
        },
      })
      .then((r) => {
        console.log("Online sync response:", r.data);
      })
      .catch((e) => {
        console.log("Online sync error:", e);
      });
  }, []);

  return null;
}

export { OnlineSyncHandler };
