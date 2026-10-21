# MASTER BLUEPRINT: AI Agent Skill & Multi-Agent NPM Framework

> This document serves as the architectural blueprint and live progress tracker for the **Multi-Agent & Pluggable Tech Skill CLI Framework**, detailing the core philosophy, 5-Agent + Orchestrator workflow, 3-Tier Markdown Context Lifecycle, interactive CLI wizard, Git Commit Checkpoint Sync, and implementation status.

---

## I. CORE PHILOSOPHY & OBJECTIVES

1. **Eliminating "Context Rot" in Large Projects:**
   - **Context Isolation:** Divide software engineering responsibilities across **5 specialized Agents** (plus **1 Master Orchestrator** and **Interactive Consultation/Planning Workflows**), ensuring each Agent only loads the context strictly required for its role.
   - **Markdown-Driven Handoffs:** Agents communicate through structured `.md` artifacts stored in `workspace/`.
   - **Single Dev Agent + Pluggable Tech Skills:** A single Dev Agent executes atomic tasks sequentially (e.g., Backend -> State/Logic -> Frontend/Mobile) while dynamically loading project-specific **Tech Skills** (`nextjs`, `react-native`, `flutter`, etc.) to prevent race conditions, merge conflicts, and token bloat.
2. **Flexible Execution Modes:**
   - **Full Auto-Pilot Mode (`@auto` / `/auto`):** Type a single command with your feature requirement (and optional UI screenshot). The **Master Orchestrator** automatically drives the entire pipeline from A to Z (BA -> Architect -> Dev Task Loop -> QA -> Doc Keeper).
   - **Interactive Consultation & Co-Planning Mode (`@ask`, `@plan` -> `@actionPlan`):**
     - **`@ask` (`/ask`):** 100% Read-Only Q&A to query project architecture, current feature flows, and business logic directly without modifying any files.
     - **`@plan` (`/plan`):** Interactive brainstorming with **BA + Architect** together, protected by a **Topic Coherence Guard**, caching the evolving specification, technical design, and atomic tasks into `workspace/active/action-plan.md` (`STATUS: DRAFT | READY`).
     - **`@actionPlan` (`/actionPlan`):** Validates `active/action-plan.md` across 3 readiness cases (Missing, Ambiguous/Draft, Ready) and executes `READY` plans directly through **Dev -> QA -> Doc** (bypassing BA & Architect).
   - **Granular Step-by-Step Mode (`@ba`, `@arch`, `@dev`, `@qa`, `@doc`):** Invoke individual agents manually whenever fine-grained control is desired.
   - **Fast-Track Bugfix Mode (`@hotfix` / `/hotfix`):** Bypass multi-agent ceremony for targeted bugfixes and minor tweaks.
3. **Cross-Platform Compatibility:**
   - Single canonical source with automatic adapters generated for **Cursor IDE** (`.cursor/agents/*.md`, `.cursor/rules/*.mdc`, `.cursor/commands/*.md`, `.cursor/skills/<tech-skill>/SKILL.md`), **Claude Code CLI** (`.claude/agents/*.md`, `.claude/commands/*.md`, `.claude/skills/*/SKILL.md`, `CLAUDE.md`), **Google Antigravity** (`.agents/rules/`, `.agents/workflows/`, `.agents/skills/`), and **OpenAI Codex** (`AGENTS.md`, `.agents/skills/`).
4. **NPM CLI Distribution:**
   - Initialize the full multi-agent system in any project (`init`), install modular tech skills (`add-skill`), run fast-track bugfixes (`hotfix`), and synchronize manual Git commits (`sync`).

---

## II. THE 5 CORE AGENTS, MASTER ORCHESTRATOR & INTERACTIVE WORKFLOWS

