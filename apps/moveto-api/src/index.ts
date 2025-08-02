import { Hono } from "hono";
import { ENV } from "./types/env";
import { authMiddleware } from "./middlewares/auth-middleware";
import authApp from "./routes/auth";

const app = new Hono<ENV>();

app.use(authMiddleware);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/auth", authApp);

export default app;
