import { TokenBucket } from "../../durable-objects/rate-limit";
import { Context } from "hono";

export function globalGETRateLimit(
  c: Context,
  globalBucket: TokenBucket<any>,
): boolean {
  // Note: Assumes X-Forwarded-For will always be defined.
  const clientIP = c.req.header("X-Forwarded-For");
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 1);
}

export function globalPOSTRateLimit(
  c: Context,
  globalBucket: TokenBucket<any>,
): boolean {
  // Note: Assumes X-Forwarded-For will always be defined.
  const clientIP = c.req.header("X-Forwarded-For");
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 3);
}
