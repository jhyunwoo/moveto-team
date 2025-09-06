import { redirect } from "next/navigation";
import checkSession from "../lib/checkSession";

export default async function HomePage() {
  const session = await checkSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div
      className={"w-full h-screen flex items-center justify-center text-center"}
    >
      <div>Hello</div>
    </div>
  );
}
