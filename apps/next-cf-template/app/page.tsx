import { ReactElement } from "react";

export default function HomePage(): ReactElement {
  return (
    <div
      className={"w-full h-screen flex items-center justify-center text-center"}
    >
      <h1 className={"text-4xl font-bold"}>Next.js with Cloudflare Workers</h1>
    </div>
  );
}