| # | Agent / Trigger | Primary Responsibility | Fixed Core Skills | Input -> Output Artifacts |
| :--- | :--- | :--- | :--- | :--- |
| **0** | **Master Orchestrator (`@auto` / `/auto`)** | **End-to-End Conductor:** Checks for any active plan, then receives user requirements and automatically orchestrates Phase 1 (BA) -> Phase 2 (Architect) -> Phase 3 (Dev task loop) -> Phase 4 (QA review & auto-fix) -> Phase 5 (Doc & workspace cleanup). | • `workflow-orchestrator`<br>• `subagent-dispatcher`<br>• `stage-gate-validator`<br>• `active-workspace-guard` | Coordinates the entire pipeline from requirement intake to `PROJECT_MEMORY.md` update. |
| **1** | **BA / Product Agent (`@ba` / `/ba`)** | Analyzes business requirements & UI images, models state transitions & NFRs, asks clarifying questions if ambiguous, identifies edge cases, and writes functional & UI specifications. | • `requirement-clarifier`<br>• `prd-spec-writer`<br>• `ui-vision-to-md`<br>• `state-matrix-and-nfr-analyst`<br>• `bug-triage-spec` | **In:** User Prompt + UI Image + `PROJECT_MEMORY.md`<br>**Out:** `active/spec.md`, `active/ui-spec.md` |
| **2** | **Architect / Tech Lead Agent (`@arch` / `/arch`)** | Initializes project architecture; reads BA specs to design technical solutions, guards blast radius & backward compatibility, identifies reusable components, and breaks work into sequential atomic tasks. | • `project-onboarding`<br>• `codebase-impact-analyzer`<br>• `blast-radius-and-compat-guard`<br>• `system-api-designer`<br>• `atomic-task-planner` | **In:** `active/spec.md`, `ui-spec.md` + `PROJECT_MEMORY.md` + `features/*.md`<br>**Out:** `active/plan.md` |
| **3** | **Dev Agent (`@dev` / `/dev`)** | Executes **one atomic task at a time** from `plan.md` (or `action-plan.md`), combining Core Dev Skills with installed **Pluggable Tech Skills** and self-verifying types/imports. | **Core:**<br>• `strict-plan-executor` (*Stop & Escalate*)<br>• `clean-code-and-solid`<br>• `safe-refactoring`<br>• `self-verification-and-typecheck`<br>**Tech Skills (via NPM):**<br>• `nextjs`, `react-native`, `reactjs`, `angularjs`, `bootstrap`, `elysiajs`, `nestjs`, `flutter` | **In:** Single Task in `active/plan.md` (or `action-plan.md`) + `ui-spec.md` + Tech Skill<br>**Out:** Production-ready Source Code |
| **4** | **QA / Reviewer Agent (`@qa` / `/qa`)** | Independently audits code changes against `spec.md` & `plan.md` (or `action-plan.md`), checks external call-sites for regressions/anti-patterns, and writes Unit/Integration Tests. | • `spec-compliance-checker`<br>• `deep-code-reviewer`<br>• `callsite-and-regression-auditor`<br>• `automated-test-writer` | **In:** `spec.md` + `plan.md` (or `action-plan.md`) + `git diff` + Tech Skill<br>**Out:** Test Files + `active/review-report.md` |
| **5** | **Doc / Memory Keeper Agent (`@doc` / `/doc`)** | Compacts completed feature context into `features/`, deduplicates & updates `PROJECT_MEMORY.md` (< 300 lines), logs changes to `CHANGELOG_DOC.md`, updates `lastSyncedCommit`, and cleans `active/`. | • `context-compactor`<br>• `architecture-sync`<br>• `memory-dedup-and-pruner`<br>• `changelog-doc-exporter`<br>• `git-commit-sync` | **In:** `active/*` or `sync-diff.md`<br>**Out:** Updates `features/*.md`, `PROJECT_MEMORY.md`, `CHANGELOG_DOC.md`, `sync-state.json` & clears `active/` |
| **6** | **Project Advisor (`@ask` / `/ask`)** | **100% Read-Only Q&A:** Answers questions about project architecture, existing feature flows, and business logic directly using 2-step memory lookup without modifying any files. | • `two-step-memory-lookup`<br>• `code-flow-explainer`<br>• `strict-read-only-guard` | **In:** User Question + `PROJECT_MEMORY.md` + `features/*.md`<br>**Out:** Direct in-chat explanation (Zero file changes) |
| **7** | **Co-Planning Mode (`@plan` / `/plan`)** | **BA + Architect Co-Consultation:** Discusses requirements and technical options/trade-offs with the user, filters out off-topic/scattered input, and caches the evolving plan into `active/action-plan.md`. | • `ba-arch-co-consultant`<br>• `tradeoff-option-analyzer`<br>• `action-plan-cacher`<br>• `topic-coherence-guard` | **In:** User Discussion + `PROJECT_MEMORY.md` + `features/*.md`<br>**Out:** `active/action-plan.md` (`STATUS: DRAFT \| READY`) |
| **8** | **Action Plan Executor (`@actionPlan` / `/actionPlan`)** | Validates `active/action-plan.md` across 3 readiness cases (Missing, Ambiguous/Draft, Ready) and runs `READY` plans directly through **Dev -> QA -> Doc** (bypassing BA & Architect). | • `plan-readiness-validator`<br>• `direct-dev-qa-doc-runner`<br>• `workspace-cleanup-manager` | **In:** `active/action-plan.md`<br>**Out:** Source Code + Tests + `features/*.md` + Cleans `active/` |
| **9** | **Fast-Track Hotfix (`@hotfix` / `/hotfix`)** | Bypasses the full 5-agent ceremony to fix a targeted bug or selected code snippet directly while verifying call-site safety and performing lightweight memory sync. | • `fast-bug-fixer`<br>• `callsite-safety-check`<br>• `lightweight-memory-sync` | **In:** Bug description / Selected lines<br>**Out:** Direct code fix + optional lightweight doc update |

