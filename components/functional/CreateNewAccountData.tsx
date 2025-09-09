import { useEffect } from "react";
import createNewAccountBasics from "../utils/createNewAccountInfo";
import { useNewUserData } from "@/stores/newUserData";
function CreateNewAccountData() {
  const newUserDataApi = useNewUserData();

  useEffect(() => {
    const userData = createNewAccountBasics();

    userData.then((userDataPackage) => {
      if (
        userDataPackage &&
        userDataPackage.userData &&
        userDataPackage.secretKey
      ) {
        const userData = userDataPackage.userData;
        const secretKey = userDataPackage.secretKey;
        newUserDataApi.setUserData(userData);
        newUserDataApi.setSecretKey(secretKey);
        newUserDataApi.setGeneratingKeysAndConfig(false);
      }
    });
  }, []);
  return null;
}

export default CreateNewAccountData;
