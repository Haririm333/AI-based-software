/**
 * Test Suite 2: Risk Scorer Tests (including False Positives)
 * Validates 0-100 scoring, Red/Amber/Green classification, Tamil reasons output,
 * and false-positive prevention on genuine opportunities.
 * Minimum 8 distinct test cases required.
 */

const assert = require('assert');
const { riskScorer } = require('../src/services/risk_scorer');
const { GENUINE_OPPORTUNITIES, SCAMS } = require('../src/data/seed_data');

function runRiskScorerTests() {
  console.log('\n--- RUNNING TEST SUITE 2: RISK SCORER & FALSE POSITIVES (>= 8 CASES) ---');
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

  // Case 1: Core Demo Flow Trigger: "Google internship, pay ₹2,000 to confirm your seat."
  // Exact requirement: "The scorer returns 92 (Red), blocks it, and shows the reasons in Tamil."
  test('Demo Trigger: Google internship ₹2,000 seat fee returns 92 (RED), blocked, and Tamil reasons', () => {
    const text = 'Google internship, pay ₹2,000 to confirm your seat.';
    const result = riskScorer.score(text, { language_code: 'ta' });

    assert.strictEqual(result.risk_score, 92, 'Scorer must return exactly 92 for demo trigger');
    assert.strictEqual(result.risk_band, 'RED', 'Must be in RED risk band');
    assert.strictEqual(result.decision, 'BLOCK', 'Must block the fake post');
    assert.strictEqual(result.is_blocked, true, 'is_blocked flag must be true');

    // Verify Tamil reasons
    assert(result.multilingual_explanation.ta, 'Tamil explanation must exist');
    assert(result.multilingual_explanation.ta.headline.includes('மோசடி') || result.multilingual_explanation.ta.headline.includes('எச்சரிக்கை'), 'Tamil headline must be alert');
    assert(result.multilingual_explanation.ta.reasons.length >= 3, 'Must have at least 3 reasons in Tamil');
    assert(result.multilingual_explanation.ta.action.includes('1930'), 'Must cite 1930 helpline in Tamil');
  });

  // Case 2: Wipro laptop courier deposit scam in Hinglish/English
  test('Scam: Wipro onboarding laptop courier deposit ₹3,500 scores in RED band', () => {
    const post = SCAMS.find(s => s.id === 'scam-02');
    const result = riskScorer.score(post.content, { language_code: 'hi' });
    assert(result.risk_score >= 70, `Score should be >= 70 (got ${result.risk_score})`);
    assert.strictEqual(result.risk_band, 'RED');
    assert.strictEqual(result.decision, 'BLOCK');
  });

  // Case 3: YouTube like task scam in Hindi
  test('Scam: YouTube like task ₹500 VIP fee scores in RED band', () => {
    const post = SCAMS.find(s => s.id === 'scam-03');
    const result = riskScorer.score(post.content, { language_code: 'hi' });
    assert(result.risk_score >= 70, `Score should be >= 70 (got ${result.risk_score})`);
    assert.strictEqual(result.risk_band, 'RED');
  });

  // Case 4: Fake Govt Scholarship scheme in Malayalam
  test('Scam: Central Scholarship ₹750 server fee scores in RED band', () => {
    const post = SCAMS.find(s => s.id === 'scam-05');
    const result = riskScorer.score(post.content, { language_code: 'ml' });
    assert(result.risk_score >= 70, `Score should be >= 70 (got ${result.risk_score})`);
    assert.strictEqual(result.risk_band, 'RED');
  });

  // Case 5: Crypto doubler Ponzi
  test('Scam: Crypto doubling bot 200% return scores in RED band', () => {
    const post = SCAMS.find(s => s.id === 'scam-09');
    const result = riskScorer.score(post.content);
    assert(result.risk_score >= 70, `Score should be >= 70 (got ${result.risk_score})`);
    assert.strictEqual(result.risk_band, 'RED');
  });

  // --- FALSE POSITIVE CHALLENGE CASES (Genuine Opportunities) ---

  // Case 6: [FALSE POSITIVE 1] Open source mentorship with ₹15,000 stipend
  test('False Positive Prevention 1: Open source ₹15,000 stipend with verified domain stays GREEN (Safe)', () => {
    const post = GENUINE_OPPORTUNITIES.find(g => g.id === 'gen-01');
    const result = riskScorer.score(post.content, {
      is_verified_source: true,
      domain: post.domain
    });
    assert(result.risk_score < 30, `Score should be < 30 for verified open-source stipend (got ${result.risk_score})`);
    assert.strictEqual(result.risk_band, 'GREEN', 'Must be classified as GREEN');
    assert.strictEqual(result.decision, 'ALLOW', 'Must ALLOW legitimate opportunity');
  });

  // Case 7: [FALSE POSITIVE 2] Smart India Hackathon logistics with Telegram group
  test('False Positive Prevention 2: Hackathon logistics Telegram group stays GREEN (Safe)', () => {
    const post = GENUINE_OPPORTUNITIES.find(g => g.id === 'gen-02');
    const result = riskScorer.score(post.content, {
      is_verified_source: true,
      domain: post.domain
    });
    assert(result.risk_score < 30, `Score should be < 30 for university SIH logistics (got ${result.risk_score})`);
    assert.strictEqual(result.risk_band, 'GREEN');
    assert.strictEqual(result.decision, 'ALLOW');
  });

  // Case 8: [FALSE POSITIVE 3] MIT Robotics workshop with nominal ₹150 kit fee on university portal
  test('False Positive Prevention 3: University workshop with ₹150 lab kit fee on .edu.in stays GREEN', () => {
    const post = GENUINE_OPPORTUNITIES.find(g => g.id === 'gen-03');
    const result = riskScorer.score(post.content, {
      is_verified_source: true,
      domain: post.domain
    });
    assert(result.risk_score < 30, `Score should be < 30 for academic lab kit fee (got ${result.risk_score})`);
    assert.strictEqual(result.risk_band, 'GREEN');
    assert.strictEqual(result.decision, 'ALLOW');
  });

  // Case 9: [FALSE POSITIVE 4] IIT Delhi RA role with Google Form link
  test('False Positive Prevention 4: Academic Research Assistant Google Form application stays GREEN', () => {
    const post = GENUINE_OPPORTUNITIES.find(g => g.id === 'gen-04');
    const result = riskScorer.score(post.content, {
      is_verified_source: true,
      domain: post.domain
    });
    assert(result.risk_score < 30, `Score should be < 30 for IIT Delhi RA position (got ${result.risk_score})`);
    assert.strictEqual(result.risk_band, 'GREEN');
  });

  // Case 10: [FALSE POSITIVE 5] Startup Frontend Internship with anti-fee declaration
  test('False Positive Prevention 5: FinScale frontend internship with explicit anti-fee declaration stays GREEN', () => {
    const post = GENUINE_OPPORTUNITIES.find(g => g.id === 'gen-05');
    const result = riskScorer.score(post.content, {
      is_verified_source: true,
      domain: post.domain
    });
    assert(result.risk_score < 30, `Score should be < 30 for zero-fee corporate hiring (got ${result.risk_score})`);
    assert.strictEqual(result.risk_band, 'GREEN');
    assert.strictEqual(result.decision, 'ALLOW');
  });

  console.log(`\nRisk Scorer Test Results: ${passed}/${total} PASSED\n`);
  return { passed, total };
}

if (require.main === module) {
  const { passed, total } = runRiskScorerTests();
  if (passed !== total) process.exit(1);
}

module.exports = { runRiskScorerTests };
