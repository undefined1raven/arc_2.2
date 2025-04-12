const secureStoreKeyNames = {
  temporary: {
    symmetricKey: "tempSymmetricKey",
    privateKey: "tempPrivateKey",
  },
};

const getSymmetricKey = (userId: string) => {
  return `symmetricKey_${userId}`;
};

const getPrivateKey = (userId: string) => {
  return `privateKey_${userId}`;
};

export { secureStoreKeyNames, getPrivateKey, getSymmetricKey };
