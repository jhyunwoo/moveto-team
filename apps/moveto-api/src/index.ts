import { Hono } from "hono";
import { Bindings } from "./types/bindings";
import auth from "./routes/auth";
import { authMiddleware } from "./middlewares/auth";
import { Variables } from "./types/variables";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.route("/auth", auth);

app.use(authMiddleware);

app.get("/", (c) => {
  return c.json({ state: "Healthy", dateTime: new Date() });
});

export default app;
