import bcrypt from 'bcryptjs';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_SHOP_NAME } from '@/lib/demo';
import { todayIso } from '@/lib/dates';
import { addDays, format, parseISO } from 'date-fns';
import {
  addNote,
  createCustomer,
  createJob,
  createPerson,
  createShop,
  createSite,
  findShopByEmail,
  listPeople,
  setJobFlag,
  setJobStatus,
} from '@/lib/queries';
import { sql } from '@/lib/db';

export async function ensureDemoShop(): Promise<{
  id: string;
  name: string;
  email: string;
}> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const existing = await findShopByEmail(DEMO_EMAIL);
  const shop = existing
    ? existing
    : await createShop({
        name: DEMO_SHOP_NAME,
        email: DEMO_EMAIL,
        passwordHash,
      });

  if (existing) {
    await sql()`
      update shops
      set password_hash = ${passwordHash}, name = ${DEMO_SHOP_NAME}
      where id = ${shop.id}
    `;
  }

  const people = await listPeople(shop.id);
  if (people.length === 0) {
    await seedDemoRecords(shop.id);
  }

  return { id: shop.id, name: DEMO_SHOP_NAME, email: DEMO_EMAIL };
}

async function seedDemoRecords(shopId: string) {
  const maya = await createPerson(shopId, 'Maya Ortiz');
  const jordan = await createPerson(shopId, 'Jordan Hale');
  const sam = await createPerson(shopId, 'Sam Reeves');

  const rivers = await createCustomer(shopId, {
    name: 'Rivers family',
    phone: '334-555-0142',
    email: 'rivers@example.test',
  });
  const miller = await createCustomer(shopId, {
    name: 'Miller Funeral Home',
    phone: '334-555-0198',
    email: null,
  });

  const riversSite = await createSite(shopId, {
    customerId: rivers.id,
    address911: '412 Oak Ridge Rd',
    city: 'Wetumpka',
    state: 'AL',
    zip: '36092',
    subdivision: 'Oak Ridge',
    lot: '14',
    block: null,
    ownerApplicantName: 'Patricia Rivers',
    siteContactName: 'Patricia Rivers',
    siteContactPhone: '334-555-0142',
    isYardPickup: false,
  });
  const yard = await createSite(shopId, {
    customerId: rivers.id,
    address911: 'Yard / pickup',
    city: 'Wetumpka',
    state: 'AL',
    zip: '36092',
    subdivision: null,
    lot: null,
    block: null,
    ownerApplicantName: 'Clockwork Septic',
    siteContactName: 'Office',
    siteContactPhone: '334-555-0100',
    isYardPickup: true,
  });
  const cemetery = await createSite(shopId, {
    customerId: miller.id,
    address911: '88 Cemetery Ln',
    city: 'Prattville',
    state: 'AL',
    zip: '36067',
    subdivision: null,
    lot: null,
    block: null,
    ownerApplicantName: 'Miller Funeral Home',
    siteContactName: 'Dispatch',
    siteContactPhone: '334-555-0198',
    isYardPickup: false,
  });

  const today = todayIso();
  const tomorrow = format(addDays(parseISO(today), 1), 'yyyy-MM-dd');

  const ossId = await createJob(shopId, {
    customerId: rivers.id,
    siteId: riversSite.id,
    type: 'oss_install_new',
    scheduledDate: today,
    scheduledTime: '08:00',
    personIds: [maya.id, jordan.id],
    permitNumber: 'CEP2-2026-441',
    tank: '1000 gal concrete',
    systemType: 'Conventional / field lines',
  });
  await addNote(
    ossId,
    'Tank set. Photos of inlet and field lines still needed before print.',
  );

  const pumpId = await createJob(shopId, {
    customerId: rivers.id,
    siteId: riversSite.id,
    type: 'pumping',
    scheduledDate: today,
    scheduledTime: '13:30',
    personIds: [maya.id],
    permitNumber: null,
    tank: null,
    systemType: null,
  });
  await setJobStatus(shopId, pumpId, 'complete');

  const vaultId = await createJob(shopId, {
    customerId: miller.id,
    siteId: cemetery.id,
    type: 'vault_direct',
    scheduledDate: today,
    scheduledTime: '10:00',
    personIds: [sam.id],
    permitNumber: null,
    tank: null,
    systemType: null,
  });
  await setJobFlag(
    shopId,
    vaultId,
    true,
    'Family not on site. Need office to call funeral home.',
  );

  await createJob(shopId, {
    customerId: rivers.id,
    siteId: yard.id,
    type: 'tank_sale_no_install',
    scheduledDate: tomorrow,
    scheduledTime: '09:00',
    personIds: [jordan.id],
    permitNumber: null,
    tank: null,
    systemType: null,
  });
}