---

## III. EXECUTION FLOWS (`@auto` vs. `@ask` / `@plan` / `@actionPlan`)

### A. End-to-End Auto-Orchestration Flow (`@auto` / `/auto`)

```mermaid
flowchart TD
    User["👤 User Single Command:\n@auto (or /auto) + Feature Description + UI Image"] --> Gate0{"Requirements Clear?"}
    Gate0 -- "Ambiguous" --> Ask["Ask User concise clarifying questions once"] --> Step1
    Gate0 -- "Clear" --> Step1

    Step1["1️⃣ Phase 1 - BA Agent:\nGenerate active/spec.md & active/ui-spec.md"] --> Step2
    Step2["2️⃣ Phase 2 - Architect Agent:\nRead spec.md + PROJECT_MEMORY.md -> Generate active/plan.md"] --> Step3
    
    Step3["3️⃣ Phase 3 - Dev Agent Loop:\nLoad Tech Skills -> Execute Task 1, Task 2... sequentially"] --> Step4
    
    Step4["4️⃣ Phase 4 - QA / Reviewer Agent:\nAudit code against spec.md & write Unit/Integration Tests"] --> CheckQA{"QA Passed?"}
    
    CheckQA -- "Needs Fix" --> AutoFix["Dispatch Dev Agent to fix reported issues"] --> Step4
    CheckQA -- "Passed 100%" --> Step5
    
    Step5["5️⃣ Phase 5 - Doc / Memory Keeper Agent:\n- Archive to features/<feature>.md\n- Update PROJECT_MEMORY.md & CHANGELOG_DOC.md\n- Record lastSyncedCommit & Clean active/"] --> Done["🎉 Report Completion to User!"]
```

### B. Interactive Co-Planning & Direct Execution Flow (`@plan` -> `@actionPlan`)

