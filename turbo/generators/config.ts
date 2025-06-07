import type { PlopTypes } from "@turbo/gen";
import * as path from "path";
import { execSync } from "child_process";

const TEMPLATE_DIR = path.resolve(__dirname, "../../apps/template");

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
        // 새로 생성될 프로젝트 폴더 (프로젝트 루트 기준)
        destination: "apps/{{projectName}}/",
        // 실제 템플릿이 있는 apps/template 디렉터리
        base: TEMPLATE_DIR,
        // 복사할 파일들
        templateFiles: path.join(TEMPLATE_DIR, "**/*"),
        globOptions: {
          dot: true, // .gitignore, .next 등 dotfile 포함
          ignore: ["**/.next/**", "**/.turbo/**", "**/node_modules/**"],
        },
      },
      // 2) 복사 후 package.json 의 name 필드 수정
      {
        type: "modify",
        path: "apps/{{projectName}}/package.json",
        pattern: /"name"\s*:\s*".*"/,
        template: `"name": "{{projectName}}"`,
      },
      // 복사 후 dependencies 설치
      (answers: { projectName: string }) => {
        const targetDir = path.resolve(
          process.cwd(),
          "apps",
          answers.projectName,
        );
        console.log(`\n🛠 Installing dependencies in ${targetDir}...\n`);
        execSync("pnpm install", { cwd: targetDir, stdio: "inherit" });
        return "✅ Dependencies installed";
      },
    ],
  });
}
