import { cookies } from "next/headers";
import { fetch } from "next/dist/compiled/@edge-runtime/primitives";

export default async function checkSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const checkSession = await fetch(process.env.API_URL + "/auth/session", {
    method: "GET",
    credentials: "include",
    headers: {
      Cookie: `session=${session?.value}`,
    },
  });

  const result = (await checkSession.json()) as {
    session: { userId: string; expires: Date } | null;
  };

  return result.session;
}