```mermaid
flowchart TD
    PlanCmd["👤 User: @plan <idea / discussion>"] --> Guard{"Topic Coherence Guard:\nIs input coherent & on-topic?"}
    Guard -- "Off-topic / Nonsense" --> Remind["Do NOT touch action-plan.md\nPolitely ask User for valid project topic"]
    Guard -- "Switches to unrelated Feature B\nwhile Feature A is in action-plan.md" --> ConfirmSwitch["Ask User: Keep A, Overwrite A with B,\nor Add B as Phase 2 of A?"]
    Guard -- "Valid & Coherent" --> CoConsult["🤝 BA + Architect Co-Consultation:\nDiscuss options/trade-offs & cache to\nworkspace/active/action-plan.md (DRAFT | READY)"]

    CoConsult --> ExecCmd["👤 User: @actionPlan"]
    ExecCmd --> CheckPlan{"Validate active/action-plan.md"}

    CheckPlan -- "Case 1: File Missing / Empty" --> Missing["⚠️ Inform User directly:\nNo action-plan.md found!\nGuide to run @plan or @auto"]
    CheckPlan -- "Case 2: STATUS = DRAFT\nor Open Questions remain" --> Draft["⏸️ Pause before coding!\nList unresolved items & ask User to decide"]
    Draft -- "User confirms decisions" --> LockReady["Update action-plan.md -> STATUS: READY"] --> DevStage

    CheckPlan -- "Case 3: STATUS = READY\n(Bypass @ba & @arch!)" --> DevStage["1️⃣ Stage 1 - Dev Agent (@dev):\nExecute Atomic Tasks from action-plan.md"]
    DevStage --> QAStage["2️⃣ Stage 2 - QA Agent (@qa):\nAudit code & call-sites against action-plan.md"]
    QAStage --> QAPass{"QA Passed?"}
    QAPass -- "NEEDS_FIX" --> DevStage
    QAPass -- "PASS" --> DocStage["3️⃣ Stage 3 - Doc Agent (@doc):\nArchive to features/*.md, update PROJECT_MEMORY.md,\nCHANGELOG_DOC.md, sync-state.json & wipe active/"]
```

---

## IV. UNIFIED SINGLE-FOLDER 3-TIER CONTEXT LIFECYCLE

All generated rules, commands, skills, and 3-tier memory live inside **a single root folder** matching the chosen AI platform (`.cursor/`, `.claude/`, or `.agents/`) so the project root stays 100% clean:

```text
.cursor/ (or .claude/ or .agents/)
├── agents/                            # Native Custom Agents / Subagents (auto.md, ask.md, plan.md, actionPlan.md, ba.md, arch.md, dev.md, qa.md, doc.md...)
├── rules/ (or workflows/)             # Native platform Rules & file-glob Tech Skill rules
├── commands/                          # Native Slash Commands (/auto, /ask, /plan, /actionPlan, /ba, /arch, /dev, /qa, /doc...)
├── skills/                            # Installed Pluggable Tech Skills (<tech-skill>/SKILL.md)
└── workspace/                         # 3-Tier Context Memory & Pluggable Tech Skills
    ├── config.json                    # Workspace settings: active platform, installed tech skills.
    ├── PROJECT_MEMORY.md              # [Tier 1 - Global Map] Always kept concise (< 300 lines).
    │                                  # Contains: Tech Stack, Directory Tree, Shared Registry, Feature Index.
    ├── CHANGELOG_DOC.md               # [Documentation Export Layer] Structured release & feature log.
    ├── sync-state.json                # [Git Sync Checkpoint] Stores { "lastSyncedCommit": "<hash>" }.
    ├── skills/                        # Installed Tech Skills (<skill>/SKILL.md)
    ├── active/                        # [Tier 2 - Active Scratchpad] Holds context for ONLY the active feature.
    │   ├── spec.md                    # Upon completion (Phase 5 / Stage 3), compacted into features/<feature-name>.md
    │   ├── ui-spec.md                 # and cleared so the next feature starts with a 100% clean slate.
    │   ├── plan.md
    │   ├── action-plan.md             # Cached BA + Architect plan created during @plan and executed by @actionPlan.
    │   └── review-report.md
    └── features/                      # [Tier 3 - Feature Knowledge Vault] Read on-demand per feature.
        ├── auth-login.md              # Top: Current Business Rules & Files. Bottom: Feature Change History.
        └── ...
```

---

## V. INTERACTIVE INITIALIZATION WIZARD (`npx penta-agent-x init`)

1. **Step 1 — Select AI Platform (Single-select):**
   - Options: `Cursor` | `Claude Code` | `Google Antigravity` | `OpenAI Codex`
   - Generates all core rules, slash commands, skills, and `workspace/` inside the selected platform folder (`.cursor/`, `.claude/` + `CLAUDE.md`, or `.agents/` + `AGENTS.md`).
