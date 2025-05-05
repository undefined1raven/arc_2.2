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

export { secureStoreKeyNames, getPrivateKey, getSymmetricKey, getUserDataKey };
