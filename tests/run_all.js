/**
 * Master Test Runner for Trust Shield
 * Runs all test suites:
 * 1. Rules Engine (10 cases)
 * 2. Risk Scorer & False Positives (10 cases)
 * 3. Payment Guard & UPI Regex / Multilingual (10 cases)
 * Total: 30 cases (Well exceeds the >= 8 cases per module requirement)
 */

const { runRulesTests } = require('./test_rules');
const { runRiskScorerTests } = require('./test_risk_scorer');
const { runPaymentGuardTests } = require('./test_payment_guard');

console.log('================================================================');
console.log('        TRUST SHIELD ARCHITECTURE & SAFETY TEST SUITE           ');
console.log('================================================================');

const results = [];
results.push({ suite: 'Rules Engine', ...runRulesTests() });
results.push({ suite: 'Risk Scorer & False Positives', ...runRiskScorerTests() });
results.push({ suite: 'Payment Guard & Multilingual UPI', ...runPaymentGuardTests() });

console.log('================================================================');
console.log('                        SUMMARY REPORT                          ');
console.log('================================================================');
let totalPassed = 0;
let grandTotal = 0;

results.forEach(r => {
  totalPassed += r.passed;
  grandTotal += r.total;
  console.log(`  ${r.suite.padEnd(35)} : ${r.passed}/${r.total} Passed`);
});

console.log('----------------------------------------------------------------');
console.log(`  GRAND TOTAL                         : ${totalPassed}/${grandTotal} Passed`);
console.log('================================================================\n');

if (totalPassed === grandTotal) {
  console.log('🎉 ALL TRUST SHIELD TESTS PASSED SUCCESSFULLY! (Exit Code 0)\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