2. **Step 2 — Select Project Status:**
   - **Branch 2.1 — Existing Project (Brownfield):** Automatically runs the zero-token project scanner to produce `workspace/scan-report.md`, then instructs the user to run `@onboard` (or `/onboard`) so the **Architect Agent** populates `PROJECT_MEMORY.md` and `features/*.md`.
   - **Branch 2.2 — New Project (Greenfield):** Presents 5 project categories to pre-populate baseline directory structures in `PROJECT_MEMORY.md`:
     - `FE`: `Next.js` | `React.js` | `Angular / AngularJS` | `None`
     - `BE`: `Next.js` / `NestJS` | `ElysiaJS` | `None`
     - `Mobile`: `React Native` | `Flutter` | `None`
     - `Fullstack`: Select `FE` + Select `BE`
     - `None`: Leave directory structure blank for custom definition.
3. **Step 3 — Select Tech Skills for Dev Agent (Multi-select: `Space` to toggle, `Enter` to finish):**
   - Pre-selects skills matching Step 2 choices and allows toggling additional skills (`nextjs`, `react-native`, `reactjs`, `angularjs`, `bootstrap`, `elysiajs`, `nestjs`, `flutter`).
   - Records initial Git `HEAD` commit hash into `workspace/sync-state.json`.
4. **Step 4 — Push to Git or Add to `.gitignore` (`Yes` / `No`):**
   - **`Yes`:** Keeps the generated platform folder tracked normally in Git for team collaboration.
   - **`No`:** Automatically appends the generated platform folder (`.cursor/`, `.claude/` + `CLAUDE.md`, or `.agents/` + `AGENTS.md`) to `.gitignore` so the developer can use the AI system locally without polluting a shared repository.

---

## VI. DAILY INTERACTION & CLI COMMANDS

| Scenario | Cursor IDE Chat | Claude Code / Antigravity / Codex Chat | Terminal CLI Command |
| :--- | :--- | :--- | :--- |
| **1. Build Feature (Full Auto A -> Z)** | `@auto Build feature X... [attach UI]` | `/auto Build feature X...` | — |
| **2. Ask About Project (100% Read-Only)** | `@ask How does feature X work?` | `/ask How does feature X work?` | — |
| **3. Co-Plan with BA + Architect** | `@plan Let's design feature X...` | `/plan Let's design feature X...` | — |
| **4. Execute Agreed Action Plan (`Dev -> QA -> Doc`)** | `@actionPlan` | `/actionPlan` (or `/action-plan`) | — |
| **5. Step-by-Step Agent Control** | `@ba` -> `@arch` -> `@dev` -> `@qa` -> `@doc` | `/ba` -> `/arch` -> `/dev` -> `/qa` -> `/doc` | — |
| **6. Fast-Track Small Bugfix** | Select lines (`Ctrl+L`) + `@hotfix Fix...` | `/hotfix @file line X: Fix...` | `npx penta-agent-x hotfix "Fix..."` |
| **7. Sync Manual Code Commits** | `@sync` | `/sync` | `npx penta-agent-x sync` |
| **8. Onboard Existing Codebase** | `@onboard` | `/onboard` | `npx penta-agent-x scan` |
| **9. Add / Manage Tech Skills** | — | — | `npx penta-agent-x add-skill` |
| **10. Update Agents & Skills** | — | — | `npx penta-agent-x update` |

---

## VII. EDGE CASES HANDLED BY THE SYNC & SCAN SCRIPTS

1. **Uncommitted Working Tree Changes during `sync`:**
   - Checks `git status --porcelain`. Prompts the user whether to *(1) Include uncommitted working tree changes in the sync report*, *(2) Sync committed changes only*, or *(3) Abort and `git commit` first*.
2. **Missing `lastSyncedCommit` due to `git rebase` / `reset` / `amend`:**
   - Verifies commit existence via `git cat-file -t`. If missing, prompts the user to fallback to the last `1`, `3`, `5`, or `10` commits (`HEAD~N..HEAD`).
3. **Team Collaboration (`git pull`):**
   - Because `sync-state.json` tracks `lastSyncedCommit`, pulling teammates' commits and running `npx penta-agent-x sync` automatically updates the local AI memory with teammates' architectural changes.

---

## VIII. CLI SOURCE CODE ARCHITECTURE & MODULARITY RULES (`src/`)

