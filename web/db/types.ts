/** Mirrors `job-types.json` and `web/db/schema.sql`. */

export const JOB_TYPES = [
  "vault_wholesale",
  "vault_direct",
  "tank_sale_no_install",
  "oss_install_new",
  "oss_repair",
  "oss_install_or_repair_fl_ga",
  "pumping",
  "grease_trap",
  "car_wash_pit",
  "maintenance_other",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export const OSS_JOB_TYPES = ["oss_install_new", "oss_repair"] as const;
export type OssJobType = (typeof OSS_JOB_TYPES)[number];

export function jobTypeNeedsOssFields(type: JobType): boolean {
  return (OSS_JOB_TYPES as readonly string[]).includes(type);
}

export function jobTypeNeedsComplianceForm(type: JobType): boolean {
  return jobTypeNeedsOssFields(type);
}

export const JOB_STATUSES = [
  "not_started",
  "complete",
  "canceled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

/** Crew may mark complete or return to not started. Cannot cancel. */
export function crewMaySetStatus(from: JobStatus, to: JobStatus): boolean {
  if (from === "canceled" || to === "canceled") return false;
  if (from === to) return true;
  return (
    (from === "not_started" && to === "complete") ||
    (from === "complete" && to === "not_started")
  );
}

export type Shop = {
  id: string;
  name: string;
  email: string;
};

export type Person = {
  id: string;
  shopId: string;
  name: string;
};

export type Customer = {
  id: string;
  shopId: string;
  name: string;
  phone: string | null;
  email: string | null;
};

export type Site = {
  id: string;
  shopId: string;
  customerId: string;
  address911: string;
  city: string;
  state: string;
  zip: string;
  subdivision: string | null;
  lot: string | null;
  block: string | null;
  ownerApplicantName: string;
  siteContactName: string | null;
  siteContactPhone: string | null;
  isYardPickup: boolean;
};

export type Job = {
  id: string;
  shopId: string;
  customerId: string;
  siteId: string;
  type: JobType;
  scheduledDate: string;
  scheduledTime: string | null;
  status: JobStatus;
  flagged: boolean;
  flagNote: string | null;
  permitNumber: string | null;
  tank: string | null;
  systemType: string | null;
};

export type JobNote = {
  id: string;
  jobId: string;
  body: string;
  createdAt: string;
};

export type JobPhoto = {
  id: string;
  jobId: string;
  storageUrl: string;
  createdAt: string;
};

export type ComplianceFormDraft = {
  id: string;
  jobId: string;
  formId: string;
  payerName: string | null;
  payerPhone: string | null;
  payerEmail: string | null;
  ownerApplicantName: string | null;
  address911: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  permitNumber: string | null;
  tank: string | null;
  systemType: string | null;
};
