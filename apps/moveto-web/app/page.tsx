import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SignOutButton from "./auth/sign-out/sign-out-button";

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  const session = await fetch("http://localhost:8787/auth/session", {
    headers: {
      Cookie: `session=${sessionToken}`, // 👈 쿠키를 직접 붙여야 함
    },
  });

  const sessionData = (await session.json()) as {
    session: { id: string };
    user: { username: string };
  } | null;

  if (!sessionData?.session?.id) {
    redirect("/auth/log-in");
  }

  return (
    <div
      className={"w-full h-screen flex items-center justify-center text-center"}
    >
      <h1 className={"text-4xl font-bold"}>{sessionData?.user?.username}</h1>
      <SignOutButton />
    </div>
  );
}
