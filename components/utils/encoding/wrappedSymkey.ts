import { charCodeArrayToString, stringToCharCodeArray } from "../fn/charOps";

function encodeWrappedSymkey(symkey: {
  wrappedKey: string;
  salt: string;
}): string | null {
  if (!symkey || !symkey.wrappedKey || !symkey.salt) {
    console.error("Invalid symkey object:", symkey);
    return null; // Return null if the symkey object is invalid
  }
  const encodedKey = stringToCharCodeArray(symkey.wrappedKey);
  const encodedSalt = stringToCharCodeArray(symkey.salt);
  const encodedSymkey = {
    wrappedKey: encodedKey,
    salt: encodedSalt,
  };
  const encodedSymkeyString = JSON.stringify(encodedSymkey);
  return encodedSymkeyString;
}

function decodeWrappedSymkey(symkeyString: string): {
  wrappedKey: string;
  salt: string;
} | null {
  try {
    const parsedSymKey = JSON.parse(symkeyString);
    const decodedKey = charCodeArrayToString(parsedSymKey.wrappedKey);
    const decodedSalt = charCodeArrayToString(parsedSymKey.salt);
    const decodedSymkey = {
      wrappedKey: decodedKey,
      salt: decodedSalt,
    };
    return decodedSymkey;
  } catch (e) {
    console.error("Error decoding wrapped symkey:", e);
    return null; // Return the original string if parsing fails
  }
}

export { encodeWrappedSymkey, decodeWrappedSymkey };
