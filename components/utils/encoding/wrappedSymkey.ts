import { charCodeArrayToString, stringToCharCodeArray } from "../fn/charOps";

function encodeWrappedSymkey(symkey: {
  wrappedKey: string;
  iv: string;
  salt: string;
}): string | null {
  if (!symkey || !symkey.wrappedKey || !symkey.iv || !symkey.salt) {
    console.error("Invalid symkey object:", symkey);
    return null; // Return null if the symkey object is invalid
  }
  const encodedIv = stringToCharCodeArray(symkey.iv);
  const encodedKey = stringToCharCodeArray(symkey.wrappedKey);
  const encodedSalt = stringToCharCodeArray(symkey.salt);
  const encodedSymkey = {
    wrappedKey: encodedKey,
    iv: encodedIv,
    salt: encodedSalt,
  };
  const encodedSymkeyString = JSON.stringify(encodedSymkey);
  return encodedSymkeyString;
}

function decodeWrappedSymkey(symkeyString: string): {
  wrappedKey: string;
  iv: string;
  salt: string;
} | null {
  try {
    const parsedSymKey = JSON.parse(symkeyString);
    const decodedIv = charCodeArrayToString(parsedSymKey.iv);
    const decodedKey = charCodeArrayToString(parsedSymKey.wrappedKey);
    const decodedSalt = charCodeArrayToString(parsedSymKey.salt);
    const decodedSymkey = {
      wrappedKey: decodedKey,
      iv: decodedIv,
      salt: decodedSalt,
    };
    return decodedSymkey;
  } catch (e) {
    console.error("Error decoding wrapped symkey:", e);
    return null; // Return the original string if parsing fails
  }
}

export { encodeWrappedSymkey, decodeWrappedSymkey };
