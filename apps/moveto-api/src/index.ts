import { Hono } from "hono";
import { Bindings } from "./types/bindings";
import auth from "./routes/auth";
import { authMiddleware } from "./middlewares/auth";
import { Variables } from "./types/variables";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use(authMiddleware);

app.route("/auth", auth);

app.get("/", (c) => {
  return c.json({ state: "Healthy", dateTime: new Date() });
});

export default app;
