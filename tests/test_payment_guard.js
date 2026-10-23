/**
 * Test Suite 3: Payment Guard Tests (UPI Regex Edge Cases & Multilingual Phrases)
 * Validates UPI ID parsing across edge cases (case-insensitivity, numeric VPAs, deep links,
 * punctuation) and multilingual payment coercion phrases across Tamil, Hindi, Telugu, Malayalam, English.
 * Minimum 8 distinct test cases required.
 */

const assert = require('assert');
const { paymentGuard } = require('../src/services/payment_guard');

function runPaymentGuardTests() {
  console.log('\n--- RUNNING TEST SUITE 3: PAYMENT GUARD (UPI REGEX & MULTILINGUAL) (>= 8 CASES) ---');
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

  // Case 1: Standard lowercase UPI ID extraction
  test('UPI Regex 1: Extracts standard lowercase UPI ID', () => {
    const text = 'Transfer ₹2,000 to google.hr.recruitment@okicici right now.';
    const result = paymentGuard.inspectMessage(text);
    assert(result.detected_upis.includes('google.hr.recruitment@okicici'), 'Should extract google.hr.recruitment@okicici');
    assert.strictEqual(result.amount, 2000);
    assert.strictEqual(result.is_payment_moment, true);
  });

  // Case 2: Uppercase & mixed-case edge cases
  test('UPI Regex 2: Handles UPPERCASE and Mixed-Case edge cases', () => {
    const text = 'Send token fee to QUICKHR@OKAXIS or Task.Manager99@Paytm immediately.';
    const result = paymentGuard.inspectMessage(text);
    assert(result.detected_upis.includes('quickhr@okaxis'), 'Should extract quickhr@okaxis in lowercase');
    assert(result.detected_upis.includes('task.manager99@paytm'), 'Should extract task.manager99@paytm in lowercase');
  });

  // Case 3: Numeric VPA edge cases (Mobile number based UPI handles)
  test('UPI Regex 3: Extracts numeric mobile VPAs (e.g., 9876543210@paytm)', () => {
    const text = 'Pay to 9876543210@paytm or 9123456789@ybl for instant activation.';
    const result = paymentGuard.inspectMessage(text);
    assert(result.detected_upis.includes('9876543210@paytm'), 'Should extract 9876543210@paytm');
    assert(result.detected_upis.includes('9123456789@ybl'), 'Should extract 9123456789@ybl');
  });

  // Case 4: Deep-link URI protocol scheme (upi://pay?...)
  test('UPI Regex 4: Detects deep link upi:// protocol scheme', () => {
    const text = 'Direct checkout via upi://pay?pa=papers.leak2026@axisbank&pn=ExamsDesk&am=1200 click to pay.';
    const result = paymentGuard.inspectMessage(text);
    assert(result.detected_uris.length > 0, 'Should detect UPI URI protocol');
    assert(result.detected_uris[0].startsWith('upi://pay?pa=papers.leak2026@axisbank'));
    assert.strictEqual(result.is_payment_moment, true);
  });

  // Case 5: Punctuation wrapping edge cases (trailing period, parentheses)
  test('UPI Regex 5: Strips punctuation boundaries correctly (parentheses, trailing dot)', () => {
    const text = 'Please pay to recruiter-desk.blr@okhdfcbank. or (bng.stays.token@icici) immediately.';
    const result = paymentGuard.inspectMessage(text);
    assert(result.detected_upis.includes('recruiter-desk.blr@okhdfcbank'), 'Should clean trailing period');
    assert(result.detected_upis.includes('bng.stays.token@icici'), 'Should clean parentheses');
  });

  // Case 6: Multilingual Tamil / Tanglish coercion phrases
  test('Multilingual Coercion 1: Detects Tamil / Tanglish payment pressure phrases', () => {
    const text1 = 'வேலைக்கு கட்டணம் செலுத்த வேண்டும் ₹2,000.';
    const result1 = paymentGuard.inspectMessage(text1);
    assert(result1.coercion_signals.some(s => s.lang === 'ta'), 'Should flag Tamil payment coercion');

    const text2 = 'Token advance pay panni room lock pannikalam: landlord.pg.chennai@okhdfcbank.';
    const result2 = paymentGuard.inspectMessage(text2);
    assert(result2.coercion_signals.some(s => s.lang === 'ta'), 'Should flag Tanglish room lock payment');
    assert(result2.detected_upis.includes('landlord.pg.chennai@okhdfcbank'));
  });

  // Case 7: Multilingual Hindi / Hinglish coercion phrases
  test('Multilingual Coercion 2: Detects Hindi / Hinglish payment pressure phrases', () => {
    const text1 = 'पैसे भेजें तुरंत student.fund.verify@kotak पर ₹499.';
    const result1 = paymentGuard.inspectMessage(text1);
    assert(result1.coercion_signals.some(s => s.lang === 'hi'), 'Should flag Hindi money transfer');

    const text2 = 'Security deposit dena hoga wipro.onboarding.dispatch@ybl par ₹3,500.';
    const result2 = paymentGuard.inspectMessage(text2);
    assert(result2.coercion_signals.some(s => s.lang === 'hi'), 'Should flag Hinglish security deposit');
  });

  // Case 8: Multilingual Telugu / Telglish coercion phrases
  test('Multilingual Coercion 3: Detects Telugu / Telglish payment pressure phrases', () => {
    const text = 'Portal fee pay cheyandi ₹499 maps.rating.corp@axisbank ki.';
    const result = paymentGuard.inspectMessage(text);
    assert(result.coercion_signals.some(s => s.lang === 'te'), 'Should flag Telglish portal fee');
    assert(result.detected_upis.includes('maps.rating.corp@axisbank'));
  });

  // Case 9: Multilingual Malayalam coercion phrases
  test('Multilingual Coercion 4: Detects Malayalam registration fee phrases', () => {
    const text = 'രജിസ്ട്രേഷൻ ഫീസ് അയക്കുക scholarship.desk@oksbi എന്ന യുപിഐ ഐഡിയിലേക്ക്.';
    const result = paymentGuard.inspectMessage(text);
    assert(result.coercion_signals.some(s => s.lang === 'ml'), 'Should flag Malayalam registration fee');
    assert(result.detected_upis.includes('scholarship.desk@oksbi'));
  });

  // Case 10: Intercept Warning Modal generation
  test('Payment Intercept Modal: Formats complete warning modal data with 1930 helpline', () => {
    const text = 'Congratulations! To confirm your intern seat, send ₹2,000 to google.hr.recruitment@okicici right now.';
    const result = paymentGuard.inspectMessage(text);
    assert.strictEqual(result.is_payment_moment, true);
    assert(result.warning_modal_data !== null, 'Warning modal data must be populated');
    assert.strictEqual(result.warning_modal_data.intercepted_upi, 'google.hr.recruitment@okicici');
    assert.strictEqual(result.warning_modal_data.amount_requested, '₹2,000');
    assert.strictEqual(result.warning_modal_data.helpline, '1930');
    assert(result.warning_modal_data.safety_checklist.length >= 3);
  });

  console.log(`\nPayment Guard Test Results: ${passed}/${total} PASSED\n`);
  return { passed, total };
}

if (require.main === module) {
  const { passed, total } = runPaymentGuardTests();
  if (passed !== total) process.exit(1);
}

module.exports = { runPaymentGuardTests };
