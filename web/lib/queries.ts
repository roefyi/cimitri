import {
  jobTypeNeedsOssFields,
  type JobStatus,
  type JobType,
} from '@/db/types';
import { asDate, asIso, asTime, sql } from '@/lib/db';
import type {
  ComplianceFormDraft,
  Customer,
  JobNote,
  JobPhoto,
  Person,
  Site,
} from '@/db/types';
import type { Assignee, CustomerRow, JobDetail, JobRow, SiteRow } from '@/lib/types';

function asText(value: unknown): string {
  return String(value);
}

function asTextOrNull(value: unknown): string | null {
  if (value == null) return null;
  return String(value);
}

function asBool(value: unknown): boolean {
  return value === true || value === 't' || value === 'true';
}

export async function shopCount(): Promise<number> {
  const rows = await sql()`select count(*)::int as n from shops`;
  return Number(rows[0]?.n ?? 0);
}

export async function findShopByEmail(email: string) {
  const rows = await sql()`
    select id, name, email, password_hash
    from shops
    where lower(email) = lower(${email})
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: asText(row.id),
    name: asText(row.name),
    email: asText(row.email),
    passwordHash: asText(row.password_hash),
  };
}

export async function createShop(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<{ id: string; name: string; email: string }> {
  const rows = await sql()`
    insert into shops (name, email, password_hash)
    values (${input.name}, ${input.email}, ${input.passwordHash})
    returning id, name, email
  `;
  const row = rows[0];
  return {
    id: asText(row.id),
    name: asText(row.name),
    email: asText(row.email),
  };
}

export async function listPeople(shopId: string): Promise<Person[]> {
  const rows = await sql()`
    select id, shop_id, name
    from people
    where shop_id = ${shopId}
    order by name
  `;
  return rows.map((row) => ({
    id: asText(row.id),
    shopId: asText(row.shop_id),
    name: asText(row.name),
  }));
}

export async function getPerson(
  shopId: string,
  personId: string,
): Promise<Person | null> {
  const rows = await sql()`
    select id, shop_id, name
    from people
    where shop_id = ${shopId} and id = ${personId}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: asText(row.id),
    shopId: asText(row.shop_id),
    name: asText(row.name),
  };
}

export async function createPerson(shopId: string, name: string): Promise<Person> {
  const rows = await sql()`
    insert into people (shop_id, name)
    values (${shopId}, ${name})
    returning id, shop_id, name
  `;
  const row = rows[0];
  return {
    id: asText(row.id),
    shopId: asText(row.shop_id),
    name: asText(row.name),
  };
}

export async function deletePerson(shopId: string, personId: string): Promise<void> {
  await sql()`
    delete from people
    where shop_id = ${shopId} and id = ${personId}
  `;
}

export async function listCustomers(shopId: string): Promise<CustomerRow[]> {
  const rows = await sql()`
    select id, shop_id, name, phone, email
    from customers
    where shop_id = ${shopId}
    order by name
  `;
  return rows.map(mapCustomer);
}

export async function getCustomer(
  shopId: string,
  customerId: string,
): Promise<Customer | null> {
  const rows = await sql()`
    select id, shop_id, name, phone, email
    from customers
    where shop_id = ${shopId} and id = ${customerId}
    limit 1
  `;
  const row = rows[0];
  return row ? mapCustomer(row) : null;
}

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: asText(row.id),
    shopId: asText(row.shop_id),
    name: asText(row.name),
    phone: asTextOrNull(row.phone),
    email: asTextOrNull(row.email),
  };
}

export async function createCustomer(
  shopId: string,
  input: { name: string; phone: string | null; email: string | null },
): Promise<Customer> {
  const rows = await sql()`
    insert into customers (shop_id, name, phone, email)
    values (${shopId}, ${input.name}, ${input.phone}, ${input.email})
    returning id, shop_id, name, phone, email
  `;
  return mapCustomer(rows[0] as Record<string, unknown>);
}

