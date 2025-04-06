import { useEffect } from "react";
import createNewAccountBasics from "../utils/createNewAccountInfo";
import { useNewUserData } from "@/stores/newUserData";

function CreateNewAccountData() {
  const newUserDataApi = useNewUserData();

  useEffect(() => {
    const userData = createNewAccountBasics();
    userData.then((userData) => {
      if (userData) {
        newUserDataApi.setUserData(userData);
        newUserDataApi.setGeneratingKeysAndConfig(false);
      }
    });
  }, []);
  return null;
}

export default CreateNewAccountData;
