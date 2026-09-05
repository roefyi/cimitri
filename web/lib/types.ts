import type {
  ComplianceFormDraft,
  Customer,
  Job,
  JobNote,
  JobPhoto,
  JobStatus,
  Person,
  Site,
} from '@/db/types';

export type Mode = 'office' | 'crew';

export type PersonRow = Person;

export type CustomerRow = Customer;

export type SiteRow = Site & {
  customerName?: string;
};

export type Assignee = {
  id: string;
  name: string;
};

export type JobRow = Job & {
  customerName: string;
  siteAddress: string;
  siteCity: string;
  siteState: string;
  siteZip: string;
  siteIsYard: boolean;
  ownerApplicantName: string;
  assignees: Assignee[];
};

export type JobDetail = JobRow & {
  notes: JobNote[];
  photos: JobPhoto[];
  draft: ComplianceFormDraft | null;
};

export { type JobStatus };