> **Architectural Rule for AI Assistants & Contributors:**
> Never bundle multiple Tech Skills or Project Structure templates into a single monolithic file. Each skill and each project structure must live in its own dedicated file inside `src/templates/skills/` and `src/templates/project-structures/` respectively, and be re-exported via `index.ts`.

```text
src/
├── index.ts                          # CLI Entrypoint (Commander.js definitions)
├── types.ts                          # Shared TypeScript interfaces & union types
├── commands/                         # CLI command handlers
│   ├── init.ts                       # 4-Step interactive initialization wizard
│   ├── add-skill.ts                  # Add/remove Pluggable Tech Skills
│   ├── sync.ts                       # Git Commit Checkpoint Sync (lastSyncedCommit..HEAD)
│   ├── scan.ts                       # Zero-token codebase tree & dependency scanner
│   ├── hotfix.ts                     # Fast-Track bugfix workflow generator
│   └── update.ts                     # Refreshes agents, workflows, and installed skills
├── templates/                        # Modular Markdown & Prompt templates
│   ├── agents.ts                     # 5 Core Agents + Master Orchestrator (@auto) + 6 Interactive/Utility Workflows (@ask, @plan, @actionPlan, @hotfix, @sync, @onboard)
│   ├── skills/                       # Individual Pluggable Tech Skill definitions (1 file per skill)
│   │   ├── index.ts                  # Barrel registry: TECH_SKILLS_REGISTRY & AVAILABLE_TECH_SKILLS
│   │   ├── nextjs.ts                 # Next.js (App Router) skill
│   │   ├── react-native.ts           # React Native & Expo skill
│   │   ├── reactjs.ts                # React.js SPA skill
│   │   ├── angularjs.ts              # Angular (Standalone/Signals) & AngularJS 1.x skill
│   │   ├── bootstrap.ts              # Bootstrap 5 & Responsive UI skill
│   │   ├── elysiajs.ts               # ElysiaJS & Bun skill
│   │   ├── nestjs.ts                 # NestJS skill
│   │   └── flutter.ts                # Flutter & Dart skill
│   └── project-structures/           # Individual project folder tree templates (1 file per stack)
│       ├── index.ts                  # Barrel registry: STRUCTURE_TEMPLATES & memory/changelog generators
│       ├── nextjs.ts                 # Next.js directory tree
│       ├── reactjs.ts                # React.js directory tree
│       ├── angularjs.ts              # Angular / AngularJS directory tree
│       ├── nestjs.ts                 # NestJS directory tree
│       ├── elysiajs.ts               # ElysiaJS directory tree
│       ├── react-native.ts           # React Native directory tree
│       ├── flutter.ts                # Flutter directory tree
│       └── none.ts                   # Blank/custom fallback directory tree
└── utils/                            # Core utilities
    ├── workspace-paths.ts            # Unified single-folder path resolver (.cursor/workspace, .claude/workspace, .agents/workspace)
    ├── platform-adapter.ts           # Generates rules, commands, agents, and skills inside the selected platform folder
    ├── tree-scanner.ts               # Directory & package.json/pubspec.yaml scanner
    └── git.ts                        # Git commit inspection, diff generation, and sync-state helpers
```

### How to Add a New Tech Skill or Stack in the Future:
1. **Register the ID:** Add the new skill key to `TechSkillId` in `src/types.ts`.
2. **Create Skill File:** Create `src/templates/skills/<new-skill>.ts` exporting `<newSkill>Skill: TechSkillDefinition`, then register it in `src/templates/skills/index.ts`.
3. **Create Project Structure File (Optional):** Create `src/templates/project-structures/<new-stack>.ts` and register it in `src/templates/project-structures/index.ts`.

---

## IX. IMPLEMENTATION PROGRESS & HANDOFF LOG (FOR CONTINUATION)

> **Instructions for AI Assistant on Another Device:**
> When the developer pulls this repo on another machine and asks to continue, read this section first to understand what is already built and what can be expanded next.

