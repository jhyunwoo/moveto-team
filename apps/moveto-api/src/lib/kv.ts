/**
 * key에 해당하는 값을 KV에서 가져오는 함수
 * @param KV
 * @param key
 */
export async function getKv(KV: KVNamespace<string>, key: string) {
  return await KV.get(key);
}

/**
 * KV에 key와 value 값을 등록하는 함수
 * @param KV
 * @param key
 * @param value
 */
export async function putKv(
  KV: KVNamespace<string>,
  key: string,
  value: string,
) {
  try {
    await KV.put(key, value);
  } catch (e) {
    throw e;
  }
}

/**
 * 해당 Key를 가지는 값을 KV에서 삭제하는 함수
 * @param KV
 * @param key
 */
export async function deleteKv(KV: KVNamespace<string>, key: string) {
  try {
    await KV.delete(key);
  } catch (e) {
    throw e;
  }
}
