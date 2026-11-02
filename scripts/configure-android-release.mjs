/**
 * Wires the local release keystore into the generated Android project.
 *
 * Run automatically by `npm run build:android`, right before Gradle. Safe to run
 * repeatedly: every edit is anchored and skipped when already present.
 *
 * Credentials are read from `keystores/signing.properties` (gitignored):
 *
 *   storeFile=keystores/tachkila-release.keystore
 *   keyAlias=tachkila
 *   storePassword=…
 *   keyPassword=…
 *
 * The file is never written into the repository.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const gradlePath = path.join(root, "android", "app", "build.gradle");
const propsPath = path.join(root, "android", "gradle.properties");
const secretsPath = path.join(root, "keystores", "signing.properties");

if (!existsSync(gradlePath)) {
  console.error("android/app/build.gradle is missing. Run `npx expo prebuild --platform android` first.");
  process.exit(1);
}

if (!existsSync(secretsPath)) {
  console.error(
    "keystores/signing.properties is missing.\n" +
      "Create it with storeFile, keyAlias, storePassword and keyPassword before building a release."
  );
  process.exit(1);
}

const secrets = Object.fromEntries(
  readFileSync(secretsPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const at = line.indexOf("=");
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
    })
);

for (const key of ["storeFile", "keyAlias", "storePassword", "keyPassword"]) {
  if (!secrets[key]) {
    console.error(`keystores/signing.properties is missing "${key}".`);
    process.exit(1);
  }
}

/* ------------------------------------------------------------- build.gradle */

let gradle = readFileSync(gradlePath, "utf8");

const releaseSigning = `    signingConfigs {
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
        debug {`;

if (!gradle.includes("signingConfigs.release") && !gradle.includes("storeFile file(MYAPP_UPLOAD_STORE_FILE)")) {
  if (!gradle.includes("    signingConfigs {\n        debug {")) {
    console.error("Could not find the signingConfigs block in android/app/build.gradle.");
    process.exit(1);
  }
  gradle = gradle.replace("    signingConfigs {\n        debug {", releaseSigning);
}

const debugRelease = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;

const signedRelease = `        release {
            signingConfig signingConfigs.release`;

if (gradle.includes(debugRelease)) {
  gradle = gradle.replace(debugRelease, signedRelease);
} else if (!gradle.includes("signingConfig signingConfigs.release")) {
  console.error("Could not find the release buildType in android/app/build.gradle.");
  process.exit(1);
}

writeFileSync(gradlePath, gradle);

/* ---------------------------------------------------------- gradle.properties */

const storeFile = secrets.storeFile.replace(/\\/g, "/").replace(/^\.?\//, "");
const wanted = {
  MYAPP_UPLOAD_STORE_FILE: path
    .relative(path.join(root, "android", "app"), path.join(root, storeFile))
    .replace(/\\/g, "/"),
  MYAPP_UPLOAD_KEY_ALIAS: secrets.keyAlias,
  MYAPP_UPLOAD_STORE_PASSWORD: secrets.storePassword,
  MYAPP_UPLOAD_KEY_PASSWORD: secrets.keyPassword,
};

let props = existsSync(propsPath) ? readFileSync(propsPath, "utf8") : "";
for (const [key, value] of Object.entries(wanted)) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(props)) props = props.replace(pattern, line);
  else props += `${props.endsWith("\n") || props === "" ? "" : "\n"}${line}\n`;
}
writeFileSync(propsPath, props);

console.log(`Android release signing ready (${wanted.MYAPP_UPLOAD_STORE_FILE}, alias ${wanted.MYAPP_UPLOAD_KEY_ALIAS}).`);
