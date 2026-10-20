import { TechSkillDefinition, TechSkillId } from '../../types';
import { nextjsSkill } from './nextjs';
import { reactNativeSkill } from './react-native';
import { reactjsSkill } from './reactjs';
import { elysiajsSkill } from './elysiajs';
import { nestjsSkill } from './nestjs';
import { flutterSkill } from './flutter';
import { bootstrapSkill } from './bootstrap';
import { angularjsSkill } from './angularjs';

export const TECH_SKILLS_REGISTRY: Record<TechSkillId, TechSkillDefinition> = {
  nextjs: nextjsSkill,
  'react-native': reactNativeSkill,
  reactjs: reactjsSkill,
  elysiajs: elysiajsSkill,
  nestjs: nestjsSkill,
  flutter: flutterSkill,
  bootstrap: bootstrapSkill,
  angularjs: angularjsSkill,
};

export const AVAILABLE_TECH_SKILLS = Object.values(TECH_SKILLS_REGISTRY);

export {
  nextjsSkill,
  reactNativeSkill,
  reactjsSkill,
  elysiajsSkill,
  nestjsSkill,
  flutterSkill,
  bootstrapSkill,
  angularjsSkill,
};
