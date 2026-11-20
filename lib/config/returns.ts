// Returns policy facts (2026-11-20). Single source for the Product JSON-LD
// (hasMerchantReturnPolicy); the /retur page (components/legal/returns/content.ts)
// states the same rules in prose and tests/e2e/product-jsonld.spec.ts fails if
// the window drifts apart.
//   - consumers in Romania may withdraw within 14 days of receipt, no reason
//   - the product goes back by a courier the customer chooses
//   - the return shipping is paid by the customer
// Engraved pieces and custom work (La comandă) have no right of withdrawal
// (OUG 34/2014 art. 16 lit. c). Engraving is an option chosen at checkout, so
// the catalog Offer (the standard, un-engraved product) keeps the 14-day policy.
export const RETURN_COUNTRY = 'RO';
export const RETURN_WINDOW_DAYS = 14;
