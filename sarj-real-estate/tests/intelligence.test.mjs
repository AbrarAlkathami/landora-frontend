import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze, matchInquiry, isPriority, insights } from '../features/intelligence/lib/analytics.ts';
const parcels = JSON.parse(readFileSync(new URL('../../../landora-backend/data/sarj-lands-riyadh.json', import.meta.url), 'utf8'));
const inquiries = JSON.parse(readFileSync(new URL('../../../landora-backend/data/investor-inquiries.json', import.meta.url), 'utf8'));
const inquiry = { ...inquiries[0], status: 'new', area_of_city_wanted: 'East', land_type_wanted: 'commercial', prefers: 'sale', budget_sar: 1000000, budget_basis: 'total purchase' };
const parcel = { ...parcels[0], status: 'available', area_of_city: 'East', land_type: 'commercial', listing_type: 'sale', total_price_sar: 900000 };

test('segments reconcile with available inventory and assigned open demand', () => {
  const business = analyze(parcels, inquiries);
  assert.equal(business.available.length, 62);
  assert.equal(business.segments.length, 20);
  assert.equal(business.segments.reduce((sum,s) => sum+s.demand,0)+business.unassigned,business.open.length);
  assert.equal(business.segments.reduce((sum,s) => sum+s.supply,0),business.available.length);
  assert.ok(business.oldest.every(p=>p.status==='available'));
  assert.ok(business.oldest.every((p,index)=>!index||p.days_on_market<=business.oldest[index-1].days_on_market));
});

test('missing prices and incompatible annual budgets cannot be purchase fits', () => {
  assert.equal(matchInquiry(inquiry,[parcel])[0].score,100);
  assert.equal(matchInquiry(inquiry,[{...parcel,total_price_sar:null}])[0].good,false);
  assert.equal(matchInquiry({...inquiry,budget_basis:'annual rent'},[parcel])[0].good,false);
  assert.equal(matchInquiry(inquiry,[{...parcel,status:'sold'}]).length,0);
});

test('purchase and annual lease averages stay separate', () => {
  const business=analyze([], [{...inquiry,budget_sar:2000000},{...inquiry,inquiry_id:'second',budget_sar:4000000},{...inquiry,inquiry_id:'lease',prefers:'lease',budget_sar:200000,budget_basis:'annual rent'}]);
  assert.equal(business.purchaseBudget.average,3000000);
  assert.equal(business.leaseBudget.average,200000);
});

test('budget-driven gaps reveal unserved investors even when stock exists', () => {
  const business=analyze([parcel],[{...inquiry,budget_sar:100}]);
  const segment=business.segments.find(s=>s.area==='East'&&s.type==='commercial'&&s.listing==='sale');
  assert.equal(segment.supply,1);
  assert.equal(segment.unmatched,1);
  assert.equal(segment.gap,'High');
});

test('closing an inquiry updates demand and removes it from priority follow-up', () => {
  const closed={...inquiry,status:'closed',intent:'ready to move'};
  assert.equal(analyze([parcel],[inquiry]).open.length,1);
  assert.equal(analyze([parcel],[closed]).open.length,0);
  assert.equal(isPriority(closed),false);
});

test('zero-data insights offer an action without inventing business trends', () => {
  const rows=insights([],[]);
  assert.equal(rows.length,1);
  assert.equal(rows[0].href,'/admin/inquiries');
});

test('insights reorder by affected records as demand and inventory change', () => {
  const fresh = {...parcel, days_on_market: 12};
  const demand = [1,2,3].map(i => ({...inquiry,inquiry_id:`dynamic-${i}`,budget_sar:100}));
  const first=insights([fresh],demand);
  assert.ok(first.every((row,index)=>!index || row.affected<=first[index-1].affected));
  assert.ok(first.every(row=>row.basis && row.unit));
  assert.equal(first.find(row=>row.label==='FOLLOW-UP OPPORTUNITY').affected,3);
  assert.ok(!first.some(row=>row.label==='INVENTORY TO REVISIT'));
  const closed=demand.map(row=>({...row,status:'closed'}));
  const changed=insights([{...fresh,days_on_market:120}],closed);
  assert.equal(changed[0].label,'INVENTORY TO REVISIT');
  assert.equal(changed[0].affected,1);
  assert.ok(!changed.some(row=>row.label==='FOLLOW-UP OPPORTUNITY'||row.label==='DEMAND SIGNAL'));
});
