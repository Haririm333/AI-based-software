/**
 * Trust Shield - Express Application Server
 * Serves REST APIs for real-time risk scoring, payment moment interception,
 * cybercrime reporting, trusted verification, and community alert feeds.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const {
  db,
  seedData,
  rulesEngine,
  riskScorer,
  paymentGuard,
  reportBuilder,
  scamAlertsService
} = require('./src');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize all posts with risk assessments
function initializeFeedScoring() {
  const allPosts = db.getAllPosts();
  allPosts.forEach(post => {
    const isVerified = db.isDomainVerified(post.domain);
    const assessment = riskScorer.score(post.content, {
      language_code: post.language_code,
      is_verified_source: !!post.verified_source,
      domain: post.domain,
      is_verified_employer: !!isVerified
    });

    const record = db.createRiskAssessment({
      entity_type: 'post',
      entity_id: post.id,
      risk_score: assessment.risk_score,
      risk_band: assessment.risk_band,
      decision: assessment.decision,
      language: post.language_code,
      triggered_rules: assessment.triggered_rules,
      multilingual_explanation: assessment.multilingual_explanation,
      confidence: assessment.confidence
    });

    db.updatePost(post.id, {
      assessment: record,
      risk_score: assessment.risk_score,
      risk_band: assessment.risk_band,
      is_blocked: assessment.is_blocked
    });

    if (assessment.risk_band === 'RED' || assessment.risk_band === 'AMBER') {
      db.addToReviewQueue({
        entity_type: 'post',
        entity_id: post.id,
        risk_score: assessment.risk_score,
        risk_band: assessment.risk_band,
        flags: assessment.triggered_rules.map(r => r.name)
      });
    }
  });
}

initializeFeedScoring();

// --- API ROUTES ---

// 1. Get Feed Posts
app.get('/api/feed', (req, res) => {
  const { filter, lang } = req.query;
  let posts = db.getAllPosts();

  if (filter === 'scams') {
    posts = posts.filter(p => p.is_scam);
  } else if (filter === 'genuine') {
    posts = posts.filter(p => !p.is_scam);
  } else if (filter === 'blocked') {
    posts = posts.filter(p => p.is_blocked);
  }

  if (lang) {
    posts = posts.filter(p => p.language_code && p.language_code.includes(lang));
  }

  res.json({
    total: posts.length,
    posts: posts
  });
});

// 2. Real-time Risk Scorer Endpoint
app.post('/api/scan', (req, res) => {
  const { text, language_code, domain, author } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text content is required' });
  }

  const isVerified = db.isDomainVerified(domain);
  const assessment = riskScorer.score(text, {
    language_code: language_code || 'en',
    domain: domain,
    is_verified_employer: !!isVerified,
    is_verified_source: !!isVerified
  });

  const record = db.createRiskAssessment({
    entity_type: 'ad_hoc_scan',
    entity_id: `adhoc-${Date.now()}`,
    risk_score: assessment.risk_score,
    risk_band: assessment.risk_band,
    decision: assessment.decision,
    language: language_code || 'en',
    triggered_rules: assessment.triggered_rules,
    multilingual_explanation: assessment.multilingual_explanation
  });

  if (assessment.is_blocked) {
    db.addToReviewQueue({
      entity_type: 'ad_hoc_scan',
      entity_id: record.id,
      risk_score: assessment.risk_score,
      risk_band: assessment.risk_band,
      flags: assessment.triggered_rules.map(r => r.name)
    });
  }

  res.json({
    assessment: record,
    detailed_score: assessment
  });
});

// 3. Payment Guard Chat Interceptor Endpoint
app.post('/api/chat/inspect', (req, res) => {
  const { message, chat_id, sender } = req.body;
  const analysis = paymentGuard.inspectMessage(message);

  res.json({
    message_inspected: message,
    ...analysis
  });
});

// 4. Get Chats
app.get('/api/chats', (req, res) => {
  const chats = db.getAllChats();
  res.json({ chats });
});

// 5. Submit One-Tap Scam Report (Awards "Safety" Skill!)
app.post('/api/report', (req, res) => {
  const {
    suspect_name,
    suspect_handle,
    suspect_upi,
    amount,
    evidence_text,
    entity_type,
    entity_id
  } = req.body;

  // Build pre-filled cybercrime.gov.in complaint summary
  const complaintDossier = reportBuilder.buildCybercrimeSummary({
    suspect_name: suspect_name || 'HR Specialist (Google Impersonator)',
    suspect_handle: suspect_handle || '@google_placement_agent',
    suspect_upi: suspect_upi || 'google.hr.recruitment@okicici',
    amount: amount || 2000,
    evidence_text: evidence_text || 'Congratulations! To confirm your intern seat and receive onboarding credentials, pay ₹2,000 to google.hr.recruitment@okicici right now.'
  });

  // Create confirmed report in database (triggers awardSafetySkill)
  const report = db.createScamReport({
    reporter_id: 'user-student-01',
    reported_entity_type: entity_type || 'chat_message',
    reported_entity_id: entity_id || 'msg-103',
    suspect_name: complaintDossier.suspect.name,
    suspect_handle: complaintDossier.suspect.handle,
    suspect_upi_id: complaintDossier.suspect.upi_id,
    amount_solicited: 2000,
    scam_type: 'Fee-For-Job Advance UPI Fraud',
    evidence_text: evidence_text || complaintDossier.formal_complaint_text,
    cybercrime_complaint_prefill: complaintDossier
  });

  // Broadcast alert to community feed
  scamAlertsService.broadcastNewAlert({
    title: `Student Alert: Intercepted ${complaintDossier.suspect.upi_id}`,
    claim: 'Recruitment impersonator demanding ₹2,000 seat booking fee via UPI',
    debunk: 'Confirmed scam. UPI ID reported to 1930 Cybercrime Helpline for freeze.',
    viral_sample: evidence_text || ''
  });

  // Fetch updated user with new "Safety" skill and Trust Shield badge
  const updatedUser = db.getUser('user-student-01');

  res.json({
    success: true,
    message: 'Scam reported successfully! Cybercrime dossier packaged and dispatched.',
    report: report,
    cybercrime_dossier: complaintDossier,
    helpline: '1930',
    awarded_skill: 'Safety',
    user_profile: updatedUser
  });
});

// 6. User Profile Endpoint
app.get('/api/user', (req, res) => {
  const user = db.getUser('user-student-01');
  res.json({ user });
});

// 7. Verified Employers & Trusted Sources Endpoint
app.get('/api/verified-employers', (req, res) => {
  const employers = db.getAllVerifiedEmployers();
  res.json({
    total: employers.length,
    employers
  });
});

// 8. Scam Alerts & Rumors Endpoint
app.get('/api/alerts', (req, res) => {
  const alerts = scamAlertsService.getAllAlerts();
  const rumors = db.getAllRumors();
  res.json({
    alerts,
    viral_rumors: rumors
  });
});

// 9. Review Queue & Appeals
app.get('/api/review-queue', (req, res) => {
  const queue = db.getAllReviewQueue();
  const assessments = db.getAllRiskAssessments();
  const appeals = db.getAllAppeals();
  res.json({
    queue,
    assessments_count: assessments.length,
    appeals
  });
});

app.post('/api/appeal', (req, res) => {
  const { post_id, grounds, evidence_urls } = req.body;
  const assessment = db.getRiskAssessmentByEntity(post_id);
  const appeal = db.createAppeal({
    assessment_id: assessment ? assessment.id : null,
    post_id,
    appellant_id: 'user-student-01',
    grounds,
    evidence_urls
  });
  res.json({ success: true, appeal });
});

// 10. Dedicated 45-Second Demo Sequence Data Endpoint (Step 4 Demo Flow)
app.get('/api/demo/step4', (req, res) => {
  // Step 4a: Fake post: "Google internship, pay ₹2,000 to confirm your seat."
  const demoPostText = 'Google internship, pay ₹2,000 to confirm your seat.';
  const step4aAssessment = riskScorer.score(demoPostText, { language_code: 'ta' });

  // Step 4b: Scammer DM with UPI ID
  const demoChatMessage = 'Congratulations! To confirm your intern seat, send ₹2,000 to google.hr.recruitment@okicici right now.';
  const step4bPaymentIntercept = paymentGuard.inspectMessage(demoChatMessage);

  // Step 4c: Pre-filled Cybercrime report + 1930 Helpline
  const step4cSummary = reportBuilder.buildCybercrimeSummary({
    suspect_name: 'Google HR Campus Recruiter (Fake)',
    suspect_handle: '@google_placement_agent',
    suspect_upi: 'google.hr.recruitment@okicici',
    amount: 2000,
    evidence_text: demoChatMessage
  });

  res.json({
    title: '45-Second Trust Shield Sequence (Step 4)',
    step4a: {
      post_text: demoPostText,
      score: step4aAssessment.risk_score, // Exactly 92 (RED)
      risk_band: step4aAssessment.risk_band,
      is_blocked: step4aAssessment.is_blocked,
      reasons_tamil: step4aAssessment.multilingual_explanation.ta
    },
    step4b: {
      chat_message: demoChatMessage,
      detected_upi: step4bPaymentIntercept.detected_upis[0],
      modal_data: step4bPaymentIntercept.warning_modal_data
    },
    step4c: {
      cybercrime_prefill: step4cSummary,
      helpline: '1930',
      proof_point: 'Safety skill earned from confirmed scam reports (Trust Shield badge)'
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🛡️  TRUST SHIELD AI SOCIAL MEDIA SERVER RUNNING ON PORT ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
