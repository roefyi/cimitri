import catalog from '../../job-types.json';
import {
  JOB_TYPES,
  type JobType,
  jobTypeNeedsComplianceForm,
} from '@/db/types';

type CatalogType = (typeof catalog.jobTypes)[number];

const byId = new Map<string, CatalogType>(
  catalog.jobTypes.map((item) => [item.id, item]),
);

export function jobTypeLabel(type: JobType): string {
  return byId.get(type)?.name ?? type;
}

export function jobTypeOptions(): { id: JobType; name: string; cep5: boolean }[] {
  return JOB_TYPES.map((id) => {
    const row = byId.get(id);
    return {
      id,
      name: row?.name ?? id,
      cep5: jobTypeNeedsComplianceForm(id),
    };
  });
}

export function isCep5Type(type: JobType): boolean {
  return jobTypeNeedsComplianceForm(type);
}
