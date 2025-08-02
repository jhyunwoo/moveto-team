import initDb from "../db";
import { Context } from "hono";
import { ENV } from "../types/env";
import { Kv } from "../lib/kv";
import { eq } from "drizzle-orm";
import { sessionTable, userTable } from "../db/schema";
import { Session } from "../types/session";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";

export class SessionController {
  private readonly db;
  private readonly context;
  private kv;

  constructor(c: Context<ENV>) {
    this.db = initDb(c.env.DB);
    this.context = c;
    this.kv = new Kv(c.env.KV);
  }

  /**
   * 세션을 생성하고 세션 정보를 DB, KV, 쿠키에 저장함
   * @param userId 사용자 id
   */
  async create(userId: string): Promise<boolean> {
    // 올바른 사용자인지 검증
    const userData = await this.db.query.userTable.findFirst({
      where: eq(userTable.id, userId),
    });

    // DB 에서 사용자의 id를 찾을 수 없을 경우
    if (!userData) {
      console.error("존재하지 않은 사용자");
      return false;
    }

    // 세션 만료 시간 계산
    const now = new Date(); // 현재 시간
    const expiresDate = new Date();
    expiresDate.setDate(now.getDate() + 30);

    // 세션 생성
    const sessionId = crypto.randomUUID(); // 세션 id
    const sessionData: Session = {
      // 세션 정보 (사용자 id, 만료일)
      userId: userData.id,
      expiresAt: expiresDate,
    };

    // DB 에 세션 데이터 저장
    await this.db
      .insert(sessionTable)
      .values({ id: sessionId, ...sessionData });

    // KV 에 세션 데이터 저장 (세션 id, 세션 데이터)
    await this.kv.putKv(sessionId, JSON.stringify(sessionData));

    // 쿠키에 세션 정보 저장
    await this.setCookie(sessionId, expiresDate);

    return true;
  }

  /**
   * 세션 id를 받아서 해당 세션을 비활성화 하는 함수
   *
   * KV 에서만 세션을 삭제함
   * @param sessionId
   */
  async deactivate(sessionId: string) {
    return Promise.all([
      this.db.delete(sessionTable).where(eq(sessionTable.id, sessionId)),
      this.kv.deleteKv(sessionId),
    ]);
  }

  async revalidate(sessionId: string) {
    const sessionKv = await this.kv.getKv(sessionId);

    if (!sessionKv) {
      console.error("세션을 KV 에서 찾을 수 없습니다.");
      return false;
    }

    const sessionData = JSON.parse(sessionKv) as Session;

    // 기존 세션 삭제
    await this.remove();

    await this.create(sessionData.userId);
  }

  /**
   * 현재 세션을 삭제하는 함수
   *
   * 로그아웃 상황에서 사용
   *
   * DB, KV, Cookie 에서 세션 정보 삭제
   */
  async remove() {
    // 세션 id를 현재 요청에서 가져옴
    const sessionId = await getSignedCookie(
      this.context,
      "session",
      this.context.env.COOKIE_SECRET,
    );
    // 만약 세션 id가 없을 경우 종료
    if (!sessionId) {
      return true;
    }

    // 세션 id가 있을 경우 세션 비활성화 후 쿠키에서 세션 삭제
    await this.deactivate(sessionId);
    this.deleteCookie();

    return true;
  }

  /**
   * 쿠키에 세션 값 저장
   * @param sessionId 세션 id
   * @param expiresAt 세션 만료일
   */
  async setCookie(sessionId: string, expiresAt: Date): Promise<void> {
    return setSignedCookie(
      this.context,
      "session",
      sessionId,
      this.context.env.COOKIE_SECRET,
      {
        expires: expiresAt,
        sameSite: "Lax",
        secure: this.context.env.API_URL.startsWith("https"),
        httpOnly: true,
        domain: this.context.env.API_URL,
      },
    );
  }

  /**
   * 세션 정보를 쿠키에서 삭제
   *
   * 삭제 성공 -> 세션 값 반환
   *
   * 삭제 실패 -> undefined 반환
   */
  deleteCookie(): string | undefined {
    return deleteCookie(this.context, "session");
  }
}
