/**
 * Trust Shield Database Layer
 * Implements the 5 required core tables:
 * 1. risk_assessments
 * 2. appeals
 * 3. review_queue
 * 4. scam_reports
 * 5. verified_employers
 * Along with helper collections for posts, chats, users, and safety badges.
 */

const {
  SCAMS,
  GENUINE_OPPORTUNITIES,
  PAYMENT_CHATS,
  TRUSTED_SOURCES,
  VIRAL_RUMORS
} = require('./seed_data');

class Database {
  constructor() {
    this.tables = {
      risk_assessments: new Map(),
      appeals: new Map(),
      review_queue: new Map(),
      scam_reports: new Map(),
      verified_employers: new Map(),
      posts: new Map(),
      chats: new Map(),
      users: new Map(),
      viral_rumors: new Map()
    };

    this.init();
  }

  init() {
    // 1. Seed Verified Employers
    TRUSTED_SOURCES.forEach(source => {
      this.tables.verified_employers.set(source.id, {
        id: source.id,
        name: source.name,
        domain: source.domain,
        type: source.type,
        category: source.category,
        badge: source.badge,
        cin_gst: source.cin_gst,
        safety_rule: source.safety_rule,
        verification_tier: 'TIER_1_CERTIFIED',
        is_verified: true,
        verified_at: '2026-01-15T00:00:00.000Z'
      });
    });

    // 2. Seed Posts (Scams + Genuine Opportunities)
    SCAMS.forEach(scam => {
      this.tables.posts.set(scam.id, {
        ...scam,
        is_scam: true,
        status: 'PENDING_SCAN', // will be evaluated by scorer
        upvotes: 2,
        comments_count: 5,
        reported_count: 0
      });
    });

    GENUINE_OPPORTUNITIES.forEach(opp => {
      this.tables.posts.set(opp.id, {
        ...opp,
        is_scam: false,
        status: 'ACTIVE',
        upvotes: 42,
        comments_count: 14,
        reported_count: 0
      });
    });

    // 3. Seed Chats
    PAYMENT_CHATS.forEach(chat => {
      this.tables.chats.set(chat.id, { ...chat });
    });

    // 4. Seed Viral Rumors
    VIRAL_RUMORS.forEach(rumor => {
      this.tables.viral_rumors.set(rumor.id, { ...rumor });
    });

    // 5. Seed Primary User (Student Profile)
    this.tables.users.set('user-student-01', {
      id: 'user-student-01',
      name: 'Hariram S.',
      handle: '@hariram_tech',
      role: 'Student & Tech Fellow',
      college: 'College of Engineering, Guindy / Anna University',
      avatar: '👨‍💻',
      trust_score: 68,
      trust_tier: 'Silver Member',
      skills: ['Python', 'Cybersecurity', 'Web Architecture', 'Machine Learning'],
      badges: ['Campus Contributor', 'Bug Finder'],
      safety_score: 72,
      confirmed_reports_count: 0,
      safety_skill_earned: false, // Proof point: Earned upon confirmed scam report!
      safety_badge: null
    });
  }

  // --- 1. risk_assessments Table Methods ---
  createRiskAssessment(data) {
    const id = data.id || `ra-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const record = {
      id,
      entity_type: data.entity_type || 'post', // 'post' | 'chat_message' | 'profile'
      entity_id: data.entity_id,
      risk_score: data.risk_score, // 0 to 100
      risk_band: data.risk_band, // 'GREEN' | 'AMBER' | 'RED'
      decision: data.decision, // 'ALLOW' | 'FLAG_WARNING' | 'BLOCK'
      language: data.language || 'en',
      triggered_rules: data.triggered_rules || [],
      multilingual_explanation: data.multilingual_explanation || {},
      confidence: data.confidence || 0.95,
      timestamp: new Date().toISOString()
    };
    this.tables.risk_assessments.set(id, record);
    return record;
  }

  getRiskAssessment(id) {
    return this.tables.risk_assessments.get(id);
  }

  getRiskAssessmentByEntity(entityId) {
    for (const assessment of this.tables.risk_assessments.values()) {
      if (assessment.entity_id === entityId) return assessment;
    }
    return null;
  }

  getAllRiskAssessments() {
    return Array.from(this.tables.risk_assessments.values());
  }

  // --- 2. appeals Table Methods ---
  createAppeal(data) {
    const id = data.id || `appeal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const record = {
      id,
      assessment_id: data.assessment_id,
      post_id: data.post_id,
      appellant_id: data.appellant_id,
      grounds: data.grounds,
      evidence_urls: data.evidence_urls || [],
      status: 'UNDER_REVIEW', // 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED'
      reviewer_comments: null,
      created_at: new Date().toISOString(),
      resolved_at: null
    };
    this.tables.appeals.set(id, record);
    return record;
  }

  getAppeal(id) {
    return this.tables.appeals.get(id);
  }

  updateAppealStatus(id, status, comments) {
    const appeal = this.tables.appeals.get(id);
    if (!appeal) return null;
    appeal.status = status;
    appeal.reviewer_comments = comments;
    appeal.resolved_at = new Date().toISOString();
    return appeal;
  }

