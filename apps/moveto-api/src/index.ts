import { Hono } from "hono";
import { Bindings } from "./types/bindings";
import { Counter } from "./durable-objects/counter";
import { TokenBucket } from "./durable-objects/rate-limit";
import initDb from "./db";
import authApp from "./routes/auth";
import { getCurrentSession } from "./lib/auth/session";
import { cors } from "hono/cors";

export { Counter, TokenBucket };

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
  }),
);

app.route("/auth", authApp);

app.get("/", async (c) => {
  const db = initDb(c.env.DB);

  const { session } = await getCurrentSession(c, db);
  return c.json({ session });
});

export default app;
