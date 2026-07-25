import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

async function collectTextFiles(directory, extensions) {
  const files = [];

  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const resolved = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(resolved);
      } else if (extensions.has(path.extname(entry.name))) {
        files.push(resolved);
      }
    }
  }

  await visit(directory);
  return files;
}

async function readCorpus(files) {
  const entries = await Promise.all(
    files.map(async (file) => ({
      file: path.relative(repositoryRoot, file),
      text: await readFile(file, "utf8"),
    })),
  );

  return entries;
}

const forbiddenPublicPatterns = [
  ["consumer email address", /[A-Z0-9._%+-]+@gmail\.com/i],
  ["private-owner product description", /RJ['’]s\s+private/i],
  [
    "fixed experience duration",
    /\b(?:ten|10\+?)\s+years?\s+(?:of\s+)?(?:shipping|production|software|engineering|robotics)/i,
  ],
  ["fixed primary specialization", /Primary specialization\s*:/i],
  [
    "fixed education plan",
    /Research degree[\s\S]{0,100}Not the plan/i,
  ],
  [
    "owner-specific career campaign",
    /India Evidence-to-Interview Campaign/i,
  ],
  [
    "fixed tutor learner identity",
    /experienced software engineer who is new to robotics/i,
  ],
  [
    "bundled owner résumé profile",
    /senior\s+(?:Web|software|production)[\s\S]{0,160}(?:Flutter|mobile)[\s\S]{0,160}(?:Python|Java)/i,
  ],
];

test("public source, built output, and generated Tutor context contain no fixed private profile", async () => {
  const sourceFiles = [
    ...(await collectTextFiles(
      path.join(repositoryRoot, "app"),
      new Set([".ts", ".tsx"]),
    )),
    path.join(repositoryRoot, "functions", "src", "tutor-context.ts"),
    path.join(
      repositoryRoot,
      "functions",
      "src",
      "generated",
      "lesson-context.json",
    ),
    path.join(repositoryRoot, "README.md"),
    path.join(repositoryRoot, "firebase.json"),
  ];
  const builtFiles = await collectTextFiles(
    path.join(repositoryRoot, "out"),
    new Set([".html", ".js", ".json", ".txt", ".xml"]),
  );
  const corpus = (await readCorpus([...sourceFiles, ...builtFiles])).map(
    (entry) => (
      entry.file === "firebase.json"
        ? {
            ...entry,
            text: entry.text.replace(
              /"supportEmail":\s*"rjchakraborty21@gmail\.com"/,
              '"supportEmail": "<approved-operational-address>"',
            ),
          }
        : entry
    ),
  );

  for (const [label, pattern] of forbiddenPublicPatterns) {
    const match = corpus.find(({ text }) => pattern.test(text));
    assert.equal(
      match,
      undefined,
      `${label} must not appear in public or Tutor content; found in ${match?.file}`,
    );
  }
});

test("career guidance stays neutral and Firebase Auth uses only the approved operational support address", async () => {
  const careerView = await readFile(
    path.join(repositoryRoot, "app", "career-view.tsx"),
    "utf8",
  );
  const firebaseConfig = JSON.parse(
    await readFile(path.join(repositoryRoot, "firebase.json"), "utf8"),
  );

  assert.match(careerView, /useState<string \| null>\(null\)/);
  assert.doesNotMatch(careerView, /useState\(targetRoles\[0\]\.id\)/);
  assert.match(careerView, /No recommendation inferred/);
  assert.deepEqual(
    firebaseConfig.auth.providers.googleSignIn,
    {
      oAuthBrandDisplayName: "RobotShift",
      supportEmail: "rjchakraborty21@gmail.com",
      authorizedRedirectUris: [
        "https://robotshift.web.app/__/auth/handler",
      ],
    },
  );
});
