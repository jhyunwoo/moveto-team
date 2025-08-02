/**
 * 비밀번호를 해시하는 함수
 *
 * Argon2id 알고리즘 사용
 *
 * 마이크로서비스 형식으로 argon2id 해시를 생성하는 워커에 해시를 요청하여 해시된 값을 받아옴
 * @param fetcher context에 env 안에 있는 ARGON2
 * @param text 해시할 텍스트
 */
export async function hashText(
  fetcher: Fetcher,
  text: string,
): Promise<string> {
  // argon2 worker에 텍스트 해시 요청
  const resp = await fetcher.fetch("http://internal/hash", {
    method: "POST",
    body: JSON.stringify({
      password: text,
      options: {
        timeCost: 4,
        memoryCost: 65536,
        parallelism: 1,
      },
    }),
  });

  // 요청이 실패할 경우 오류 처리
  if (!resp.ok) {
    throw new Error("Failed to fetch hash");
  }

  // 해시된 텍스트를 반환
  const { hash } = (await resp.json()) as { hash: string };

  return hash;
}

/**
 * 입력한 비밀번호와 해시된 비밀번호가 같은지 확인하는 함수
 * @param fetcher context에 env 안에 있는 ARGON2
 * @param text 해시할 텍스트
 * @param hash 해시된 텍스트
 */
export async function verifyHash(fetcher: Fetcher, text: string, hash: string) {
  // argon2 worker에 텍스트 해시 검증 요청
  const res = await fetcher.fetch("http://internal/verify", {
    method: "POST",
    body: JSON.stringify({
      password: text,
      hash: hash,
    }),
  });

  // 요청 실패시 오류 처리
  if (!res.ok) {
    throw new Error("Failed to verify hash");
  }

  // 값이 같으면 true, 다르면 false 반환
  const { matches } = (await res.json()) as { matches: boolean };

  return matches;
}
