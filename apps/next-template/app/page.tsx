import { ReactElement } from "react";

export default function HomePage(): ReactElement {
  return (
    <div
      className={
        "w-full h-screen flex items-center justify-center flex-col p-4"
      }
    >
      <h1 className={"text-4xl font-bold"}>Home Page</h1>
    </div>
  );
}
