import type { PlopTypes } from "@turbo/gen";
import * as path from "path";
import { execSync } from "child_process";

const TEMPLATE_DIR = path.resolve(__dirname, "../../apps/next-template");
const CF_TEMPLATE_DIR = path.resolve(
  __dirname,
  "../../apps/next-cf-next-template",
);
const HONO_CF_TEMPLATE_DIR = path.resolve(
  __dirname,
  "../../apps/hono-cf-template",
);

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // create a generator
  plop.setGenerator("create-next", {
    description: "create new Next.js app with next-template",
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
        // 실제 템플릿이 있는 apps/next-template 디렉터리
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

  plop.setGenerator("create-next-cf", {
    description: "create new Next.js app with Cloudflare Workers next-template",
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
        // 실제 템플릿이 있는 apps/next-template 디렉터리
        base: CF_TEMPLATE_DIR,
        // 복사할 파일들
        templateFiles: path.join(CF_TEMPLATE_DIR, "**/*"),
        globOptions: {
          dot: true, // .gitignore, .next 등 dotfile 포함
          ignore: [
            "**/.next/**",
            "**/.turbo/**",
            "**/.open-next/**",
            "**/.wrangler/**",
            "**/node_modules/**",
          ],
        },
      },
      // 2) 복사 후 package.json 의 name 필드 수정
      {
        type: "modify",
        path: "apps/{{projectName}}/package.json",
        pattern: /"name"\s*:\s*".*"/,
        template: `"name": "{{projectName}}"`,
      },
      {
        type: "modify",
        path: "apps/{{projectName}}/wrangler.jsonc",
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

  plop.setGenerator("create-hono-cf", {
    description: "create new Hono app with Cloudflare Workers",
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
        // 실제 템플릿이 있는 apps/next-template 디렉터리
        base: HONO_CF_TEMPLATE_DIR,
        // 복사할 파일들
        templateFiles: path.join(HONO_CF_TEMPLATE_DIR, "**/*"),
        globOptions: {
          dot: true, // .gitignore, .next 등 dotfile 포함
          ignore: [
            "**/.wrangler/**",
            "**/.turbo/**",
            "**/node_modules/**",
            "**/applied_sql_files.txt",
          ],
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
