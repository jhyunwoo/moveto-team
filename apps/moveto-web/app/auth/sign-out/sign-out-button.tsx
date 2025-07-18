"use client";

export default function SignOutButton() {
  return (
    <button
      type={"button"}
      onClick={async () => {
        const reqSignOut = await fetch("http://localhost:8787/auth/sign-out");
        const reqSignOutResponse = await reqSignOut.json();
        console.log(reqSignOutResponse);
      }}
    >
      Sign Out
    </button>
  );
}
