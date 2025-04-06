import { StorageAccessFramework } from "expo-file-system";
import * as FileSystem from "expo-file-system";
async function saveFile(filename: string, text: string) {
  const permissions =
    await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted) {
    return;
  }

  try {
    await StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      filename,
      "text/plain"
    )
      .then(async (uri) => {
        await FileSystem.writeAsStringAsync(uri, text, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  } catch (e) {
    throw new Error(e);
  }
}

export { saveFile };
