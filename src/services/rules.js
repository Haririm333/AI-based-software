/**
 * Trust Shield Rules Service
 * Heuristic and pattern analysis engine designed for detecting student-targeted scams,
 * fee-for-job fraud, task fraud, fake schemes, and payment pressure tactics.
 * Includes explicit exemption and mitigation rules to prevent false positives on genuine opportunities.
 */

const RULES = {
  // 1. Fee for Job / Internship
  FEE_FOR_JOB: {
    id: 'FEE_FOR_JOB',
    name: 'Upfront Fee for Employment / Internship',
    category: 'RECRUITMENT_FRAUD',
    weight: 45,
    description: 'Demands upfront payment, seat booking fee, or registration fee for an internship or job offer.',
    patterns: [
      /pay\s*(?:₹|rs\.?|inr)?\s*[\d,]+\s*(?:to\s*confirm|for\s*seat|booking\s*fee|registration\s*fee|security\s*deposit)/i,
      /(?:fee|kattanam|panam|rupaye|paise)\s*(?:pay|katti|dena|kattavum)/i,
      /seat\s*booking\s*fee/i,
      /laptop\s*(?:deposit|security|courier\s*fee|insurance)/i,
      /onboarding\s*(?:fee|deposit|charge)/i,
      /fee\s*pay\s*pannanum/i, // Tanglish
      /seat\s*confirm\s*panna/i, // Tanglish
      /security\s*deposit\s*dena\s*hoga/i // Hinglish
    ]
  },

  // 2. Personal / Unverified UPI in recruitment or official context
  PERSONAL_UPI_IN_OFFER: {
    id: 'PERSONAL_UPI_IN_OFFER',
    name: 'Personal UPI Payment Solicited',
    category: 'PAYMENT_RISK',
    weight: 35,
    description: 'Asks user to send money directly to a personal UPI ID rather than a regulated merchant gateway.',
    patterns: [
      /(?:send|transfer|pay)\s*(?:payment\s*to|via\s*gpay\s*to|via\s*upi\s*to|to\s*upi\s*id|to)\s*([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64})/i,
      /([a-zA-Z0-9.\-_]{2,64}@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|apl|axl|ibl|barodampay|kotak|sbi|icici|axisbank))/i
    ]
  },

  // 3. Urgent Pressure Tactics
  ARTIFICIAL_URGENCY: {
    id: 'ARTIFICIAL_URGENCY',
    name: 'High Pressure / Artificial Deadline Coercion',
    category: 'SOCIAL_ENGINEERING',
    weight: 20,
    description: 'Uses extreme urgency (within minutes, limited seats, immediate cancellation threat) to bypass critical thinking.',
    patterns: [
      /only\s*\d+\s*seats?\s*left/i,
      /within\s*\d+\s*(?:mins|minutes|hours)/i,
      /immediately|urgently|right\s*now|turant|udanadi|urgent/i,
      /today\s*by\s*\d+\s*(?:pm|am)/i,
      /last\s*date\s*today/i,
      /offer\s*will\s*be\s*cancelled/i,
      /vera\s*aaluku\s*kuduthuduvom/i, // Tanglish
      /demand\s*bahut\s*high\s*hai/i // Hinglish
    ]
  },

  // 4. Tier-1 Brand Impersonation without Official Authentication
  BRAND_IMPERSONATION: {
    id: 'BRAND_IMPERSONATION',
    name: 'High-Value Brand Impersonation',
    category: 'IMPERSONATION',
    weight: 30,
    description: 'Invokes prestigious brands (Google, Wipro, TCS, Amazon, Microsoft) without official corporate domain validation.',
    brands: ['google', 'wipro', 'tcs', 'infosys', 'amazon', 'microsoft', 'apple', 'isro'],
    check: (text, context) => {
      const lower = text.toLowerCase();
      const mentionsBrand = ['google', 'wipro', 'tcs', 'infosys', 'amazon', 'microsoft'].some(b => lower.includes(b));
      if (!mentionsBrand) return false;

      // If domain is authentic verified corporate domain, this rule does not trigger
      if (context && context.verified_employer) return false;
      if (context && context.domain && (context.domain.includes('google.com') || context.domain.includes('tcs.com') || context.domain.includes('wipro.com'))) {
        return false;
      }
      // Triggers if brand mentioned alongside fee, unverified email, or personal handle
      const hasFeeOrUPI = /(?:pay|fee|₹|rs\.?|upi|deposit|salary|stipend)/i.test(text);
      return hasFeeOrUPI;
    }
  },

  // 5. Task / Rating / Like Fraud
  TASK_RATING_FRAUD: {
    id: 'TASK_RATING_FRAUD',
    name: 'Task / Rating / Subscribe Monetization Fraud',
    category: 'TASK_FRAUD',
    weight: 35,
    description: 'Promises unrealistic pay for trivial tasks (liking YouTube videos, reviewing hotels) paired with activation deposits.',
    patterns: [
      /youtube\s*(?:video\s*)?like\s*(?:and|&)?\s*subscribe/i,
      /google\s*maps?\s*(?:5-star\s*)?(?:review|rating)/i,
      /per\s*like\s*(?:₹|rs)/i,
      /per\s*review\s*(?:₹|rs)/i,
      /vip\s*(?:task|level)\s*activation/i,
      /captcha\s*(?:entry|typing)/i,
      /यूट्यूब\s*वीडियो\s*लाइक/i, // Hindi
      /hotel\s*promo\s*ratings/i
    ]
  },

  // 6. Fake Govt Scheme / Freebies Trap
  FAKE_GOVT_SCHEME: {
    id: 'FAKE_GOVT_SCHEME',
    name: 'Fraudulent Government Scheme / Freebie Impersonation',
    category: 'GOVERNMENT_FRAUD',
    weight: 40,
    description: 'Prompts free laptops, unconditional scholarships, or DBT grants requiring an upfront portal/server charge.',
    patterns: [
      /(?:pm|prime\s*minister|pradhana\s*manthiri)\s*(?:free|ilavasa|yojana|laptop|scholarship)/i,
      /dbt\s*student\s*grant/i,
      /server\s*registration\s*fee/i,
      /courier\s*kattanam|server\s*charge/i,
      /മാർക്ക്\s*നിബന്ധനകളില്ല/i, // Malayalam: no marks condition
      /இலவச\s*மடிக்கணினி/i // Tamil: free laptop
    ]
  },

  // 7. Instant Student Credit / Advance Loan Fee
  INSTANT_LOAN_FEE: {
    id: 'INSTANT_LOAN_FEE',
    name: 'Instant Loan Upfront Processing Fee',
    category: 'LENDING_FRAUD',
    weight: 35,
    description: 'Promises instant loans with zero credit check while demanding advance NOC or file processing fees.',
    patterns: [
      /instant\s*(?:₹|rs\.?)?\s*[\d,]+\s*loan/i,
      /zero\s*cibil/i,
      /noc\s*(?:and|&)?\s*loan\s*approval\s*file\s*processing\s*fee/i,
      /disbursal\s*insurance\s*charge/i,
      /సిবিল\s*స్కోర్\s*అవసరం\s*లేదు/i // Telugu: no CIBIL score needed
    ]
  },

  // 8. Ponzi / Double Money Claims
  PONZI_DOUBLE_MONEY: {
    id: 'PONZI_DOUBLE_MONEY',
    name: 'Unrealistic Guaranteed Investment Returns / Doubler',
    category: 'FINANCIAL_FRAUD',
    weight: 45,
    description: 'Claims guaranteed 100%+ returns, trading bots, or doubling pocket money within 24 hours.',
    patterns: [
      /send\s*₹?[\d,]+\s*get\s*₹?[\d,]+/i,
      /\d+%\s*returns?\s*in\s*\d+\s*(?:hours|days)\s*guaranteed/i,
      /crypto\s*doubling\s*bot/i,
      /forex\s*(?:ai\s*)?student\s*(?:auto-trader|pool)/i,
      /daily\s*\d+%\s*(?:profit|dividend)/i,
      /100%\s*risk\s*free/i
    ]
  },

  // 9. Rental / PG Deposit Without Physical Visit
  RENTAL_PG_ADVANCE: {
    id: 'RENTAL_PG_ADVANCE',
    name: 'Rental / Hostel Advance Before Physical Visit',
    category: 'HOUSING_FRAUD',
    weight: 25,
    description: 'Pressures student to pay token deposit before inspecting the room.',
    patterns: [
      /token\s*advance\s*₹?[\d,]+\s*pay\s*panni\s*room\s*lock/i,
      /visit\s*karne\s*se\s*pehle\s*₹?[\d,]+\s*security\s*token/i,
      /token\s*before\s*visit/i,
      /advance\s*illana\s*vera\s*aaluku/i
    ]
  },

  // 10. Deep Link UPI Payment URI Scheme
  UPI_URI_PAYMENT_SCHEME: {
    id: 'UPI_URI_PAYMENT_SCHEME',
    name: 'Direct UPI URI Protocol Invocation',
    category: 'PAYMENT_PROTOCOL',
    weight: 30,
    description: 'Contains deep-linking upi:// protocol designed to trigger automatic UPI app payment flow.',
    patterns: [
      /upi:\/\/pay\?pa=[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,64}/i
    ]
  },

  // 11. Suspicious Domain / Shortener in Recruitment
  SUSPICIOUS_LINK: {
    id: 'SUSPICIOUS_LINK',
    name: 'Obfuscated Link or Shortener for Official Registration',
    category: 'PHISHING',
    weight: 20,
    description: 'Uses bit.ly, tinyurl, or suspicious TLDs (.top, .xyz, .tk) for official government or corporate opportunities.',
    patterns: [
      /bit\.ly\/[a-zA-Z0-9\-_]+/i,
      /tinyurl\.com\/[a-zA-Z0-9\-_]+/i,
      /https?:\/\/[a-zA-Z0-9\-_.]+\.(?:xyz|top|tk|club|loan|download)/i
    ]
  }
};

