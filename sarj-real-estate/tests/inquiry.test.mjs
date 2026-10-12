import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInquiry, normalizePhone } from '../lib/investor/inquiry.ts';

const form = (overrides = {}) => {
  const data = new FormData();
  Object.entries({name: '  Sara  ', phone: '055 123 4567', purpose: 'open a showroom', readiness: 'ready to move', landType: 'commercial', area: 'East', transaction: 'sale', budget: '10000000', parcel: 'SRE-001', ...overrides}).forEach(([k,v]) => data.set(k,v));
  return data;
};
test('purpose, readiness, parcel, and preferences remain separate canonical values', () => {
  const result = buildInquiry(form(), 'INQ-test');
  assert.equal(result.investor_name, 'Sara');
  assert.equal(result.phone, '+966551234567');
  assert.equal(result.wants_to, 'open a showroom');
  assert.equal(result.intent, 'ready to move');
  assert.equal(result.selected_parcel_id, 'SRE-001');
  assert.equal(result.budget_sar, 10000000);
  assert.equal(result.budget_basis, 'total purchase');
});
test('lease budget is annual and undecided budget stays null', () => {
  assert.equal(buildInquiry(form({transaction:'lease'}),'x').budget_basis, 'annual rent');
  const result = buildInquiry(form({transaction:'any',budget:'',parcel:''}), 'x');
  assert.equal(result.budget_sar, null);
  assert.equal(result.budget_basis, null);
  assert.equal(result.selected_parcel_id, null);
});
test('reject invalid, fractional, and ambiguous budgets', () => {
  for (const budget of ['-1','0','10.5','NaN','2147483648']) assert.throws(() => buildInquiry(form({budget}), 'x'));
  assert.throws(() => buildInquiry(form({transaction:'any'}),'x'));
});
test('normalize Saudi, Arabic-digit, and international phone numbers', () => {
  assert.equal(normalizePhone('٠٥٥١٢٣٤٥٦٧'), '+966551234567');
  assert.equal(normalizePhone('00966 55 123 4567'), '+966551234567');
  assert.equal(normalizePhone('+44 7700 900123'), '+447700900123');
  assert.throws(() => normalizePhone('1234'));
});
