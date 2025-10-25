import * as SecureStore from "expo-secure-store";
import { authChallengeStack } from "../constants/secureStoreKeyNames";

async function getAuthToken(): Promise<string | null> {
  const authTokens = await SecureStore.getItemAsync(authChallengeStack);
  if (authTokens === null) {
    return null;
  }
  try {
    const authTokensArray = JSON.parse(authTokens);
    if (Array.isArray(authTokensArray) && authTokensArray.length > 0) {
      const tokenToReturn = authTokensArray[0];
      const unusedTokens = authTokensArray.filter(
        (token) => token !== tokenToReturn
      );
      await SecureStore.setItemAsync(
        authChallengeStack,
        JSON.stringify(unusedTokens)
      );
      return tokenToReturn;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export { getAuthToken };
