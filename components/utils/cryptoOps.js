function getCryptoOpsFn(args) {
  return `


function charCodeArrayToString(charCodeArray) {
  let str = "";
  for (let i = 0; i < charCodeArray.length; i++) {
    str += String.fromCharCode(charCodeArray[i]);
  }
  return str;
}

function stringToCharCodeArray(str) {
    let stringActual = str;
    if (str === undefined) {
      throw new Error("stringToCharCodeArray: str is undefined");
    } else {
      if (typeof str !== "string") {
        stringActual = str.toString();
      }
    }
    const charCodeArray = [];
    for (let i = 0; i < stringActual.length; i++) {
      charCodeArray.push(stringActual.charCodeAt(i));
    }
    return charCodeArray;
  }


  function sendMessage(message) {
  window.ReactNativeWebView.postMessage(message);
}

      console.log("------Crypto Worker v1.2 active------");
      function cryptoWorker(args) {
    console.log("------Crypto Worker v1.2 active from CW------");
    function returnErrorResponse(message) {
      console.log(\`Error: \$\{message\} for args\` [redacted]);
      return {
        status: "error",
        payload: { message: message, providedArgs: args },
      };
    }

    ////[Start] Basic error handling
    if (typeof window === "undefined") {
      return { status: "error", payload: { message: "Window is not defined" } };
    }
    if (typeof crypto.subtle === "undefined") {
      return {
        status: "error",
        payload: { message: "Crypto Subtle is not defined" },
      };
    }
    if (typeof args === "undefined") {
      return { status: "error", payload: { message: "No arguments provided" } };
    }
    if (typeof args.type === "undefined") {
      return {
        status: "error",
        payload: { message: "No operation type provided" },
      };
    }
    const validOpTypes = [
      "encrypt",
      "decrypt",
      "generateKeyPair",
      "generateSymmetricKey",
      "exportKey",
      "importKey",
      "wrapKey",
      "unwrapKey",
    ];
    const noArgsOps = ["generateKeyPair", "generateSymmetricKey"];
    if (!validOpTypes.includes(args.type)) {
      return {
        status: "error",
        payload: { message: "Invalid operation type provided" },
      };
    }
    if (typeof args.args === "undefined" && !noArgsOps.includes(args.type)) {
      return {
        status: "error",
        payload: { message: "No arguments provided" },
      };
    }
    ////[End] Basic error handling

    /////[Start] Symmetric Key Generation
    function generateSymmetricKey() {
      return window.crypto.subtle
        .generateKey(
          {
            name: "AES-GCM",
            length: 256,
          },
          true,
          ["encrypt", "decrypt"]
        )
        .then((key) => {
          const exportedKey = exportCryptoKey(key);
          return exportedKey;
        })
        .catch((e) => {
          return returnErrorResponse(e);
        });
    }
    /////[End] Symmetric Key Generation

    /////[Start] Key Pair Generation
    function generateKeyPair() {
      return window.crypto.subtle
        .generateKey(
          {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
          },
          true,
          ["encrypt", "decrypt"]
        )
        .then((keys) => {
          const publicKey = keys.publicKey;
          const privateKey = keys.privateKey;
          const exportedPublicKey = exportCryptoKey(publicKey);
          const exportedPrivateKey = exportCryptoKey(privateKey);
          return Promise.all([exportedPublicKey, exportedPrivateKey]).then(
            (values) => {
              const publicExportedKeyResponse = values[0];
              const privateExportedKeyResponse = values[1];
              if (
                publicExportedKeyResponse.status === "error" ||
                privateExportedKeyResponse.status === "error"
              ) {
                return returnErrorResponse(
                  \`Error exporting keys: values\`
                );
              }
              return {
                status: "success",
                payload: {
                  publicKey: values[0].payload.jwk,
                  privateKey: values[1].payload.jwk,
                },
              };
            }
          );
        })
        .catch((e) => {
          return returnErrorResponse(e);
        });
    }
    /////[End] Key Pair Generation

    ////[Start] Export Key
    async function exportCryptoKey(key) {
      return window.crypto.subtle
        .exportKey("jwk", key)
        .catch((e) => {
          return returnErrorResponse(e);
        })
        .then((exported) => {
          return {
            status: "success",
            payload: { jwk: JSON.stringify(exported) },
          };
        });
    }
    ////[End] Export Key

    ////[Start] Import Key
    function importCryptoKey(args) {
      var parsedJwk = null;
      try {
        parsedJwk = JSON.parse(args.jwkKeyData);
      } catch (e) {
        return returnErrorResponse(e);
      }
      if (args.keyType === "private") {
        return window.crypto.subtle
          .importKey(
            "jwk",
            parsedJwk,
            {
              name: "RSA-OAEP",
              hash: "SHA-256",
            },
            true,
            ["decrypt"]
          )
          .then((key) => {
            return { status: "success", payload: { key: key } };
          })
          .catch((e) => {
            return returnErrorResponse(e);
          });
      } else if (args.keyType === "public") {
        return window.crypto.subtle
          .importKey(
            "jwk",
            parsedJwk,
            {
              name: "RSA-OAEP",
              hash: "SHA-256",
            },
            true,
            ["encrypt"]
          )
          .catch((e) => {
            return returnErrorResponse(e);
          })
          .then((key) => {
            return { status: "success", payload: { key: key } };
          });
      } else if (args.keyType === "symmetric") {
        return window.crypto.subtle
          .importKey(
            "jwk",
            parsedJwk,
            {
              name: "AES-GCM",
              length: 256,
            },
            true,
            ["encrypt", "decrypt"]
          )
          .catch((e) => {
            return returnErrorResponse(e);
          })
          .then((key) => {
            return { status: "success", payload: { key: key } };
          });
      }
    }
    ////[End] Import Key

    function ab2str(buf) {
      return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    ////[Start] Encrypt
    async function encrypt(args) {
      if (args.keyType === "public") {
        const importPayload = await importCryptoKey({
          jwkKeyData: args.key,
          keyType: "public",
        });
        if (!importPayload?.payload?.key) {
          return returnErrorResponse("Error importing public key");
        }
        const key = importPayload.payload.key;
        const encoder = new TextEncoder();
        let plaintext = encoder.encode(args.charCodeData);
        return window.crypto.subtle
          .encrypt({ name: "RSA-OAEP" }, key, plaintext)
          .then((cipher) => {
            return {
              status: "success",
              payload: { cipher: stringToCharCodeArray(ab2str(cipher)) },
            };
          })
          .catch((e) => {
            return returnErrorResponse(e);
          });
      } else if (args.keyType === "symmetric") {
        const importPayload = await importCryptoKey({
          jwkKeyData: args.key,
          keyType: "symmetric",
        });
        if (!importPayload?.payload?.key) {
          return returnErrorResponse("Error importing public key");
        }
        const key = importPayload.payload.key;
        let encoded = new TextEncoder().encode(args.charCodeData);
        let iv = window.crypto.getRandomValues(new Uint8Array(12));
        return await window.crypto.subtle
          .encrypt({ name: "AES-GCM", iv: iv }, key, encoded)
          .then((encrypted) => {
            return {
              status: "success",
              payload: {
                cipher: stringToCharCodeArray(ab2str(encrypted)),
                iv: stringToCharCodeArray(ab2str(iv)),
              },
            };
          })
          .catch((e) => {
            return returnErrorResponse(e, ' ---- Catch 1');
          });
      }
    }
    ////[End] Encrypt

    ///[Start] Decrypt
    async function decrypt(args) {
      var parsedCharCodeData = null;
      try {
      console.log("PARSING THIS MOTHERFUCKER", args)
        parsedCharCodeData = JSON.parse(args.charCodeData);
      } catch (e) {
        return returnErrorResponse(e);
      }
      if (parsedCharCodeData === null) {
        return returnErrorResponse("Error parsing char code data");
      }else if(parsedCharCodeData.cipher === undefined || parsedCharCodeData.iv === undefined) {
        return returnErrorResponse("Error parsing char code data");
      }
      if (args.keyType === "private") {
        const importPayload = await importCryptoKey({
          jwkKeyData: args.key,
          keyType: "private",
        });
        if (!importPayload?.payload?.key) {
          return returnErrorResponse("Error importing private key");
        }
        const key = importPayload.payload.key;
        return window.crypto.subtle
          .decrypt({ name: "RSA-OAEP" }, key, cipherFromCharCodes)
          .then((plaintext) => {
            const decoder = new TextDecoder();
            return decoder.decode(plaintext);
          })
          .catch((e) => {
            return returnErrorResponse(e);
          });
      } else if (args.keyType === "symmetric") {
       console.log("EHY THE FUCK IS THIS HAPPENING C / I", parsedCharCodeData)
        const cipherAndIv = {cipher: charCodeArrayToString(parsedCharCodeData.cipher), iv: charCodeArrayToString(parsedCharCodeData.iv)};
        const cipher = str2ab(cipherAndIv.cipher);
        const iv = str2ab(cipherAndIv.iv);
        const importPayload = await importCryptoKey({
          jwkKeyData: args.key,
          keyType: "symmetric",
        });

        if (!importPayload?.payload?.key) {
          return returnErrorResponse("Error importing symmetric key");
        }
        const key = importPayload.payload.key;
        return await window.crypto.subtle
          .decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            cipher
          )
          .then((decrypted) => {
            return {
              status: "success",
              payload: { decrypted: new TextDecoder().decode(decrypted) },
            };
          })
          .catch((e) => {
            return returnErrorResponse(e);
          });
      }
    }
    ///[End] Decrypt

    ////[Start] Wrap Key
    function getKeyMaterial(password) {
      const enc = new TextEncoder();
      return window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
      );
    }

    async function digestMessage(message) {
      const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
      const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
      return hashHex;
    }

    /*
Given some key material and some random salt
derive an AES-KW key using PBKDF2.
*/
    function getKey(keyMaterial, salt) {
      return window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-CBC", length: 256 },
        true,
        ["wrapKey", "unwrapKey"]
      );
    }

    async function wrapKey(args) {
      const password = args.password;
      const importedKey = await importCryptoKey({
        jwkKeyData: args.jwkKeyData,
        keyType: args.keyType,
      });
      if (!importedKey?.payload?.key) {
        return returnErrorResponse("Error importing key");
      }
      const key = importedKey.payload.key;
      const hashedPassword = await digestMessage(password);
      // get the key encryption key
      const keyMaterial = await getKeyMaterial(hashedPassword);
      let salt = window.crypto.getRandomValues(new Uint8Array(16));
      const wrappingKey = await getKey(keyMaterial, salt);
      const iv = window.crypto.getRandomValues(new Uint8Array(16));
      let keyFormat = args.keyType === "private" ? "jwk" : "raw";
      return window.crypto.subtle
        .wrapKey(keyFormat, key, wrappingKey, {
          name: "AES-CBC",
          iv: iv,
        })
        .then((wrappedKey) => {
          return {
            status: "success",
            payload: {
              wrappedKey: ab2str(wrappedKey),
              salt: ab2str(salt),
              iv: ab2str(iv),
            },
          };
        })
        .catch((e) => {
          return returnErrorResponse(e);
        });
    }
    ////[End] Wrap Key

    /////[Start] Unwrap Key
    function str2ab(str) {
      const buf = new ArrayBuffer(str.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }

    async function unwrapKey(args) {
      const wrappedKey = str2ab(args.wrappedKey);
      const password = args.password;
      const salt = str2ab(args.salt);
      const iv = str2ab(args.iv);
      const hashedPassword = await digestMessage(password);
      const keyMaterial = await getKeyMaterial(hashedPassword);
      const unwrappingKey = await getKey(keyMaterial, salt);
      return window.crypto.subtle
        .unwrapKey(
          "raw",
          wrappedKey,
          unwrappingKey,
          { name: "AES-CBC", iv: iv },
          { name: "AES-GCM" },
          true,
          ["encrypt", "decrypt"]
        )
        .catch((e) => {
          return returnErrorResponse(e);
        })
        .then(async (key) => {
          const exportCryptoKeyResponse = await exportCryptoKey(key);
          if(exportCryptoKeyResponse.status === "error") {
            return returnErrorResponse("Error exporting unwrapped key");
          }
          const exportedKey = exportCryptoKeyResponse.payload.jwk;
          try{
            const parsedKey = JSON.parse(exportedKey);
            return { status: "success", payload: { key: parsedKey } };
            }
          catch(e) {
            return returnErrorResponse(e);
          }
        });
    }

    /////[End] Unwrap Key

    switch (args.type) {
      case "generateKeyPair":
        return generateKeyPair();
      case "generateSymmetricKey":
        return generateSymmetricKey();
      case "exportKey":
        return exportCryptoKey(args.args);
      case "importKey":
        return importCryptoKey(args.args);
      case "wrapKey":
        return wrapKey(args.args);
      case "unwrapKey":
        return unwrapKey(args.args);
      case "encrypt":
        return encrypt(args.args);
      case "decrypt":
        return decrypt(args.args);
      default:
        return returnErrorResponse("Invalid operation type provided");
    }
  }
  cryptoWorker(${args}).then((response) => {
      console.log("Response from cryptoWorker", response); 
      console.log("Posting message back to main thread", '${args.requestId}');
      sendMessage(JSON.stringify({...response, requestId: '${
        JSON.parse(args).requestId
      }'})); 
    }).catch((e) => {
    console.log("Error in cryptoWorker", e);
  });
  
  `;
}

export { getCryptoOpsFn };