// Mitigation Rules (Anti-False-Positive Shield)
const MITIGATION_RULES = {
  VERIFIED_DOMAIN_ALLOWLIST: {
    id: 'MITIGATION_VERIFIED_DOMAIN',
    name: 'Verified Institutional / Employer Domain',
    reduction: 50,
    description: 'Originates from or officially cross-references a verified .gov.in, .edu.in, .ac.in, or verified employer domain.'
  },
  REGULATED_ESCROW: {
    id: 'MITIGATION_REGULATED_ESCROW',
    name: 'Regulated Escrow & No Direct Offline Payment Protection',
    reduction: 40,
    description: 'Uses platform escrow (e.g. Upwork, GitHub, university portal) and explicitly prohibits offline personal UPI.'
  },
  EXPLICIT_ANTI_FEE_DECLARATION: {
    id: 'MITIGATION_ANTI_FEE_DECLARATION',
    name: 'Explicit Anti-Fee Policy & Technical Criterion',
    reduction: 30,
    description: 'Explicitly emphasizes zero recruitment fee and adheres to official technical coding interview process.'
  },
  GOVERNMENT_REGISTRATION_ID: {
    id: 'MITIGATION_GOVT_REGISTRATION_ID',
    name: 'Niti Aayog NGO Darpan / Registered Trust Authentication',
    reduction: 35,
    description: 'Includes verifiable government registry ID (e.g., NGO Darpan, AICTE approval code).'
  }
};

