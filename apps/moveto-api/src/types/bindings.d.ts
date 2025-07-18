import { Counter } from "../index";

export type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  COUNTER: DurableObjectNamespace<Counter>;
  TokenBucket: DurableObjectNamespace<TokenBucket>;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
};
