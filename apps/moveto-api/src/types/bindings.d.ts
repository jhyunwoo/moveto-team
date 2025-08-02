export type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  ARGON2: Fetcher;
  COOKIE_SECRET: string;
  API_URL: string;
};
