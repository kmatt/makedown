#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");
const os = require("os");
const package = require("../package.json");

let sources = [];

const interpreters = {
  zsh: "zsh",
  sh: "sh",
  bash: "bash",
  js: "node",
  javascript: "node",
  py: "python",
  python: "python"
};

const extensions = {
  zsh: "zsh",
  sh: "sh",
  bash: "bash",
  node: "mjs",
  python: "py"
};

function findMarkdownFiles(folder) {
  const results = [];
  const files = fs.readdirSync(folder);

  for (const file of files) {
    const filePath = path.join(folder, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results.push(...findMarkdownFiles(filePath));
    } else if (stat.isFile() && path.extname(file).toLowerCase() === ".md") {
      results.push(filePath);
    }
  }

  return results;
}

let dir = process.cwd();

for (;;) {
  const file = path.join(dir, "x.md");
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    sources.push(file);
  }
  const folder = path.join(dir, "x");
  if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
    sources.push(...findMarkdownFiles(folder));
  }
  if (dir === "/") break;
  dir = path.dirname(dir);
}

sources.sort();

const modules = sources
  .map((source) => {
    const content = fs.readFileSync(source, "utf8");
    return { source, content: content.trim() };
  })
  .map(({ source, content }) => ({
    source,
    info: content
      .split(/^## /m)[0]
      .replace(/^# .*$/m, "")
      .trim(),
    commands: content
      .split(/^## /gm)
      .slice(1)
      .map((block) => {
        const body = block.slice(block.indexOf("\n") + 1).trim();
        const info = body.split("```")[0].trim();
        const code = body.split("```")[1].trim();
        return {
          name: block.split("\n")[0].trim(),
          info,
          type: code.split("\n")[0].trim(),
          code: code.split("\n").slice(1).join("\n")
        };
      })
  }));

function red(text) {
  return `\x1b[31m${text}\x1b[0m`;
}

function green(text) {
  return `\x1b[32m${text}\x1b[0m`;
}

function blue(text) {
  return `\x1b[34m${text}\x1b[0m`;
}

function underline(text) {
  return `\x1b[4m${text}\x1b[0m`;
}

if (!process.argv[2] || process.argv[2] === "--help") {
  console.log(blue(`\n# x.md version ${package.version}\n`));

  console.log("The following x commands are available:\n");
  let maxLength = 0;
  for (const { source, commands } of modules) {
    const p = path.relative(".", source);
    maxLength = Math.max(maxLength, p.length + 5);
    for (const { name } of commands) {
      maxLength = Math.max(maxLength, name.length + 2);
    }
  }
  for (const { source, commands, info } of modules) {
    const p = path.relative(".", source);

    const i = info.split("\n")[0].trim();

    if (i) {
      console.log(green(`## ${p}`.padEnd(maxLength) + `  -  ${i}`) + "\n");
    } else {
      console.log(green(`## ${p}`.padEnd(maxLength) + "\n"));
    }

    for (const { name, info } of commands) {
      const line = info.trim().split("\n")[0];
      if (line) {
        console.log(
          blue(`${"    x " + name.padEnd(maxLength - 6)}`),
          " - ",
          line
        );
      } else {
        console.log(blue(`${"    x " + name.padEnd(maxLength - 6)}`));
      }
    }
    console.log();
  }
  console.log("Passs --help argument to any x command to get more info.\n");
  process.exit(0);
}

if (process.argv[2] === "--zsh-completion") {
  console.log(`\
    # BEGIN x.md completions

    function _x_completion {
      local -a options
      options=(\${(f)"$(x --list-commands 2>/dev/null)"})
      _describe "choices" options
      }

      compdef _x_completion x

      # END x.md completions
      `);
  process.exit(0);
}

if (process.argv[2] === "--list-commands") {
  commands.forEach((c) => console.log(c.name));
  process.exit(0);
}

for (const { source, commands, info } of modules) {
  for (const { name, info, type, code } of commands) {
    if (name !== process.argv[2]) continue;

    if (process.argv[3] === "--help") {
      console.log(info);
      process.exit(0);
    }

    if (interpreters[type]) {
      const p = path.join(
        ".",
        `.x-${Date.now()}-${Math.random()}.${extensions[interpreters[type]]}`
      );

      function cleanup() {
        if (fs.existsSync(p)) {
          try {
            fs.unlinkSync(p);
          } catch (error) {
            console.error(`Error removing temporary file ${p}:`, error.message);
          }
        }
      }

      try {
        fs.writeFileSync(p, code);
        const result = spawnSync(
          interpreters[type],
          [p, ...process.argv.slice(3)],
          {
            stdio: "inherit",
            encoding: "utf-8"
          }
        );
        cleanup();
        process.exit(result.status);
      } catch (error) {
        console.error(
          red(`x: error executing ${type} command: ${error.message}`)
        );
        cleanup();
        process.exit(1);
      }
    } else {
      console.error(red(`x: unsupported interpreter ${type}`));
    }
    process.exit(0);
  }
}

console.error(red(`x: command not found: ${process.argv[2]}`));
process.exit(1);