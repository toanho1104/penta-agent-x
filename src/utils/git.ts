import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { SyncState } from '../types';

const SYNC_STATE_PATH = '.ai-workspace/sync-state.json';

function runGit(cmd: string, cwd: string): string {
  return execSync(cmd, {
    cwd,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'ignore'],
  }).trim();
}

export function isGitRepo(cwd: string = process.cwd()): boolean {
  try {
    const out = runGit('git rev-parse --is-inside-work-tree', cwd);
    return out === 'true';
  } catch {
    return false;
  }
}

export function getCurrentCommit(cwd: string = process.cwd()): string | null {
  if (!isGitRepo(cwd)) return null;
  try {
    return runGit('git rev-parse HEAD', cwd);
  } catch {
    return null;
  }
}

export function hasUncommittedChanges(cwd: string = process.cwd()): boolean {
  if (!isGitRepo(cwd)) return false;
  try {
    const status = runGit('git status --porcelain', cwd);
    return status.length > 0;
  } catch {
    return false;
  }
}

export function getUncommittedStatus(cwd: string = process.cwd()): string {
  if (!isGitRepo(cwd)) return '';
  try {
    return runGit('git status --short', cwd);
  } catch {
    return '';
  }
}

export function commitExists(
  commitHash: string,
  cwd: string = process.cwd()
): boolean {
  if (!isGitRepo(cwd) || !commitHash) return false;
  try {
    const type = runGit(`git cat-file -t ${commitHash}`, cwd);
    return type === 'commit';
  } catch {
    return false;
  }
}

export function getCommitLogBetween(
  fromRef: string,
  toRef: string = 'HEAD',
  cwd: string = process.cwd()
): string {
  try {
    return runGit(`git log ${fromRef}..${toRef} --oneline --no-decorate`, cwd);
  } catch {
    return '';
  }
}

export function getDiffStatBetween(
  fromRef: string,
  toRef: string = 'HEAD',
  cwd: string = process.cwd()
): string {
  try {
    return runGit(`git diff --stat ${fromRef}..${toRef}`, cwd);
  } catch {
    return '';
  }
}

export function getDetailedDiff(
  fromRef: string,
  includeWorkingTree: boolean = false,
  cwd: string = process.cwd()
): string {
  try {
    const target = includeWorkingTree ? fromRef : `${fromRef}..HEAD`;
    const rawDiff = runGit(
      `git diff ${target} -- . ":(exclude)package-lock.json" ":(exclude)pnpm-lock.yaml" ":(exclude)yarn.lock" ":(exclude).ai-workspace/scan-report.md" ":(exclude).ai-workspace/sync-diff.md"`,
      cwd
    );
    const maxChars = 35000;
    if (rawDiff.length > maxChars) {
      return (
        rawDiff.slice(0, maxChars) +
        `\n\n... [Diff truncated at ${maxChars} characters to protect Context. Run git diff ${target} for full output]`
      );
    }
    return rawDiff;
  } catch {
    return '';
  }
}

export async function readSyncState(
  cwd: string = process.cwd()
): Promise<SyncState> {
  const filePath = path.join(cwd, SYNC_STATE_PATH);
  if (await fs.pathExists(filePath)) {
    try {
      return await fs.readJson(filePath);
    } catch {
      // ignore parse error
    }
  }
  return {
    lastSyncedCommit: null,
    lastSyncedAt: null,
  };
}

export async function writeSyncState(
  state: SyncState,
  cwd: string = process.cwd()
): Promise<void> {
  const filePath = path.join(cwd, SYNC_STATE_PATH);
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, state, { spaces: 2 });
}
