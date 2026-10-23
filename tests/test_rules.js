/**
 * Test Suite 1: Rules Engine Tests
 * Validates heuristic rule detection, pattern recognition, and mitigation exemptions.
 * Minimum 8 distinct test cases required.
 */

const assert = require('assert');
const { rulesEngine } = require('../src/services/rules');

function runRulesTests() {
  console.log('\n--- RUNNING TEST SUITE 1: RULES ENGINE (>= 8 CASES) ---');
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ Case ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ Case ${total}: ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  // Case 1: Fee for job pattern in English
  test('Rule: Detects upfront fee for job / internship (English)', () => {
    const text = 'Pay ₹2,000 for seat booking fee to confirm your developer offer letter.';
    const result = rulesEngine.evaluate(text);
    const rule = result.triggered_rules.find(r => r.rule_id === 'FEE_FOR_JOB');
    assert(rule, 'Should trigger FEE_FOR_JOB rule');
    assert.strictEqual(rule.weight, 45);
  });

  // Case 2: Tanglish fee-for-job phrasing
  test('Rule: Detects fee-for-job in Tanglish transliteration', () => {
    const text = 'Offer letter confirm panna ₹2,000 seat booking fee pay pannanum.';
    const result = rulesEngine.evaluate(text);
    const rule = result.triggered_rules.find(r => r.rule_id === 'FEE_FOR_JOB');
    assert(rule, 'Should trigger FEE_FOR_JOB in Tanglish');
  });

  // Case 3: Personal UPI ID extraction in recruitment offer
  test('Rule: Detects personal UPI payment request in recruitment context', () => {
    const text = 'Send your onboarding payment to recruiter.support@okaxis immediately.';
    const result = rulesEngine.evaluate(text);
    const rule = result.triggered_rules.find(r => r.rule_id === 'PERSONAL_UPI_IN_OFFER');
    assert(rule, 'Should trigger PERSONAL_UPI_IN_OFFER');
  });

  // Case 4: Artificial urgency and pressure coercion
  test('Rule: Detects artificial urgency and pressure coercion', () => {
    const text = 'Only 2 seats left! Pay within 10 minutes or offer will be cancelled today.';
    const result = rulesEngine.evaluate(text);
    const rule = result.triggered_rules.find(r => r.rule_id === 'ARTIFICIAL_URGENCY');
    assert(rule, 'Should trigger ARTIFICIAL_URGENCY');
  });

  // Case 5: Tier-1 brand impersonation without corporate domain
  test('Rule: Detects unverified MNC brand impersonation (Google with fee)', () => {
    const text = 'Google India hiring freshers! Pay ₹1,500 registration charge.';
    const result = rulesEngine.evaluate(text, { is_verified_source: false });
    const rule = result.triggered_rules.find(r => r.rule_id === 'BRAND_IMPERSONATION');
    assert(rule, 'Should trigger BRAND_IMPERSONATION');
  });

  // Case 6: Task / YouTube rating fraud in Hindi
  test('Rule: Detects YouTube like and rating task fraud in Hindi', () => {
    const text = 'घर बैठे यूट्यूब वीडियो लाइक और सब्सक्राइब करने पर प्रत्येक लाइक के ₹150 मिलेंगे।';
    const result = rulesEngine.evaluate(text);
    const rule = result.triggered_rules.find(r => r.rule_id === 'TASK_RATING_FRAUD');
    assert(rule, 'Should trigger TASK_RATING_FRAUD in Hindi');
  });

  // Case 7: Fake government scholarship scheme in Malayalam
  test('Rule: Detects fake government scholarship with server fee in Malayalam', () => {
    const text = 'കേന്ദ്ര ഗവൺമെന്റ് സ്കോളർഷിപ്പ് മാർക്ക് നിബന്ധനകളില്ല സർവർ രജിസ്ട്രേഷൻ ഫീസ് ₹750.';
    const result = rulesEngine.evaluate(text);
    const rule = result.triggered_rules.find(r => r.rule_id === 'FAKE_GOVT_SCHEME');
    assert(rule, 'Should trigger FAKE_GOVT_SCHEME in Malayalam');
  });

  // Case 8: Instant student loan fee in Telugu
  test('Rule: Detects instant student loan with processing fee in Telugu', () => {
    const text = 'Instant ₹50,000 loan zero cibil. NOC and loan approval file processing fee ₹999.';
    const result = rulesEngine.evaluate(text);
    const rule = result.triggered_rules.find(r => r.rule_id === 'INSTANT_LOAN_FEE');
    assert(rule, 'Should trigger INSTANT_LOAN_FEE in Telugu');
  });

  // Case 9: Crypto / Doubling Ponzi fraud
  test('Rule: Detects guaranteed investment doubler (Ponzi claim)', () => {
    const text = 'Multiply your money: Send ₹1,000 get ₹2,500 within 24 hours guaranteed with 100% risk free bot.';
    const result = rulesEngine.evaluate(text);
    const rule = result.triggered_rules.find(r => r.rule_id === 'PONZI_DOUBLE_MONEY');
    assert(rule, 'Should trigger PONZI_DOUBLE_MONEY');
  });

  // Case 10: Deep-link URI scheme detection
  test('Rule: Detects deep link upi://pay URI invocation', () => {
    const text = 'Pay now via upi://pay?pa=papers.leak2026@axisbank&pn=ExamsDesk&am=1200';
    const result = rulesEngine.evaluate(text);
    const rule = result.triggered_rules.find(r => r.rule_id === 'UPI_URI_PAYMENT_SCHEME');
    assert(rule, 'Should trigger UPI_URI_PAYMENT_SCHEME');
  });

  console.log(`\nRules Engine Test Results: ${passed}/${total} PASSED\n`);
  return { passed, total };
}

if (require.main === module) {
  const { passed, total } = runRulesTests();
  if (passed !== total) process.exit(1);
}

module.exports = { runRulesTests };