export async function updateCustomer(
  shopId: string,
  customerId: string,
  input: { name: string; phone: string | null; email: string | null },
): Promise<void> {
  await sql()`
    update customers
    set name = ${input.name}, phone = ${input.phone}, email = ${input.email}
    where shop_id = ${shopId} and id = ${customerId}
  `;
}

function mapSite(row: Record<string, unknown>): SiteRow {
  return {
    id: asText(row.id),
    shopId: asText(row.shop_id),
    customerId: asText(row.customer_id),
    address911: asText(row.address_911),
    city: asText(row.city),
    state: asText(row.state),
    zip: asText(row.zip),
    subdivision: asTextOrNull(row.subdivision),
    lot: asTextOrNull(row.lot),
    block: asTextOrNull(row.block),
    ownerApplicantName: asText(row.owner_applicant_name),
    siteContactName: asTextOrNull(row.site_contact_name),
    siteContactPhone: asTextOrNull(row.site_contact_phone),
    isYardPickup: asBool(row.is_yard_pickup),
    customerName: row.customer_name ? asText(row.customer_name) : undefined,
  };
}

export async function listSitesForCustomer(
  shopId: string,
  customerId: string,
): Promise<SiteRow[]> {
  const rows = await sql()`
    select s.*, c.name as customer_name
    from sites s
    join customers c on c.id = s.customer_id
    where s.shop_id = ${shopId} and s.customer_id = ${customerId}
    order by s.is_yard_pickup desc, s.address_911
  `;
  return rows.map((row) => mapSite(row as Record<string, unknown>));
}

export async function listSites(shopId: string): Promise<SiteRow[]> {
  const rows = await sql()`
    select s.*, c.name as customer_name
    from sites s
    join customers c on c.id = s.customer_id
    where s.shop_id = ${shopId}
    order by c.name, s.is_yard_pickup desc, s.address_911
  `;
  return rows.map((row) => mapSite(row as Record<string, unknown>));
}

export async function getSite(
  shopId: string,
  siteId: string,
): Promise<SiteRow | null> {
  const rows = await sql()`
    select s.*, c.name as customer_name
    from sites s
    join customers c on c.id = s.customer_id
    where s.shop_id = ${shopId} and s.id = ${siteId}
    limit 1
  `;
  const row = rows[0];
  return row ? mapSite(row as Record<string, unknown>) : null;
}