class RulesEngine {
  constructor() {
    this.rules = RULES;
    this.mitigations = MITIGATION_RULES;
  }

  evaluate(text, context = {}) {
    const triggered = [];
    let grossScore = 0;
    const cleanText = text || '';

    // 1. Evaluate Heuristic Threat Rules
    for (const [key, rule] of Object.entries(this.rules)) {
      let isTriggered = false;
      let matchedSnippet = null;

      if (rule.patterns) {
        for (const pattern of rule.patterns) {
          const match = cleanText.match(pattern);
          if (match) {
            isTriggered = true;
            matchedSnippet = match[0];
            break;
          }
        }
      } else if (rule.check) {
        if (rule.check(cleanText, context)) {
          isTriggered = true;
          matchedSnippet = 'Contextual Brand Rule Triggered';
        }
      }

      if (isTriggered) {
        triggered.push({
          rule_id: rule.id,
          name: rule.name,
          category: rule.category,
          weight: rule.weight,
          description: rule.description,
          snippet: matchedSnippet
        });
        grossScore += rule.weight;
      }
    }

    // 2. Evaluate Mitigations (Prevents False Positives on Genuine Opportunities)
    const appliedMitigations = [];
    let mitigationReduction = 0;

    // Check Verified Domain
    if (context.is_verified_source || (context.domain && this.isKnownTrustedDomain(context.domain))) {
      appliedMitigations.push({
        mitigation_id: this.mitigations.VERIFIED_DOMAIN_ALLOWLIST.id,
        name: this.mitigations.VERIFIED_DOMAIN_ALLOWLIST.name,
        reduction: this.mitigations.VERIFIED_DOMAIN_ALLOWLIST.reduction,
        reason: `Matched verified domain authority: ${context.domain || 'verified source'}`
      });
      mitigationReduction += this.mitigations.VERIFIED_DOMAIN_ALLOWLIST.reduction;
    }

    // Check Regulated Escrow / Official Portal Mention
    if (/escrow|upwork\.com|official\s*university\s*portal|\.edu\.in|\.ac\.in/i.test(cleanText)) {
      appliedMitigations.push({
        mitigation_id: this.mitigations.REGULATED_ESCROW.id,
        name: this.mitigations.REGULATED_ESCROW.name,
        reduction: this.mitigations.REGULATED_ESCROW.reduction,
        reason: 'Protected by regulated contract escrow or institutional payment gateway'
      });
      mitigationReduction += this.mitigations.REGULATED_ESCROW.reduction;
    }

    // Check Explicit Zero Fee Declaration
    if (/never\s*charge\s*any\s*fee|strictly\s*no\s*(?:cash|personal\s*upi)|no\s*application\s*fee|zero\s*fee/i.test(cleanText)) {
      appliedMitigations.push({
        mitigation_id: this.mitigations.EXPLICIT_ANTI_FEE_DECLARATION.id,
        name: this.mitigations.EXPLICIT_ANTI_FEE_DECLARATION.name,
        reduction: this.mitigations.EXPLICIT_ANTI_FEE_DECLARATION.reduction,
        reason: 'Explicitly adheres to zero-fee student protection ethics'
      });
      mitigationReduction += this.mitigations.EXPLICIT_ANTI_FEE_DECLARATION.reduction;
    }

    // Check Verifiable Govt ID / NGO Darpan ID
    if (/ngo\s*darpan|niti\s*aayog|aicte-india\.org|aicte\s*approved/i.test(cleanText)) {
      appliedMitigations.push({
        mitigation_id: this.mitigations.GOVERNMENT_REGISTRATION_ID.id,
        name: this.mitigations.GOVERNMENT_REGISTRATION_ID.name,
        reduction: this.mitigations.GOVERNMENT_REGISTRATION_ID.reduction,
        reason: 'Authenticated by statutory registry reference'
      });
      mitigationReduction += this.mitigations.GOVERNMENT_REGISTRATION_ID.reduction;
    }

    // Calculate net score capped between 0 and 100
    const netScore = Math.max(0, Math.min(100, grossScore - mitigationReduction));

    return {
      triggered_rules: triggered,
      gross_score: grossScore,
      applied_mitigations: appliedMitigations,
      mitigation_reduction: mitigationReduction,
      net_rule_score: netScore
    };
  }

  isKnownTrustedDomain(domain) {
    if (!domain) return false;
    const trustedDomains = [
      'careers.google.com',
      'tcs.com',
      'infosys.com',
      'ncs.gov.in',
      'internship.aicte-india.org',
      'education.gov.in',
      'respark.iitm.ac.in',
      'scholarships.gov.in',
      'isro.gov.in',
      'education.github.com',
      'studentambassadors.windows.com',
      'rbi.org.in',
      'cybercrime.gov.in',
      'futureskillsprime.in',
      'naanmudhalvan.tn.gov.in'
    ];
    return trustedDomains.some(td => domain.includes(td));
  }
}

const rulesEngine = new RulesEngine();

module.exports = {
  RULES,
  MITIGATION_RULES,
  RulesEngine,
  rulesEngine
};
