export type AIPlatform = 'cursor' | 'claude' | 'codex' | 'antigravity';

export type ProjectCategory = 'fe' | 'be' | 'mobile' | 'fullstack' | 'none';

export type TechSkillId =
  | 'nextjs'
  | 'react-native'
  | 'reactjs'
  | 'elysiajs'
  | 'flutter'
  | 'nestjs'
  | 'bootstrap'
  | 'angularjs';

export interface WorkspaceConfig {
  version: string;
  platforms: AIPlatform[];
  projectMode: 'new' | 'existing';
  projectCategory?: ProjectCategory;
  selectedStack?: {
    fe?: string;
    be?: string;
    mobile?: string;
  };
  installedTechSkills: TechSkillId[];
  workflowMode: 'full-auto' | 'semi-auto';
  createdAt: string;
  updatedAt: string;
}

export interface SyncState {
  lastSyncedCommit: string | null;
  lastSyncedAt: string | null;
  note?: string;
}

export interface TechSkillDefinition {
  id: TechSkillId;
  name: string;
  category: 'FE' | 'BE' | 'Mobile' | 'Fullstack';
  description: string;
  globs: string[];
  content: string;
}
