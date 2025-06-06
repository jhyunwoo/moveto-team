import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // create a generator
  plop.setGenerator("create-app", {
    description: "create new Next.js app with template",
    // gather information from the user
    prompts: [
      {
        type: "input",
        name: "projectName",
        message: "Please enter project name:",
      },
    ],
    actions: [
      {
        type: "addMany",
        // 복사된 파일이 들어갈 폴더 경로. projectName 값으로 새 폴더 생성
        destination: "apps/{{projectName}}/",
        // 기준 폴더(템플릿 파일이 있는 경로)
        base: "apps/template",
        // 템플릿으로 사용할 모든 파일
        templateFiles: "apps/template/**",
        // 동일 파일이 있을 때 덮어쓸지 여부
        skipIfExists: false,
      },
    ],
  });
}
