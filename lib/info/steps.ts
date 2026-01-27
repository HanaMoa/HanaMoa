import { infoConfig } from './infoConfig';

export type EventType = 'funeral' | 'wedding';

export type StepCfg = {
  indicator: string;
  title: string;
  subtitle: string;
  role?: string;
  addLabel?: string;
};

export function parseEvent(eventParam: string | undefined): EventType | null {
  if (eventParam === 'funeral') return 'funeral';
  if (eventParam === 'wedding') return 'wedding';
  return null;
}

export function getTotalSteps(event: EventType) {
  return event === 'wedding' ? 5 : 4;
}

export function getValidSteps(totalSteps: number) {
  if (totalSteps <= 1) return [];
  return Array.from({ length: totalSteps - 1 }, (_, i) => i + 2);
}

export function getStepCfg(event: EventType, step: number): StepCfg | null {
  const config = infoConfig[event];
  switch (step) {
    case 2:
      return config.step2 as StepCfg;
    case 3:
      return config.step3 as StepCfg;
    case 4:
      return config.step4 as StepCfg;
    case 5:
      return 'step5' in config ? (config.step5 as StepCfg) : null;
    default:
      return null;
  }
}

export function getRepRole(event: EventType, step: number) {
  if (event === 'funeral') return 'CHIEF_MOURNER';
  // wedding
  return step === 2 ? 'GROOM' : 'BRIDE';
}
