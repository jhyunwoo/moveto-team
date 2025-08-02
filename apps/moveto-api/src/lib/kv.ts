export class Kv {
  private readonly KV: KVNamespace<string>;

  constructor(KV: KVNamespace<string>) {
    this.KV = KV;
  }

  /**
   * key에 해당하는 값을 KV 에서 가져오는 함수
   * @param key
   */
  async getKv(key: string) {
    return await this.KV.get(key);
  }

  /**
   * KV에 key와 value 값을 등록하는 함수
   * @param key
   * @param value
   */
  async putKv(key: string, value: string) {
    try {
      await this.KV.put(key, value);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 해당 Key를 가지는 값을 KV 에서 삭제하는 함수
   * @param key
   */
  async deleteKv(key: string) {
    try {
      await this.KV.delete(key);
    } catch (e) {
      throw e;
    }
  }
}
