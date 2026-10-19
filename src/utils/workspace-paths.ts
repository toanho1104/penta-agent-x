import fs from 'fs-extra';
import path from 'path';
import { AIPlatform } from '../types';

export function getPlatformRootDir(platform: AIPlatform): string {
  switch (platform) {
    case 'cursor':
      return '.cursor';
    case 'claude':
      return '.claude';
    case 'antigravity':
    case 'codex':
    default:
      return '.agents';
  }
}

export function getWorkspaceRelDir(platform: AIPlatform): string {
  return `${getPlatformRootDir(platform)}/workspace`;
}

export function getSkillsRelDir(platform: AIPlatform): string {
  if (platform === 'antigravity' || platform === 'codex') {
    return '.agents/skills';
  }
  return `${getWorkspaceRelDir(platform)}/skills`;
}

export function localizePromptPaths(
  content: string,
  platform: AIPlatform
): string {
  const wsRel = getWorkspaceRelDir(platform);
  const skillsRel = getSkillsRelDir(platform);
  return content
    .replace(/\.ai-workspace/g, wsRel)
    .replace(/\.agents\/tech-skills/g, skillsRel);
}

export interface ResolvedWorkspace {
  platform: AIPlatform;
  workspaceRelDir: string;
  workspaceAbsDir: string;
  configPath: string;
  exists: boolean;
}

const CANDIDATE_PLATFORMS: AIPlatform[] = ['cursor', 'claude', 'antigravity'];

export async function resolveExistingWorkspace(
  cwd: string = process.cwd()
): Promise<ResolvedWorkspace> {
  for (const platform of CANDIDATE_PLATFORMS) {
    const wsRel = getWorkspaceRelDir(platform);
    const wsAbs = path.join(cwd, wsRel);
    const configPath = path.join(wsAbs, 'config.json');
    if (await fs.pathExists(configPath)) {
      try {
        const cfg = await fs.readJson(configPath);
        const primaryPlatform: AIPlatform = cfg.platforms?.[0] || platform;
        return {
          platform: primaryPlatform,
          workspaceRelDir: wsRel,
          workspaceAbsDir: wsAbs,
          configPath,
          exists: true,
        };
      } catch {
        return {
          platform,
          workspaceRelDir: wsRel,
          workspaceAbsDir: wsAbs,
          configPath,
          exists: true,
        };
      }
    }
  }

  // Fallback if not initialized yet: check if .cursor, .claude, or .agents directory exists
  for (const platform of CANDIDATE_PLATFORMS) {
    const rootDir = path.join(cwd, getPlatformRootDir(platform));
    if (await fs.pathExists(rootDir)) {
      const wsRel = getWorkspaceRelDir(platform);
      const wsAbs = path.join(cwd, wsRel);
      return {
        platform,
        workspaceRelDir: wsRel,
        workspaceAbsDir: wsAbs,
        configPath: path.join(wsAbs, 'config.json'),
        exists: false,
      };
    }
  }

  const defaultWsRel = getWorkspaceRelDir('cursor');
  const defaultWsAbs = path.join(cwd, defaultWsRel);
  return {
    platform: 'cursor',
    workspaceRelDir: defaultWsRel,
    workspaceAbsDir: defaultWsAbs,
    configPath: path.join(defaultWsAbs, 'config.json'),
    exists: false,
  };
}
