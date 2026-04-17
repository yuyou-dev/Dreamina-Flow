#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const bin = process.env.DREAMINA_BIN || process.env.DREAMINA_CLI || "dreamina";

const commands = [
  { name: "root", args: ["-h"] },
  { name: "text2image", args: ["text2image", "-h"] },
  { name: "image2image", args: ["image2image", "-h"] },
  { name: "image_upscale", args: ["image_upscale", "-h"] },
  { name: "text2video", args: ["text2video", "-h"] },
  { name: "frames2video", args: ["frames2video", "-h"] },
  { name: "multiframe2video", args: ["multiframe2video", "-h"] },
  { name: "login", args: ["login", "-h"] },
  { name: "relogin", args: ["relogin", "-h"] },
  { name: "import_login_response", args: ["import_login_response", "-h"] },
  { name: "list_task", args: ["list_task", "-h"] },
  { name: "query_result", args: ["query_result", "-h"] },
  { name: "session", args: ["session", "-h"] },
  { name: "user_credit", args: ["user_credit", "-h"] },
  { name: "multimodal2video", args: ["multimodal2video", "-h"] },
  { name: "image2video", args: ["image2video", "-h"] },
];

const outputs = new Map();
const failures = [];

function runHelp(name, args) {
  const result = spawnSync(bin, args, {
    encoding: "utf8",
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const combined = [stdout.trimEnd(), stderr.trimEnd()].filter(Boolean).join("\n");

  outputs.set(name, combined);

  if (result.error) {
    failures.push({
      name,
      kind: "command-error",
      message: `${bin} ${args.join(" ")} failed to start: ${result.error.message}`,
      excerpt: combined || result.error.message,
    });
    return;
  }

  if (result.status !== 0) {
    failures.push({
      name,
      kind: "non-zero-exit",
      message: `${bin} ${args.join(" ")} exited with code ${result.status}`,
      excerpt: combined || "<no output>",
    });
  }
}

function linesAround(text, needle, radius = 2, fallbackLines = 20) {
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex((line) => line.toLowerCase().includes(needle.toLowerCase()));
  if (index === -1) {
    return lines.slice(0, fallbackLines).join("\n");
  }

  const start = Math.max(0, index - radius);
  const end = Math.min(lines.length, index + radius + 1);
  return lines.slice(start, end).join("\n");
}

function hasStandaloneLab(text) {
  return /\blab\b/i.test(text);
}

function assertContains(name, expected, text, label = expected) {
  if (!text.includes(expected)) {
    failures.push({
      name,
      kind: "missing-pattern",
      message: `expected ${name} help to contain ${JSON.stringify(label)}`,
      excerpt: linesAround(text, expected),
    });
  }
}

function assertNotContains(name, forbidden, text, label = forbidden) {
  if (forbidden === "lab") {
    if (hasStandaloneLab(text)) {
      failures.push({
        name,
        kind: "forbidden-pattern",
        message: `expected ${name} help to avoid standalone ${JSON.stringify(label)}`,
        excerpt: linesAround(text, forbidden),
      });
    }
    return;
  }

  if (text.includes(forbidden)) {
    failures.push({
      name,
      kind: "forbidden-pattern",
      message: `expected ${name} help to avoid ${JSON.stringify(label)}`,
      excerpt: linesAround(text, forbidden),
    });
  }
}

function assertAllContain(names, expected, label = expected) {
  for (const name of names) {
    assertContains(name, expected, outputs.get(name) || "", label);
  }
}

for (const command of commands) {
  runHelp(command.name, command.args);
}

const root = outputs.get("root") || "";
const text2image = outputs.get("text2image") || "";
const image2image = outputs.get("image2image") || "";
const imageUpscale = outputs.get("image_upscale") || "";
const text2video = outputs.get("text2video") || "";
const frames2video = outputs.get("frames2video") || "";
const multiframe2video = outputs.get("multiframe2video") || "";
const login = outputs.get("login") || "";
const relogin = outputs.get("relogin") || "";
const importLoginResponse = outputs.get("import_login_response") || "";
const listTask = outputs.get("list_task") || "";
const queryResult = outputs.get("query_result") || "";
const session = outputs.get("session") || "";
const userCredit = outputs.get("user_credit") || "";
const multimodal2video = outputs.get("multimodal2video") || "";
const image2video = outputs.get("image2video") || "";
const generatorCommands = [
  "text2image",
  "image2image",
  "image_upscale",
  "text2video",
  "image2video",
  "frames2video",
  "multiframe2video",
  "multimodal2video",
];

assertContains("root", "import_login_response", root, "import_login_response");
assertContains("root", "list_task", root, "list_task");
assertContains("root", "query_result", root, "query_result");
assertContains("root", "session", root, "session");
assertAllContain(generatorCommands, "--session", "--session");
assertAllContain(generatorCommands, "--poll", "--poll");
assertNotContains("text2image", "lab", text2image, "lab");
assertNotContains("image2image", "lab", image2image, "lab");
assertContains("image2image", "1 to 10", image2image, "1 to 10");
assertContains("image_upscale", "4k and 8k require VIP", imageUpscale, "4k and 8k require VIP");
assertContains("login", "--headless", login, "--headless");
assertContains("login", "QR code", login, "QR code");
assertContains("relogin", "--headless", relogin, "--headless");
assertContains("relogin", "QR code", relogin, "QR code");
assertContains("import_login_response", "--file", importLoginResponse, "--file");
assertContains("import_login_response", "stdin", importLoginResponse, "stdin");
assertContains("list_task", "--gen_status", listTask, "--gen_status");
assertContains("list_task", "--limit", listTask, "--limit");
assertContains("query_result", "--download_dir", queryResult, "--download_dir");
assertContains("session", "create", session, "create");
assertContains("session", "list", session, "list");
assertContains("session", "search", session, "search");
assertContains("session", "rename", session, "rename");
assertContains("session", "delete", session, "delete");
assertContains("session", "--session=<id>", session, "--session=<id>");
assertContains("user_credit", "remaining Dreamina credits", userCredit, "remaining Dreamina credits");
assertContains("text2video", "default: seedance2.0fast", text2video, "default: seedance2.0fast");
assertContains("frames2video", "default model_version: seedance2.0fast", frames2video, "default model_version: seedance2.0fast");
assertContains("multiframe2video", "default each segment to 3", multiframe2video, "default each segment to 3");
assertContains(
  "root/multimodal2video",
  "全能参考 / formerly ref2video",
  `${root}\n${multimodal2video}`,
  "全能参考 / formerly ref2video",
);
assertContains("image2video", "3.0_fast", image2video, "3.0_fast");
assertContains("image2video", "3.0_pro", image2video, "3.0_pro");
assertContains("image2video", "3.5_pro", image2video, "3.5_pro");

if (failures.length === 0) {
  console.log(`cli help audit passed (${commands.length} commands checked)`);
  process.exit(0);
}

console.error(`cli help audit failed (${failures.length} issue${failures.length === 1 ? "" : "s"})`);
for (const [index, failure] of failures.entries()) {
  console.error("");
  console.error(`${index + 1}. [${failure.name}] ${failure.message}`);
  if (failure.excerpt) {
    console.error(indentBlock("   ", failure.excerpt));
  }
}

process.exit(1);

function indentBlock(prefix, text) {
  return text
    .split(/\r?\n/)
    .map((line) => `${prefix}${line}`)
    .join("\n");
}
