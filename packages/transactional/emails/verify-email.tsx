import {
  Container,
  Head,
  Heading,
  Link,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

export default function VerifyEmail({
  verificationCode,
  redirectUrl,
}: {
  verificationCode: string;
  redirectUrl: string;
}) {
  return (
    <Tailwind>
      <Head>
        <title>{`모베토 이메일 인증 코드 - ${verificationCode}`}</title>
      </Head>
      <Container className={"p-4 pb-20 w-full bg-[#f5f5f5]"}>
        <Heading as={"h1"}>모베토 이메일 인증 코드</Heading>
        <Text>이메일 인증을 위해 아래 코드를 이메일 인증에 입력해주세요.</Text>
        <table className="w-full bg-white p-2 rounded-md mb-4">
          <tr className="w-full">
            <td align="center" className={"text-4xl font-bold pt-2"}>
              {verificationCode}
            </td>
          </tr>
        </table>
        <table className="w-full">
          <tr className="w-full">
            <td align="center">
              <Link
                className={"p-2 rounded-full bg-black text-white text-sm px-4"}
                href={redirectUrl}
              >
                이메일 인증으로 이동
              </Link>
            </td>
          </tr>
        </table>
      </Container>

      <Section className="text-center mt-24">
        <table className="w-full">
          <tr className="w-full">
            <td align="center">
              <Text className="my-[8px] font-semibold text-[16px] text-gray-900 leading-[24px]">
                Moveto Team
              </Text>
            </td>
          </tr>
          <tr>
            <td align="center">
              <Text className="mt-[4px] mb-0 font-semibold text-[16px] text-gray-500 leading-[24px]">
                support@moveto.kr
              </Text>
            </td>
          </tr>
        </table>
      </Section>
    </Tailwind>
  );
}