  getAllAppeals() {
    return Array.from(this.tables.appeals.values());
  }

  // --- 3. review_queue Table Methods ---
  addToReviewQueue(data) {
    const id = data.id || `rq-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const record = {
      id,
      entity_type: data.entity_type, // 'post' | 'chat' | 'appeal'
      entity_id: data.entity_id,
      risk_score: data.risk_score,
      risk_band: data.risk_band,
      priority: data.risk_score >= 80 ? 'CRITICAL' : data.risk_score >= 50 ? 'HIGH' : 'MEDIUM',
      flags: data.flags || [],
      status: 'QUEUED', // 'QUEUED' | 'IN_REVIEW' | 'RESOLVED'
      assigned_analyst: data.assigned_analyst || 'Trust & Safety AI Agent',
      created_at: new Date().toISOString(),
      resolved_at: null
    };
    this.tables.review_queue.set(id, record);
    return record;
  }

  getReviewQueueItem(id) {
    return this.tables.review_queue.get(id);
  }

  getAllReviewQueue(filterStatus = null) {
    const all = Array.from(this.tables.review_queue.values());
    if (filterStatus) {
      return all.filter(item => item.status === filterStatus);
    }
    return all;
  }

  resolveReviewItem(id, resolution) {
    const item = this.tables.review_queue.get(id);
    if (!item) return null;
    item.status = 'RESOLVED';
    item.resolution = resolution;
    item.resolved_at = new Date().toISOString();
    return item;
  }

  // --- 4. scam_reports Table Methods ---
  createScamReport(data) {
    const id = data.id || `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const record = {
      id,
      reporter_id: data.reporter_id || 'user-student-01',
      reported_entity_type: data.reported_entity_type, // 'post' | 'chat' | 'upi_id'
      reported_entity_id: data.reported_entity_id,
      suspect_name: data.suspect_name,
      suspect_handle: data.suspect_handle,
      suspect_upi_id: data.suspect_upi_id,
      suspect_phone: data.suspect_phone || null,
      amount_solicited: data.amount_solicited || null,
      scam_type: data.scam_type,
      evidence_text: data.evidence_text,
      language: data.language || 'English',
      cybercrime_complaint_prefill: data.cybercrime_complaint_prefill || null,
      status: 'CONFIRMED', // Once confirmed, grants Safety skill!
      helpline_dispatched: true, // 1930 Helpline dispatch flag
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString()
    };
    this.tables.scam_reports.set(id, record);

    // PROOF POINT: Award "Safety" skill to reporter upon confirmed scam report!
    if (record.reporter_id && record.status === 'CONFIRMED') {
      this.awardSafetySkill(record.reporter_id, id);
    }

    return record;
  }

  awardSafetySkill(userId, reportId) {
    const user = this.tables.users.get(userId);
    if (user) {
      if (!user.skills.includes('Safety')) {
        user.skills.push('Safety');
      }
      user.safety_skill_earned = true;
      user.safety_badge = {
        name: 'Trust Shield Safety Sentinel',
        level: 'Verified Defender',
        earned_at: new Date().toISOString(),
        confirmed_report_id: reportId,
        trust_boost: '+20 Trust Quotient',
        verification_hash: `TS-${Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED`
      };
      user.trust_score = Math.min(98, user.trust_score + 20);
      user.safety_score = 96;
      user.confirmed_reports_count += 1;
      this.tables.users.set(userId, user);
    }
  }

  getScamReport(id) {
    return this.tables.scam_reports.get(id);
  }

  getAllScamReports() {
    return Array.from(this.tables.scam_reports.values());
  }

  // --- 5. verified_employers Table Methods ---
  getVerifiedEmployer(id) {
    return this.tables.verified_employers.get(id);
  }

  getAllVerifiedEmployers() {
    return Array.from(this.tables.verified_employers.values());
  }

  isDomainVerified(domain) {
    if (!domain) return false;
    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    for (const employer of this.tables.verified_employers.values()) {
      const empDomain = employer.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      if (cleanDomain === empDomain || cleanDomain.endsWith('.' + empDomain) || empDomain.endsWith('.' + cleanDomain)) {
        return employer;
      }
    }
    return null;
  }

  // --- Post and Chat Methods ---
  getPost(id) {
    return this.tables.posts.get(id);
  }

  getAllPosts() {
    return Array.from(this.tables.posts.values());
  }

  updatePost(id, updates) {
    const post = this.tables.posts.get(id);
    if (!post) return null;
    const updated = { ...post, ...updates };
    this.tables.posts.set(id, updated);
    return updated;
  }

  getChat(id) {
    return this.tables.chats.get(id);
  }

  getAllChats() {
    return Array.from(this.tables.chats.values());
  }

  getUser(id = 'user-student-01') {
    return this.tables.users.get(id);
  }

  getAllRumors() {
    return Array.from(this.tables.viral_rumors.values());
  }
}

const db = new Database();

module.exports = { db, Database };
