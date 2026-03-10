# AI Dev Pipeline

CLI tool that installs a structured AI development pipeline into your project.

It detects the AI environment automatically and installs the required **agents, rules and skills** so your team can work with a consistent AI-assisted development workflow.

Currently supports:

* Cursor
* Claude
* Windsurf

---

# Install

Run directly with:

```bash
npx ai-dev-pipeline init
```

or install globally:

```bash
npm install -g ai-dev-pipeline
```

then run:

```bash
ai-dev-pipeline init
```

---

# Usage

From the root of your project run:

```bash
ai-dev-pipeline init
```

The CLI will:

1. Detect the AI environment in the project
2. If multiple environments are found, it will ask you which one to use
3. Install the AI development pipeline into the detected environment

Example:

```
? Multiple AI environments detected. Choose where to install:
❯ cursor
  claude
```

---

# What gets installed

The CLI copies the pipeline files into the AI environment directory.

Example result:

```
.cursor
   agents
   rules
   skills
```

These files define the AI development workflow used by the project.

Existing files are **never overwritten**.

If a file already exists:

```
⚠️ Skipped existing file
```

---

# Supported environments

The CLI detects environments by checking the project root for:

```
.cursor
.claude
.windsurf
```

If none are found, the installer will stop.

---

# Example project structure

After running the installer, a project may look like this:

```
project
│
├ .cursor
│   agents
│   rules
│   skills
│
├ src
├ package.json
└ ...
```

---

# Philosophy

AI Dev Pipeline is built around a simple idea:

AI should work like a structured engineering team.

Instead of relying on random prompts, the pipeline introduces defined roles and responsibilities so the AI workflow becomes predictable and maintainable.

Goals:

* avoid hallucinated architecture
* encourage structured reasoning
* separate analysis from implementation
* improve maintainability of AI-generated code

---

# Contributing

Contributions are welcome.

Possible improvements:

* new agents
* new skills
* additional AI environment support
* CLI improvements

---

# License

MIT
