export async function sha512PasswordHash(
  id: string,
  password: string,
): Promise<string> {
  const encoder = new TextEncoder();
  // salt 값을 사용자 id로 사용 (id는 uuid v4를 통해 생성됨)
  const data = encoder.encode(id + password);

  let hashBuffer = await crypto.subtle.digest("SHA-512", data);

  // hash 5번 추가 실행
  for (let i = 0; i < 5; i++) {
    hashBuffer = await crypto.subtle.digest("SHA-512", hashBuffer);
  }

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