### ✅ Completed Milestones (v1.0.x - 2026-10-21)
- [x] **System Architecture & Blueprint:** Finalized 5 Core Agents (`BA`, `Architect`, `Dev`, `QA`, `Doc Keeper`) + `Master Orchestrator` (`@auto` / `/auto`) + 6 Interactive & Utility Workflows (`@ask`, `@plan`, `@actionPlan`, `@hotfix`, `@sync`, `@onboard`).
- [x] **TypeScript CLI Package Scaffolding (`package.json`, `tsconfig.json`, `src/index.ts`):** Built with `commander`, `@clack/prompts`, `fs-extra`, and `picocolors`.
- [x] **Interactive 4-Step `init` Wizard (`src/commands/init.ts`):**
  - Step 1: Single-select AI platform (`cursor`, `claude`, `antigravity`, `codex`) with concise hints that prevent terminal line-wrapping.
  - Step 2: Existing project (auto-scan) vs. New project (`FE`, `BE`, `Mobile`, `Fullstack`, `None` with sub-options).
  - Step 3: Multi-select (`Space` to toggle, `Enter` to confirm) for Tech Skills.
  - Step 4: Platform-agnostic Git tracking choice (`Yes — Track in Git` vs. `No — Add to .gitignore`).
- [x] **Unified Single-Folder Output Architecture (`src/utils/workspace-paths.ts` & `src/utils/platform-adapter.ts`):**
  - Consolidated all generated files into **1 single root directory** per chosen platform (`.cursor/`, `.claude/`, or `.agents/`), placing the 3-tier memory (`PROJECT_MEMORY.md`, `active/`, `features/`, `skills/`) inside `<platform-dir>/workspace/`.
  - Added both `.cursor/rules/*.mdc` (`@auto`, `@ba`...) and `.cursor/commands/*.md` (`/auto`, `/ba`...) for Cursor IDE.
  - Updated Google Antigravity & OpenAI Codex adapter to generate modern `.agents/skills/<slug>/SKILL.md` (providing native `/auto`, `/ba`, `/onboard` slash commands and semantic discovery in Antigravity 2.0).
- [x] **Deep Sub-App & Existing Feature Onboarding (`src/utils/tree-scanner.ts` & `@onboard`):**
  - `scanProjectStructure` automatically detects whether a project is a Single-App or Multi-App/Monorepo (`apps/*`, `packages/*`, `frontend/`, `backend/`, `mobile/`, etc.) and discovers existing features/modules/routes per sub-app.
  - `@onboard` populates `PROJECT_MEMORY.md` (grouping Section 4 Feature Index by Sub-App if multi-app) AND generates individual feature vault files in `workspace/features/<feature-slug>.md` (or `workspace/features/<app-name>/<feature-slug>.md` for multi-app projects) documenting each existing feature's **Current End-to-End Flow**.
  - All downstream agents (`@auto`, `@ask`, `@plan`, `@actionPlan`, `@ba`, `@arch`, `@dev`, `@hotfix`) follow a **2-Step Feature Lookup Protocol**: scan `PROJECT_MEMORY.md` first -> if a requirement matches an existing feature, immediately read its `workspace/features/.../*.md` file and trace its current code flow before planning or modifying code.
- [x] **CLI Operational Commands:**
  - `src/commands/add-skill.ts`: Add/remove Pluggable Tech Skills at any time.
  - `src/commands/sync.ts`: Git Commit Checkpoint Sync (`lastSyncedCommit..HEAD`) with edge-case handling for uncommitted working tree changes and rewritten Git history (`rebase`/`amend`).
  - `src/commands/scan.ts` & `src/utils/tree-scanner.ts`: Zero-token project, sub-app & feature scanner generating `<platform-dir>/workspace/scan-report.md`.
  - `src/commands/hotfix.ts`: Fast-Track bugfix workflow generator.
  - `src/commands/update.ts`: Refreshes agent templates and adapters.
