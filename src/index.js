/**
 * Trust Shield - Unified Backend Module
 */

const { db, Database } = require('./data/db');
const seedData = require('./data/seed_data');
const { rulesEngine, RULES, MITIGATION_RULES } = require('./services/rules');
const { riskScorer, RiskScorer } = require('./services/risk_scorer');
const { paymentGuard, PaymentGuard } = require('./services/payment_guard');
const { reportBuilder, ReportBuilder } = require('./services/report_builder');
const { scamAlertsService, ScamAlertsService } = require('./services/scam_alerts');

module.exports = {
  db,
  Database,
  seedData,
  rulesEngine,
  RULES,
  MITIGATION_RULES,
  riskScorer,
  RiskScorer,
  paymentGuard,
  PaymentGuard,
  reportBuilder,
  ReportBuilder,
  scamAlertsService,
  ScamAlertsService
};
