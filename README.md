# 🚀 AI Agent Skill & Multi-Agent System CLI (`ai-agent-skill-cli`)

A production-grade **Multi-Agent Orchestration & Pluggable Tech Skill Framework** designed to eliminate **Context Rot** in growing codebases. Built for seamless cross-platform use across **Cursor IDE**, **Claude Code (CLI)**, **Google Antigravity**, and **OpenAI Codex**.

---

## 📌 1. Why This Framework?

When a codebase grows, relying on a single AI Agent in a long chat session inevitably leads to **Context Rot**: the AI forgets architectural boundaries, recreates existing shared components, and introduces regressions into legacy features.

This framework solves the problem through **three core engineering principles**:
1. **Role-Based Context Isolation (5 Agents + 1 Master Orchestrator):** Divides responsibilities across specialized agents (**BA**, **Architect**, **Dev**, **QA**, **Doc Keeper**) that communicate strictly via structured `.md` files.
2. **3-Tier Workspace Memory (`.ai-workspace/`):**
   - `PROJECT_MEMORY.md`: The concise (< 300 lines) global map of your tech stack, directory structure, reusable shared components/utils, and feature index.
   - `active/`: Temporary scratchpad (`spec.md`, `ui-spec.md`, `plan.md`, `review-report.md`) for **only the single feature currently in progress**. Automatically wiped clean upon feature completion so every new feature starts with a fresh, lightweight context.
   - `features/<feature-name>.md`: Long-term feature knowledge vault loaded on-demand only when modifying or fixing that specific feature.
   - `CHANGELOG_DOC.md`: Living specification and release log formatted for direct export to **Word / PDF / Notion / Wiki**.
3. **Git Commit Checkpoint Sync (`lastSyncedCommit`):** When you write code manually across multiple commits (or `git pull` teammates' commits) without AI, `npx ai-team sync` diffs `lastSyncedCommit..HEAD` so the **Doc Agent** brings your AI memory 100% back in sync.

---

## 🛠️ 2. Installation & Interactive Initialization (`init`)

### Run via `npx` (or local CLI):
```bash
npx ai-agent-skill-cli init
# Or using the short alias:
npx ai-team init
```

### The 3-Step Interactive `init` Wizard:
- **Step 1 — Select Target AI Platforms:**
  - Multi-select: `Cursor IDE` | `Claude Code (CLI)` | `Google Antigravity` | `OpenAI Codex`.
- **Step 2 — Select Project Mode:**
  - **2.1. Existing Project (Brownfield):** Runs a zero-token scanner on your directory tree, `package.json`/`pubspec.yaml`, and shared UI/utility folders to generate `.ai-workspace/scan-report.md`. Then simply run `@onboard` (or `/onboard`) in your IDE/CLI so the **Architect Agent** populates `PROJECT_MEMORY.md`.
  - **2.2. New Project (Greenfield):** Choose from 5 categories (`FE`, `BE`, `Mobile`, `Fullstack`, `None`) and stacks (`Next.js`, `React.js`, `ElysiaJS`, `NestJS`, `React Native`, `Flutter`) to scaffold a clean directory structure inside `PROJECT_MEMORY.md`.
- **Step 3 — Select Pluggable Tech Skills for the Dev Agent:**
  - Interactively toggle one or multiple Tech Skills (`nextjs`, `react-native`, `reactjs`, `elysiajs`, `nestjs`, `flutter`) until you select **`DONE`**.

---

## 💻 3. Daily Usage Guide (Cursor IDE & Claude Code CLI)

### A. In **Cursor IDE** (Chat Panel)

| Use Case | Prompt in Cursor Chat | What Happens |
| :--- | :--- | :--- |
| **1. Build a Feature Automatically (A -> Z)** | `@auto Build Login with Email & Google [attach UI image]` | Runs the full pipeline automatically: **BA** (`spec.md`) -> **Architect** (`plan.md`) -> **Dev** (Sequential tasks) -> **QA** (Audit & Tests) -> **Doc** (Archives to `features/`, updates `PROJECT_MEMORY.md`, records Git commit & cleans `active/`). |
| **2. Step-by-Step Manual Control** | • `@ba Build Login...`<br>• `@arch Create plan`<br>• `@dev Execute task 1`<br>• `@qa Audit & test`<br>• `@doc Finalize feature` | Press `Ctrl + N` (`Cmd + N`) between steps to start a fresh chat tab with 100% isolated context. |
| **3. Fast-Track Small Bugfix (`@hotfix`)** | Select code lines (`Ctrl + L`) -> Type:<br>`@hotfix Disable submit button while loading` | Bypasses the 5-step ceremony: fixes the selected code directly using your Tech Skill and performs a lightweight memory check. |
| **4. Onboard an Existing Project** | `@onboard` | Architect Agent reads `.ai-workspace/scan-report.md` and populates `PROJECT_MEMORY.md`. |
| **5. Sync Manual Code Commits** | `@sync` *(or run `npx ai-team sync` first)* | Doc Agent inspects Git history from `lastSyncedCommit..HEAD` and updates `PROJECT_MEMORY.md`, `features/*.md`, and `CHANGELOG_DOC.md`. |

---

### B. In **Claude Code (`claude` CLI in Terminal)**

When `Claude` is selected during `init`, the CLI generates **5 isolated Subagents** in `.claude/agents/` and **Slash Commands** in `.claude/commands/`. Launch `claude` in your terminal and type:

1. **Full Auto-Pilot Pipeline (A -> Z with isolated Subagent contexts):**
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
4. **Sync Manual Git Commits (`/sync`):**
   ```text
   /sync
   ```

---

## 🧰 4. CLI Command Reference (`npx ai-team ...`)

| Command | Description |
| :--- | :--- |
| `npx ai-team init` | Launches the 3-step interactive wizard to initialize Agents, `.ai-workspace/`, and Tech Skills. |
| `npx ai-team add-skill [skills...]` | Interactively add or remove Tech Skills (`nextjs`, `react-native`, `flutter`, `elysiajs`, `nestjs`, `reactjs`). Example: `npx ai-team add-skill nextjs react-native`. |
| `npx ai-team sync` | Checks uncommitted changes and rebase edge cases, then extracts `git diff` from `lastSyncedCommit..HEAD` into `.ai-workspace/sync-diff.md` for `@sync` / `/sync`. |
| `npx ai-team sync --mark-done` | Updates `lastSyncedCommit` in `.ai-workspace/sync-state.json` to the current `HEAD` commit. |
| `npx ai-team scan` | Scans the project directory tree and dependencies (0 tokens) into `.ai-workspace/scan-report.md`. |
| `npx ai-team hotfix "bug description"` | Creates a fast-track hotfix ticket in `.ai-workspace/active/hotfix.md` and prints `@hotfix` / `/hotfix` usage. |
| `npx ai-team update` | Refreshes all Agent prompts, platform adapters, and installed Tech Skills to the latest version. |

---

## 📦 5. Local Development, Extending Skills & Publishing to NPM

### Local Development & Testing:
```bash
# 1. Install dependencies
npm install

# 2. Compile TypeScript to dist/
npm run build

# 3. Link globally on your machine to test in any project directory
npm link
ai-team init
```

### Adding or Customizing Tech Skills:
1. Open [`src/templates/tech-skills.ts`](file:///c:/Users/toanha/Desktop/cty/aiAgentSkill/src/templates/tech-skills.ts).
2. Add or update skill definitions inside `TECH_SKILLS_REGISTRY`.
3. Run `npm run build` to compile.

### Publishing to NPM:
```bash
npm login
npm publish --access public
```
