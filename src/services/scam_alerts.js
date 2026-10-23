/**
 * Trust Shield Scam Alerts Service
 * Community safety broadcast feed and viral money rumor fact-checking registry.
 * Enables student awareness against trending campus fraud patterns.
 */

const { VIRAL_RUMORS } = require('../data/seed_data');

class ScamAlertsService {
  constructor() {
    this.alerts = [];
    this.init();
  }

  init() {
    // Convert viral rumors into active broadcast alerts
    VIRAL_RUMORS.forEach((rumor, index) => {
      this.alerts.push({
        id: `alert-${index + 1}`,
        title: rumor.rumor_title,
        severity: rumor.is_safe ? 'INFO' : 'HIGH_ALERT',
        languages: rumor.languages,
        claim: rumor.claim,
        debunk: rumor.debunk_explanation,
        status: rumor.fact_check_status,
        advisory_link: rumor.official_advisory_link,
        viral_sample: rumor.viral_text_snippet,
        broadcast_time: `${(index + 1) * 3} hours ago`,
        upvotes: 35 + index * 12,
        verified_by: 'Trust Shield AI & PIB FactCheck'
      });
    });
  }

  getAllAlerts() {
    return this.alerts;
  }

  broadcastNewAlert(data) {
    const newAlert = {
      id: `alert-${Date.now()}`,
      title: data.title || 'Community Scam Alert',
      severity: data.severity || 'HIGH_ALERT',
      languages: data.languages || ['English'],
      claim: data.claim || 'Unverified suspicious financial proposition',
      debunk: data.debunk || 'Confirmed fraudulent scheme intercepted by Trust Shield.',
      status: 'VERIFIED_FRAUD',
      advisory_link: data.advisory_link || 'https://cybercrime.gov.in',
      viral_sample: data.viral_sample || '',
      broadcast_time: 'Just now',
      upvotes: 1,
      verified_by: 'Trust Shield Community Consensus'
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  searchAlerts(keyword) {
    if (!keyword) return this.alerts;
    const lower = keyword.toLowerCase();
    return this.alerts.filter(a => 
      a.title.toLowerCase().includes(lower) ||
      a.claim.toLowerCase().includes(lower) ||
      a.debunk.toLowerCase().includes(lower)
    );
  }
}

const scamAlertsService = new ScamAlertsService();

module.exports = {
  ScamAlertsService,
  scamAlertsService
};
