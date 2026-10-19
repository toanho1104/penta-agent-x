# 🚀 Penta-Agent-X (`penta-agent-x`)

[![npm version](https://img.shields.io/npm/v/penta-agent-x.svg?style=flat-square&color=00b4d8)](https://www.npmjs.com/package/penta-agent-x)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Platforms](https://img.shields.io/badge/Platforms-Cursor%20%7C%20Claude%20%7C%20Antigravity%20%7C%20Codex-10b981.svg?style=flat-square)](https://www.npmjs.com/package/penta-agent-x)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A production-grade **5-Agent + Master Orchestrator & Pluggable Tech Skill Framework** designed to eliminate **Context Rot** in growing codebases. Built for seamless cross-platform use across **Cursor IDE**, **Claude Code (CLI)**, **Google Antigravity**, and **OpenAI Codex**.

---

## 📌 1. Why Penta-Agent-X?

When a codebase grows, relying on a single AI Agent in a long chat session inevitably leads to **Context Rot**: the AI forgets architectural boundaries, recreates existing shared components, and introduces regressions into legacy features.

**Penta-Agent-X** solves this through **three core engineering principles**:
1. **Role-Based Context Isolation (5 Core Agents + 1 Master Orchestrator):** Divides software engineering responsibilities across specialized agents (**BA**, **Architect**, **Dev**, **QA**, **Doc Keeper**) that communicate strictly via structured `.md` artifacts.
2. **Unified Single-Folder 3-Tier Workspace Memory:**
   Everything is neatly encapsulated inside your chosen platform's single root folder (`.cursor/`, `.claude/`, or `.agents/`) — zero clutter in your project root:
   ```text
   .cursor/ (or .claude/ or .agents/)
   ├── rules/ (or agents/)  # Native Agent rules (@auto, @ba, @arch, @dev, @qa, @doc)
   ├── commands/            # Native Slash commands (/auto, /ba, /arch, /dev, /qa, /doc)
   └── workspace/           # 3-Tier AI Memory & Installed Tech Skills
       ├── config.json          # Workspace settings & installed tech skills
       ├── PROJECT_MEMORY.md    # [Tier 1] Global project map (< 300 lines) — read first by all agents
       ├── CHANGELOG_DOC.md     # Living specification & release log ready for Word/PDF/Wiki export
       ├── sync-state.json      # Git checkpoint tracker ({ "lastSyncedCommit": "<hash>" })
       ├── skills/              # Installed Pluggable Tech Skills (nextjs, react-native, flutter...)
       ├── active/              # [Tier 2] Scratchpad for ONLY the single feature currently in progress
       │   ├── spec.md          # Automatically compacted into features/<name>.md and wiped clean
       │   ├── ui-spec.md       # upon completion so the next feature starts 100% fresh
       │   ├── plan.md
       │   └── review-report.md
       └── features/            # [Tier 3] Permanent feature vault loaded on-demand when updating a feature
           └── auth-login.md
   ```
3. **Git Commit Checkpoint Sync (`lastSyncedCommit`):** When you write code manually across multiple commits (or `git pull` teammates' commits) without AI, `npx penta-agent-x sync` diffs `lastSyncedCommit..HEAD` so the **Doc Agent** brings your AI memory 100% back in sync.

---

## 🤖 2. The 5 Core Agents + Master Orchestrator

| # | Agent / Trigger | Primary Responsibility | Output Artifacts |
| :--- | :--- | :--- | :--- |
| **0** | **Master Orchestrator (`@auto` / `/auto`)** | **End-to-End Conductor:** Automatically drives Phase 1 (BA) → Phase 2 (Architect) → Phase 3 (Dev loop) → Phase 4 (QA & auto-fix) → Phase 5 (Doc & cleanup). | Full feature delivery + updated `PROJECT_MEMORY.md` |
| **1** | **BA / Product Agent (`@ba` / `/ba`)** | Analyzes requirements & UI screenshots, asks clarifying questions if ambiguous, identifies edge cases, and writes specs. | `active/spec.md`, `active/ui-spec.md` |
| **2** | **Architect Agent (`@arch` / `/arch`)** | Reads BA specs & `PROJECT_MEMORY.md`, identifies reusable components, designs APIs/data models, and plans sequential atomic tasks. | `active/plan.md` |
| **3** | **Dev Agent (`@dev` / `/dev`)** | Executes **one atomic task at a time** from `plan.md` using installed **Pluggable Tech Skills** (`nextjs`, `react-native`, `reactjs`, `elysiajs`, `nestjs`, `flutter`). | Production-ready Source Code |
| **4** | **QA / Reviewer Agent (`@qa` / `/qa`)** | Audits code changes against `spec.md` & `plan.md`, checks for regressions/anti-patterns, and writes Unit/Integration Tests. | Test Files + `active/review-report.md` |
| **5** | **Doc / Memory Keeper (`@doc` / `/doc`)** | Compacts completed feature context into `features/`, updates `PROJECT_MEMORY.md` & `CHANGELOG_DOC.md`, records `lastSyncedCommit`, and cleans `active/`. | Updated `features/*.md`, `PROJECT_MEMORY.md`, `sync-state.json` |

---

## 🛠️ 3. Quick Start & Initialization (`init`)

### Run directly via `npx` (Recommended):
```bash
npx penta-agent-x init
```

### Or install globally to use short aliases (`penta` / `penta-agent`):
```bash
npm install -g penta-agent-x
penta init
```

### What the 4-Step Interactive `init` Wizard Does:
1. **Step 1 — Select Target AI Platform:**
   - Choose your AI coding tool: `Cursor IDE` | `Claude Code (CLI)` | `Google Antigravity` | `OpenAI Codex`.
   - Automatically generates all rules, slash commands, skills, and 3-tier memory inside that platform's single folder (`.cursor/`, `.claude/`, or `.agents/`).
2. **Step 2 — Select Project Mode:**
   - **Existing Project (Brownfield):** Runs a zero-token scanner on your directory tree, `package.json`/`pubspec.yaml`, and shared UI/utility folders to generate `workspace/scan-report.md`. Then run `@onboard` (or `/onboard`) in your chat so the **Architect Agent** populates `PROJECT_MEMORY.md`.
   - **New Project (Greenfield):** Choose from 5 categories (`FE`, `BE`, `Mobile`, `Fullstack`, `None`) and stacks (`Next.js`, `React.js`, `ElysiaJS`, `NestJS`, `React Native`, `Flutter`) to scaffold a standard directory structure inside `PROJECT_MEMORY.md`.
3. **Step 3 — Select Pluggable Tech Skills for the Dev Agent:**
   - Multi-select (`Space` to toggle, `Enter` to confirm): `nextjs`, `react-native`, `reactjs`, `elysiajs`, `nestjs`, `flutter`.
4. **Step 4 — Track in Git or Ignore (`Yes` / `No`):**
   - Choose **`Yes`** to commit the AI workspace to Git and share `PROJECT_MEMORY.md` with your team, or **`No`** to automatically append the directory (e.g., `.cursor/`) to `.gitignore` so it stays 100% local on your machine.

---

## 💻 4. Daily Usage Guide

### A. In **Cursor IDE** (Chat Panel)

| Use Case | Prompt in Cursor Chat | What Happens |
| :--- | :--- | :--- |
| **1. Build a Feature Automatically (A → Z)** | `@auto Build Login with Email & Google [attach UI image]` | Runs the full pipeline automatically: **BA** (`spec.md`) → **Architect** (`plan.md`) → **Dev** (Sequential tasks) → **QA** (Audit & Tests) → **Doc** (Archives to `features/`, updates `PROJECT_MEMORY.md`, records Git commit & cleans `active/`). |
| **2. Step-by-Step Manual Control** | • `@ba Build Login...`<br>• `@arch Create plan`<br>• `@dev Execute task 1`<br>• `@qa Audit & test`<br>• `@doc Finalize feature` | Press `Ctrl + N` (`Cmd + N`) between steps to start a fresh chat tab with 100% isolated context. |
| **3. Fast-Track Small Bugfix (`@hotfix`)** | Select code lines (`Ctrl + L`) → Type:<br>`@hotfix Disable submit button while loading` | Bypasses the 5-step ceremony: fixes the selected code directly using your Tech Skill and performs a lightweight memory check. |
| **4. Onboard an Existing Project** | `@onboard` | Architect Agent reads `workspace/scan-report.md` and populates `PROJECT_MEMORY.md`. |
| **5. Sync Manual Code Commits** | `@sync` *(or run `npx penta-agent-x sync` first)* | Doc Agent inspects Git history from `lastSyncedCommit..HEAD` and updates `PROJECT_MEMORY.md`, `features/*.md`, and `CHANGELOG_DOC.md`. |

---

### B. In **Claude Code (`claude` CLI)**, **Google Antigravity**, & **OpenAI Codex**

Use slash commands (`/auto`, `/ba`, `/arch`, `/dev`, `/qa`, `/doc`, `/hotfix`, `/sync`, `/onboard`) directly in chat:

1. **Full Auto-Pilot Pipeline (A → Z):**
   ```text
   /auto Build Login with Email/Password and Google. UI mockup at ./designs/login.png
   ```
2. **Granular Step-by-Step Control:**
   ```text
   /ba Build shopping cart feature...
   /arch
   /dev task 1
   /qa
   /doc
   ```
3. **Fast-Track Bugfix at a Specific File/Line (`/hotfix`):**
   ```text
   /hotfix In @src/components/LoginForm.tsx line 45, disable the submit button while loading to prevent double-clicks.
   ```
4. **Onboard Existing Codebase (`/onboard`) & Sync Manual Git Commits (`/sync`):**
   ```text
   /onboard
   /sync
   ```

---

## 🧰 5. CLI Command Reference (`npx penta-agent-x ...`)

| Command | Alias (Global Install) | Description |
| :--- | :--- | :--- |
| `npx penta-agent-x init` | `penta init` | Launches the 3-step interactive wizard to initialize Agents, `workspace/`, and Tech Skills inside `.cursor/`, `.claude/`, or `.agents/`. |
| `npx penta-agent-x add-skill [skills...]` | `penta add-skill` | Interactively add or remove Tech Skills (`nextjs`, `react-native`, `flutter`, `elysiajs`, `nestjs`, `reactjs`). |
| `npx penta-agent-x sync` | `penta sync` | Checks uncommitted changes and rebase edge cases, then extracts `git diff` from `lastSyncedCommit..HEAD` into `workspace/sync-diff.md` for `@sync` / `/sync`. |
| `npx penta-agent-x sync --mark-done` | `penta sync -m` | Updates `lastSyncedCommit` in `workspace/sync-state.json` to the current `HEAD` commit. |
| `npx penta-agent-x scan` | `penta scan` | Scans the project directory tree and dependencies (0 tokens) into `workspace/scan-report.md`. |
| `npx penta-agent-x hotfix "description"` | `penta hotfix "..."` | Creates a fast-track hotfix ticket in `workspace/active/hotfix.md` and prints `@hotfix` / `/hotfix` usage. |
| `npx penta-agent-x update` | `penta update` | Refreshes all Agent prompts, platform adapters, and installed Tech Skills to the latest version. |

---

## 📄 License

MIT