export type SiteInput = {
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

export async function createSite(
  shopId: string,
  input: SiteInput,
): Promise<Site> {
  const rows = await sql()`
    insert into sites (
      shop_id, customer_id, address_911, city, state, zip,
      subdivision, lot, block, owner_applicant_name,
      site_contact_name, site_contact_phone, is_yard_pickup
    )
    values (
      ${shopId}, ${input.customerId}, ${input.address911}, ${input.city},
      ${input.state}, ${input.zip}, ${input.subdivision}, ${input.lot},
      ${input.block}, ${input.ownerApplicantName}, ${input.siteContactName},
      ${input.siteContactPhone}, ${input.isYardPickup}
    )
    returning *
  `;
  return mapSite(rows[0] as Record<string, unknown>);
}

export async function updateSite(
  shopId: string,
  siteId: string,
  input: SiteInput,
): Promise<void> {
  await sql()`
    update sites
    set
      customer_id = ${input.customerId},
      address_911 = ${input.address911},
      city = ${input.city},
      state = ${input.state},
      zip = ${input.zip},
      subdivision = ${input.subdivision},
      lot = ${input.lot},
      block = ${input.block},
      owner_applicant_name = ${input.ownerApplicantName},
      site_contact_name = ${input.siteContactName},
      site_contact_phone = ${input.siteContactPhone},
      is_yard_pickup = ${input.isYardPickup}
    where shop_id = ${shopId} and id = ${siteId}
  `;
}

async function assigneesForJobs(
  shopId: string,
  jobIds: string[],
): Promise<Map<string, Assignee[]>> {
  const map = new Map<string, Assignee[]>();
  if (jobIds.length === 0) return map;
  const wanted = new Set(jobIds);
  const rows = await sql()`
    select ja.job_id, p.id, p.name
    from job_assignees ja
    join people p on p.id = ja.person_id
    join jobs j on j.id = ja.job_id
    where j.shop_id = ${shopId}
    order by p.name
  `;
  for (const row of rows) {
    const jobId = asText(row.job_id);
    if (!wanted.has(jobId)) continue;
    const list = map.get(jobId) ?? [];
    list.push({ id: asText(row.id), name: asText(row.name) });
    map.set(jobId, list);
  }
  return map;
}

function mapJob(row: Record<string, unknown>, assignees: Assignee[]): JobRow {
  return {
    id: asText(row.id),
    shopId: asText(row.shop_id),
    customerId: asText(row.customer_id),
    siteId: asText(row.site_id),
    type: asText(row.type) as JobType,
    scheduledDate: asDate(row.scheduled_date),
    scheduledTime: asTime(row.scheduled_time),
    status: asText(row.status) as JobStatus,
    flagged: asBool(row.flagged),
    flagNote: asTextOrNull(row.flag_note),
    permitNumber: asTextOrNull(row.permit_number),
    tank: asTextOrNull(row.tank),
    systemType: asTextOrNull(row.system_type),
    customerName: asText(row.customer_name),
    siteAddress: asText(row.address_911),
    siteCity: asText(row.city),
    siteState: asText(row.state),
    siteZip: asText(row.zip),
    siteIsYard: asBool(row.is_yard_pickup),
    ownerApplicantName: asText(row.owner_applicant_name),
    assignees,
  };
}

export async function listJobsInRange(
  shopId: string,
  fromDate: string,
  toDate: string,
  personId?: string,
): Promise<JobRow[]> {
  const list = personId
    ? await sql()`
        select j.*, c.name as customer_name,
          s.address_911, s.city, s.state, s.zip, s.is_yard_pickup,
          s.owner_applicant_name
        from jobs j
        join customers c on c.id = j.customer_id
        join sites s on s.id = j.site_id
        join job_assignees ja on ja.job_id = j.id
        where j.shop_id = ${shopId}
          and ja.person_id = ${personId}
          and j.scheduled_date >= ${fromDate}::date
          and j.scheduled_date <= ${toDate}::date
        order by j.scheduled_date, j.scheduled_time nulls last, c.name
      `
    : await sql()`
        select j.*, c.name as customer_name,
          s.address_911, s.city, s.state, s.zip, s.is_yard_pickup,
          s.owner_applicant_name
        from jobs j
        join customers c on c.id = j.customer_id
        join sites s on s.id = j.site_id
        where j.shop_id = ${shopId}
          and j.scheduled_date >= ${fromDate}::date
          and j.scheduled_date <= ${toDate}::date
        order by j.scheduled_date, j.scheduled_time nulls last, c.name
      `;

  const ids = list.map((row) => asText(row.id));
  const assigneeMap = await assigneesForJobs(shopId, ids);
  return list.map((row) =>
    mapJob(row, assigneeMap.get(asText(row.id)) ?? []),
  );
}

export async function listJobsForSite(
  shopId: string,
  siteId: string,
): Promise<JobRow[]> {
  const rows = await sql()`
    select j.*, c.name as customer_name,
      s.address_911, s.city, s.state, s.zip, s.is_yard_pickup,
      s.owner_applicant_name
    from jobs j
    join customers c on c.id = j.customer_id
    join sites s on s.id = j.site_id
    where j.shop_id = ${shopId} and j.site_id = ${siteId}
    order by j.scheduled_date desc, j.scheduled_time nulls last
  `;
  const ids = rows.map((row) => asText(row.id));
  const assigneeMap = await assigneesForJobs(shopId, ids);
  return rows.map((row) =>
    mapJob(row, assigneeMap.get(asText(row.id)) ?? []),
  );
}

export async function getJob(
  shopId: string,
  jobId: string,
): Promise<JobDetail | null> {
  const rows = await sql()`
    select j.*, c.name as customer_name,
      s.address_911, s.city, s.state, s.zip, s.is_yard_pickup,
      s.owner_applicant_name
    from jobs j
    join customers c on c.id = j.customer_id
    join sites s on s.id = j.site_id
    where j.shop_id = ${shopId} and j.id = ${jobId}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  const assigneeMap = await assigneesForJobs(shopId, [asText(row.id)]);
  const job = mapJob(
    row as Record<string, unknown>,
    assigneeMap.get(asText(row.id)) ?? [],
  );
  const [notes, photos, draft] = await Promise.all([
    listNotes(job.id),
    listPhotos(job.id),
    getDraft(job.id),
  ]);
  return { ...job, notes, photos, draft };
}

export async function personIsAssigned(
  jobId: string,
  personId: string,
): Promise<boolean> {
  const rows = await sql()`
    select 1 from job_assignees
    where job_id = ${jobId} and person_id = ${personId}
    limit 1
  `;
  return rows.length > 0;
}

export type JobInput = {
  customerId: string;
  siteId: string;
  type: JobType;
  scheduledDate: string;
  scheduledTime: string | null;
  personIds: string[];
  permitNumber: string | null;
  tank: string | null;
  systemType: string | null;
};

export async function createJob(
  shopId: string,
  input: JobInput,
): Promise<string> {
  const oss = jobTypeNeedsOssFields(input.type);
  const rows = await sql()`
    insert into jobs (
      shop_id, customer_id, site_id, type, scheduled_date, scheduled_time,
      permit_number, tank, system_type
    )
    values (
      ${shopId}, ${input.customerId}, ${input.siteId}, ${input.type}::job_type,
      ${input.scheduledDate}::date, ${input.scheduledTime}::time,
      ${oss ? input.permitNumber : null},
      ${oss ? input.tank : null},
      ${oss ? input.systemType : null}
    )
    returning id
  `;
  const jobId = asText(rows[0].id);
  await replaceAssignees(jobId, input.personIds);
  if (oss) {
    await upsertDraftFromJob(shopId, jobId);
  }
  return jobId;
}

export async function updateJob(
  shopId: string,
  jobId: string,
  input: JobInput,
): Promise<void> {
  const oss = jobTypeNeedsOssFields(input.type);
  await sql()`
    update jobs
    set
      customer_id = ${input.customerId},
      site_id = ${input.siteId},
      type = ${input.type}::job_type,
      scheduled_date = ${input.scheduledDate}::date,
      scheduled_time = ${input.scheduledTime}::time,
      permit_number = ${oss ? input.permitNumber : null},
      tank = ${oss ? input.tank : null},
      system_type = ${oss ? input.systemType : null}
    where shop_id = ${shopId} and id = ${jobId}
  `;
  await replaceAssignees(jobId, input.personIds);
  if (oss) {
    await upsertDraftFromJob(shopId, jobId);
  } else {
    await sql()`delete from compliance_form_drafts where job_id = ${jobId}`;
  }
}

async function replaceAssignees(jobId: string, personIds: string[]) {
  await sql()`delete from job_assignees where job_id = ${jobId}`;
  for (const personId of personIds) {
    await sql()`
      insert into job_assignees (job_id, person_id)
      values (${jobId}, ${personId})
    `;
  }
}

export async function setJobStatus(
  shopId: string,
  jobId: string,
  status: JobStatus,
): Promise<void> {
  await sql()`
    update jobs
    set status = ${status}::job_status
    where shop_id = ${shopId} and id = ${jobId}
  `;
}

export async function setJobFlag(
  shopId: string,
  jobId: string,
  flagged: boolean,
  flagNote: string | null,
): Promise<void> {
  await sql()`
    update jobs
    set flagged = ${flagged}, flag_note = ${flagged ? flagNote : null}
    where shop_id = ${shopId} and id = ${jobId}
  `;
}

export async function duplicateJobToNextDay(
  shopId: string,
  jobId: string,
): Promise<string> {
  const job = await getJob(shopId, jobId);
  if (!job) throw new Error('Job not found');
  const next = addDays(job.scheduledDate, 1);
  return createJob(shopId, {
    customerId: job.customerId,
    siteId: job.siteId,
    type: job.type,
    scheduledDate: next,
    scheduledTime: job.scheduledTime,
    personIds: job.assignees.map((a) => a.id),
    permitNumber: job.permitNumber,
    tank: job.tank,
    systemType: job.systemType,
  });
}

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return asDate(date);
}

export async function listNotes(jobId: string): Promise<JobNote[]> {
  const rows = await sql()`
    select id, job_id, body, created_at
    from job_notes
    where job_id = ${jobId}
    order by created_at
  `;
  return rows.map((row) => ({
    id: asText(row.id),
    jobId: asText(row.job_id),
    body: asText(row.body),
    createdAt: asIso(row.created_at),
  }));
}

export async function addNote(jobId: string, body: string): Promise<void> {
  await sql()`
    insert into job_notes (job_id, body)
    values (${jobId}, ${body})
  `;
}

export async function listPhotos(jobId: string): Promise<JobPhoto[]> {
  const rows = await sql()`
    select id, job_id, storage_url, created_at
    from job_photos
    where job_id = ${jobId}
    order by created_at
  `;
  return rows.map((row) => ({
    id: asText(row.id),
    jobId: asText(row.job_id),
    storageUrl: asText(row.storage_url),
    createdAt: asIso(row.created_at),
  }));
}

export async function addPhoto(jobId: string, storageUrl: string): Promise<void> {
  await sql()`
    insert into job_photos (job_id, storage_url)
    values (${jobId}, ${storageUrl})
  `;
}

export async function getDraft(jobId: string): Promise<ComplianceFormDraft | null> {
  const rows = await sql()`
    select *
    from compliance_form_drafts
    where job_id = ${jobId}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: asText(row.id),
    jobId: asText(row.job_id),
    formId: asText(row.form_id),
    payerName: asTextOrNull(row.payer_name),
    payerPhone: asTextOrNull(row.payer_phone),
    payerEmail: asTextOrNull(row.payer_email),
    ownerApplicantName: asTextOrNull(row.owner_applicant_name),
    address911: asTextOrNull(row.address_911),
    city: asTextOrNull(row.city),
    state: asTextOrNull(row.state),
    zip: asTextOrNull(row.zip),
    permitNumber: asTextOrNull(row.permit_number),
    tank: asTextOrNull(row.tank),
    systemType: asTextOrNull(row.system_type),
  };
}

export async function upsertDraftFromJob(
  shopId: string,
  jobId: string,
): Promise<void> {
  await sql()`
    insert into compliance_form_drafts (
      job_id, form_id, payer_name, payer_phone, payer_email,
      owner_applicant_name, address_911, city, state, zip,
      permit_number, tank, system_type
    )
    select
      j.id, 'cep5', c.name, c.phone, c.email,
      s.owner_applicant_name, s.address_911, s.city, s.state, s.zip,
      j.permit_number, j.tank, j.system_type
    from jobs j
    join customers c on c.id = j.customer_id
    join sites s on s.id = j.site_id
    where j.shop_id = ${shopId} and j.id = ${jobId}
    on conflict (job_id) do update set
      payer_name = excluded.payer_name,
      payer_phone = excluded.payer_phone,
      payer_email = excluded.payer_email,
      owner_applicant_name = excluded.owner_applicant_name,
      address_911 = excluded.address_911,
      city = excluded.city,
      state = excluded.state,
      zip = excluded.zip,
      permit_number = excluded.permit_number,
      tank = excluded.tank,
      system_type = excluded.system_type
  `;
}
