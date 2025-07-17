import { Hono } from "hono";
import { Bindings } from "./types/bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.json({
    status: "Healthy",
    requestTime: new Date(),
  });
});

export default app;
