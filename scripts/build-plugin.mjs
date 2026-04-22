import { execSync } from "child_process";
import { mkdirSync, copyFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PLUGIN_DIR = join(ROOT, "plugin");
const DIST_PLUGIN_DIR = join(ROOT, "dist", "plugin");

const JAR_NAME = "server-additions-2.0.0.jar";

const mvnPlatform = process.platform === "win32" ? "mvn.cmd" : "mvn";

const mvnPaths = [
  join("C:", "tools", "apache-maven-3.9.6", "bin", mvnPlatform),
  join("C:", "tools", "apache-maven-3.9.9", "bin", mvnPlatform),
  process.platform === "win32" ? "mvn.cmd" : "mvn",
];

let mvn = null;
for (const candidate of mvnPaths) {
  try {
    execSync(`"${candidate}" --version`, { stdio: "pipe", cwd: PLUGIN_DIR });
    mvn = candidate;
    break;
  } catch {}
}

if (!mvn) {
  const targetJar = join(PLUGIN_DIR, "target", JAR_NAME);
  if (existsSync(targetJar)) {
    console.log("Maven not found, using existing plugin JAR");
  } else {
    console.error("Maven not found and no existing plugin JAR. Install Maven or run: npm run build:plugin");
    process.exit(1);
  }
} else {
  console.log("Building plugin with Maven...");
  execSync(`"${mvn}" clean package -q`, { stdio: "inherit", cwd: PLUGIN_DIR });
}

mkdirSync(DIST_PLUGIN_DIR, { recursive: true });
copyFileSync(join(PLUGIN_DIR, "target", JAR_NAME), join(DIST_PLUGIN_DIR, JAR_NAME));
console.log(`Plugin copied to dist/plugin/${JAR_NAME}`);