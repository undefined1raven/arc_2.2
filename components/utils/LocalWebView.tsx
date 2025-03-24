import { useEffect, useRef } from "react";
import WebView from "react-native-webview";
import { getCryptoOpsFn } from "./cryptoOps";
import { useCryptoOpsQueue } from "@/stores/cryptoOpsQueue";

type BackgroundTaskRunnerProps = {
  code: string;
  messageHandler: Function;
  source?: string;
  triggeredCode?: string;
  tx?: string | number;
  allowTriggering?: boolean | undefined;
  JSObjectInsert?: object;
};
function BackgroundTaskRunner(props) {
  const worker = useRef(null);
  const cryptoOpsApi = useCryptoOpsQueue();
  const html = `
  <html>
  <head>
  </head>
  <body>
  </body>
  `;
  return (
    <WebView
      key={props.requestId}
      ref={worker}
      injectedJavaScript={getCryptoOpsFn(
        JSON.stringify(
          props.code ? { ...props.code, requestId: props.requestId } : {}
        )
      )}
      webviewDebuggingEnabled={true}
      style={{ width: 0, height: 0, opacity: 0, display: "none" }}
      originWhitelist={["*"]}
      onMessage={(e) => {
        const response = JSON.parse(e.nativeEvent.data);
        cryptoOpsApi.dequeue(response);
      }}
      source={{
        html: html,
        mixedContentMode: "never",
        baseUrl: "https://localhost",
      }}
    ></WebView>
  );
}

export { BackgroundTaskRunner };