- [x] **English Standardization:** All documentation (`README.md`, `PROJECT_VISION.md`) and all generated Markdown templates (`src/templates/*`) have been converted to professional English.
- [x] **Modular Template Refactoring (`src/templates/skills/` & `src/templates/project-structures/`):** Split monolithic `tech-skills.ts` and `project-structures.ts` into dedicated per-technology files with barrel `index.ts` exports to prevent bloated files and simplify future maintenance.
- [x] **NPM Package Naming (`penta-agent-x`) & GitHub Actions Auto-Publish CI/CD (`.github/workflows/publish-npm.yml`):** Finalized package name as `penta-agent-x` (with CLI binaries `penta-agent-x`, `penta-agent`, `penta`, `ai-team`) and configured automated build, auto-patch version bump, and NPM publish on push/merge to `main` / `master`.
- [x] **Senior Engineering Upgrade & New Tech Skills (`bootstrap`, `angularjs` - 2026-10-20):**
  - Upgraded all 8 Tech Skills (`nextjs`, `react-native`, `reactjs`, `angularjs`, `bootstrap`, `elysiajs`, `nestjs`, `flutter`) to Senior Engineering standards (concurrency & race-condition safety, N+1/memory leak prevention, A11y, security & validation, and build/typecheck verification).
  - Upgraded Core Agent prompts (`@ba`, `@arch`, `@dev`, `@qa`) with Non-Functional Requirements (NFRs), Backward-Compatible DB & API Contracts, Zero-Any & Self-Verification gates, and OWASP/Performance audit criteria.
  - Added full cross-platform discovery compatibility across Cursor, Claude Code, Google Antigravity, and OpenAI Codex (`.cursor/skills/*/SKILL.md`, `.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`, and `Command & Trigger Router Table`).
- [x] **Interactive Q&A, Co-Planning & Direct Action Plan Execution (`@ask`, `@plan`, `@actionPlan` - 2026-10-21):**
  - Added **`@ask` (`/ask`)**: 100% Read-Only Project Advisor using 2-step memory lookup (`PROJECT_MEMORY.md` -> `features/*.md` -> source files) to answer questions directly without modifying code or creating scratchpad files.
  - Added **`@plan` (`/plan`)**: Interactive **BA + Architect Co-Consultation Mode** with a **Topic Coherence Guard** (prevents off-topic pollution, prompts for confirmation before switching/overwriting an existing feature plan, and resolves contradictory requirements) while caching the agreed BA spec, Architect design, and Atomic Tasks into `workspace/active/action-plan.md` (`STATUS: DRAFT | READY`).
  - Added **`@actionPlan` (`/actionPlan` / `@action-plan`)**: Validates `active/action-plan.md` across 3 cases (1. Missing file -> notifies user directly; 2. `STATUS: DRAFT` / unresolved open questions -> pauses and asks user to resolve before coding; 3. `STATUS: READY` -> bypasses `@ba` and `@arch` and executes **`Dev -> QA -> Doc`** directly, wiping `action-plan.md` upon completion).
  - Upgraded existing agents with new Senior Core Skills: `active-workspace-guard` (`@auto`), `state-matrix-and-nfr-analyst` (`@ba`), `blast-radius-and-compat-guard` (`@arch`), `self-verification-and-typecheck` (`@dev`), `callsite-and-regression-auditor` (`@qa`), `memory-dedup-and-pruner` (`@doc` & `@sync`), and `callsite-safety-check` (`@hotfix`).

### 🔜 Upcoming Roadmap / Next Steps (To Continue at Home)
1. **Deepen Tech Skill Templates (`src/templates/skills/*.ts`):**
   - Expand each individual file (`nextjs.ts`, `react-native.ts`, `flutter.ts`, `elysiajs.ts`, `nestjs.ts`, `reactjs.ts`) with even deeper project-specific conventions, code snippets, and library-specific rules (e.g., TanStack Query, Zustand, Prisma, Drizzle, Tailwind/NativeWind).
   - Add more modular skills as needed (e.g., `golang.ts`, `python-fastapi.ts`, `graphql.ts`, `supabase.ts`, `turborepo.ts`).
2. **End-to-End Dogfooding Test:**
   - Run `npx penta-agent-x@latest init`, `penta sync`, `@ask`, `@plan`, `@actionPlan`, and `@auto` on a real sample Next.js or React Native project.
3. **Optional Doc Export Command (`npx penta-agent-x export-doc`):**
   - Add a CLI command that combines `workspace/CHANGELOG_DOC.md` and `workspace/features/*.md` into a single formatted `SYSTEM_DOCUMENTATION.md` (or HTML/PDF) for instant client/manager handover.
