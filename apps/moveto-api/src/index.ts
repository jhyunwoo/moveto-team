import { Hono } from "hono";
import { Bindings } from "./types/bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
