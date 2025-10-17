const secureStoreKeyNames = {
  temporary: {
    symmetricKey: "tempSymmetricKey",
    privateKey: "tempPrivateKey",
  },
  accountConfig: {
    useBiometricAuth: "useBiometricAuth",
    pin: "pin",
    activeSymmetricKey: "activeSymmetricKey",
    activePrivateKey: "activePrivateKey",
  },
  userDataKeys: {
    timeTrackingActiveTask: "timeTrackingActiveTask",
  },
};

const authChallengeStack = "authChallengeStack";

const noBioSKName = "noBSK";

const getUserThemeKey = (userId: string) => {
  return `userTheme_${userId}`;
};

const getUserDataKey = (
  userId: string,
  userDataKey: "timeTrackingActiveTask" | string
) => {
  return `userData_${userId}-${userDataKey}`;
};

const getSymmetricKey = (userId: string) => {
  return `symmetricKey_${userId}`;
};

const getPrivateKey = (userId: string) => {
  return `privateKey_${userId}`;
};

export {
  noBioSKName,
  secureStoreKeyNames,
  getPrivateKey,
  getSymmetricKey,
  getUserDataKey,
  getUserThemeKey,
  authChallengeStack,
};
