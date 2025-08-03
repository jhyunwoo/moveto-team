import { Context } from "hono";
import { ENV } from "../types/env";
import initDb from "../db";
import { and, eq, lte } from "drizzle-orm";
import { emailVerificationTable } from "../db/schema";

/**
 * 숫자로 구성된 6자리 랜덤 코드를 생성하는 함수
 *
 * DB 에서 유일한 코드인지 확인
 */
export default async function createVerificationCode(c: Context<ENV>) {
  let code = "";

  while (true) {
    const random = Math.floor(Math.random() * 1000000);
    if (random < 100000) {
      code = "0" + String(random);
    } else {
      code = String(random);
    }

    // check code is unique
    const db = initDb(c.env.DB);
    const findSameCode = await db.query.emailVerificationTable.findFirst({
      where: and(
        eq(emailVerificationTable.code, code),
        eq(emailVerificationTable.active, true),
        lte(emailVerificationTable.expiresAt, new Date()),
      ),
    });

    if (!findSameCode) {
      break;
    }
  }

  return code;
}
