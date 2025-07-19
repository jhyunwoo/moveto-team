const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const IV_LENGTH = 14;

// Base64 유틸
function uint8ArrayToBase64(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// 🔐 키 생성
export async function generateAesKey(): Promise<CryptoKey | CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

// 🔑 키 내보내기
export async function exportCryptoKey(key: CryptoKey): Promise<string> {
  const rawKey = new Uint8Array(
    (await crypto.subtle.exportKey("raw", key)) as ArrayBuffer,
  );
  return uint8ArrayToBase64(rawKey);
}

// 🔑 키 불러오기
export async function importCryptoKey(base64Key: string): Promise<CryptoKey> {
  const keyBytes = base64ToUint8Array(base64Key);
  return await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"],
  );
}

// 🔒 암호화
export async function encryptText(
  plainText: string,
  key: CryptoKey,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedText = textEncoder.encode(plainText);

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedText),
  );

  const combined = new Uint8Array(iv.length + encrypted.length);
  combined.set(iv);
  combined.set(encrypted, iv.length);

  return uint8ArrayToBase64(combined);
}

// 🔓 복호화
export async function decryptText(
  base64Ciphertext: string,
  key: CryptoKey,
): Promise<string> {
  const combined = base64ToUint8Array(base64Ciphertext);
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    ciphertext,
  );

  return textDecoder.decode(decrypted);
}
