#!/usr/bin/env node
import { Command } from 'commander';
import { runInitCommand } from './commands/init';
import { runAddSkillCommand } from './commands/add-skill';
import { runSyncCommand } from './commands/sync';
import { runScanCommand } from './commands/scan';
import { runHotfixCommand } from './commands/hotfix';
import { runUpdateCommand } from './commands/update';

const program = new Command();

program
  .name('penta-agent-x')
  .description(
    'Penta-Agent-X (5 Core AI Agents + Master Orchestrator) & Pluggable Tech Skill Framework for Cursor, Claude Code, Antigravity, and Codex'
  )
  .version('1.0.0');

program
  .command('init')
  .description(
    'Initialize the 5 AI Agents, Master Orchestrator (@auto), 3-tier memory (.ai-workspace), and Tech Skills'
  )
  .action(async () => {
    await runInitCommand();
  });

program
  .command('add-skill [skills...]')
  .alias('add')
  .description(
    'Add or manage Pluggable Tech Skills (nextjs, react-native, reactjs, elysiajs, nestjs, flutter) for the Dev Agent'
  )
  .action(async (skills: string[]) => {
    await runAddSkillCommand(skills);
  });

program
  .command('sync')
  .description(
    'Synchronize manual code commits from lastSyncedCommit..HEAD into AI workspace memory'
  )
  .option(
    '-m, --mark-done',
    'Mark current HEAD commit as synced in .ai-workspace/sync-state.json'
  )
  .action(async (options: { markDone?: boolean }) => {
    await runSyncCommand(options);
  });

program
  .command('scan')
  .description(
    'Scan project directory tree, dependencies, and shared folders into .ai-workspace/scan-report.md'
  )
  .action(async () => {
    await runScanCommand();
  });

program
  .command('hotfix [description...]')
  .description(
    'Trigger Fast-Track / Hotfix Mode to rapidly fix a small bug without the 5-step ceremony'
  )
  .action(async (description: string[]) => {
    await runHotfixCommand(description);
  });

program
  .command('update')
  .description(
    'Refresh all 5 Agents, Master Orchestrator, and installed Tech Skills to the latest version'
  )
  .action(async () => {
    await runUpdateCommand();
  });

program.parse(process.argv);
