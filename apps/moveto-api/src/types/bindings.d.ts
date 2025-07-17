import LogInCounter from "../durable-objects/login-counter";

export type Bindings = {
  DB: D1Database;
  moveto_api: KVNamespace;
  LOGIN_COUNTER: DurableObjectNamespace<LogInCounter>;
};
