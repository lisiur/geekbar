const jsonfile = require("jsonfile");
const semver = require("semver");
const path = require("path");
const { execSync } = require("child_process");

function incVer(version, type) {
  let [major, minor, patch] = [
    semver.major(version),
    semver.minor(version),
    semver.patch(version),
  ];
  if (type === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type == "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return [major, minor, patch].join(".");
}

const packageJsonPath = path.resolve(__dirname, "../package.json");
const tauriConfJsonPath = path.resolve(
  __dirname,
  "../../tauri.conf.json"
);

const packageJson = jsonfile.readFileSync(packageJsonPath);
const tauriConfJson = jsonfile.readFileSync(tauriConfJsonPath);

const version = incVer(packageJson.version, process.argv[2]);

packageJson.version = version;
tauriConfJson.package.version = version;

jsonfile.writeFileSync(packageJsonPath, packageJson, { spaces: 2 });
jsonfile.writeFileSync(tauriConfJsonPath, tauriConfJson, { spaces: 2 });

execSync(`git add -A`);
execSync(`git commit -m "chore: Release v${version}"`);
execSync(`git tag v${version}`);
execSync(`git push`);
execSync(`git push --tags`);
