/**
 * Trust Shield Payment Guard Service
 * Real-time payment-moment interceptor and UPI regex engine.
 * Handles UPI edge cases (case-insensitivity, dots, dashes, numeric VPAs, upi:// URI protocols),
 * and detects multilingual coercion/pressure phrases across Tamil, Hindi, Telugu, Malayalam, and English.
 */

// Comprehensive UPI VPA regex covering Indian PSPs and banks
// Matches formats: alphanumeric, dots, dashes, underscores, followed by '@' and bank handle
const UPI_HANDLE_REGEX = /\b([a-zA-Z0-9.\-_]{2,64}@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|apl|axl|ibl|barodampay|kotak|sbi|icici|axisbank|fbl|federal|indus|hdfcbank|federalbank|upi))\b/gi;

// Deep-link UPI URI protocol regex
const UPI_URI_REGEX = /upi:\/\/pay\?[a-zA-Z0-9.\-_=&%@]+/gi;

// Regex for extracting currency amounts in INR (₹, Rs., INR)
const AMOUNT_REGEX = /(?:₹|rs\.?|inr)\s*([\d,]+)/i;

// Multilingual payment coercion phrases
const MULTILINGUAL_PAYMENT_PHRASES = [
  // English / Universal
  { lang: 'en', pattern: /(?:pay|send|transfer|deposit)\s*(?:₹|rs\.?|inr)?\s*[\d,]+/i, label: 'Payment solicitation' },
  { lang: 'en', pattern: /(?:confirm|book|reserve)\s*(?:your\s*)?(?:seat|badge|offer|slot)/i, label: 'Seat confirmation fee pressure' },
  { lang: 'en', pattern: /laptop\s*(?:courier|insurance|security\s*deposit)/i, label: 'Equipment deposit demand' },
  { lang: 'en', pattern: /only\s*\d+\s*(?:mins|minutes|seats?\s*left)/i, label: 'Urgency coercion' },

  // Tamil / Tanglish
  { lang: 'ta', pattern: /பணம்\s*(?:செலுத்துங்கள்|அனுப்புங்கள்|கட்டவும்)/i, label: 'Tamil: Payment demand' },
  { lang: 'ta', pattern: /(?:கட்டணம்|முன்பணம்)\s*(?:செலுத்த|கேட்க)/i, label: 'Tamil: Advance fee demand' },
  { lang: 'ta', pattern: /seat\s*confirm\s*panna\s*(?:₹|rs)?\s*[\d,]+/i, label: 'Tanglish: Seat confirmation payment' },
  { lang: 'ta', pattern: /advance\s*pay\s*panni\s*room\s*lock/i, label: 'Tanglish: Rental deposit lock' },
  { lang: 'ta', pattern: /fee\s*pay\s*pannanum/i, label: 'Tanglish: Mandatory fee requirement' },

  // Hindi / Hinglish
  { lang: 'hi', pattern: /पैसे\s*(?:भेजें|ट्रांसफर\s*करें|जमा\s*करें)/i, label: 'Hindi: Money transfer request' },
  { lang: 'hi', pattern: /सिक्योरिटी\s*(?:चार्ज|डिपॉजिट)\s*पे\s*करें/i, label: 'Hindi: Security charge demand' },
  { lang: 'hi', pattern: /security\s*deposit\s*dena\s*hoga/i, label: 'Hinglish: Mandatory security deposit' },
  { lang: 'hi', pattern: /turant\s*pay\s*karo|jald\s*karein/i, label: 'Hinglish: Immediate payment pressure' },
  { lang: 'hi', pattern: /advance\s*token\s*pay\s*karo/i, label: 'Hinglish: Token advance' },

  // Telugu / Telglish
  { lang: 'te', pattern: /డబ్బులు\s*(?:పంపండి|చెల్లించండి)/i, label: 'Telugu: Money transfer request' },
  { lang: 'te', pattern: /పోర్టల్\s*ఫీజు|ప్రాసెసింగ్\s*ఫీజు/i, label: 'Telugu: Portal/Processing fee' },
  { lang: 'te', pattern: /portal\s*fee\s*pay\s*cheyandi/i, label: 'Telglish: Pay portal fee' },
  { lang: 'te', pattern: /advance\s*token\s*pay\s*cheyandi/i, label: 'Telglish: Token advance' },

  // Malayalam / Manglish
  { lang: 'ml', pattern: /പണം\s*(?:അയക്കുക|നൽകുക)/i, label: 'Malayalam: Send money' },
  { lang: 'ml', pattern: /രജിസ്ട്രേഷൻ\s*ഫീസ്/i, label: 'Malayalam: Registration fee demand' },
  { lang: 'ml', pattern: /deposit\s*cheythal\s*daily\s*profit/i, label: 'Manglish: Deposit for daily profit' }
];

class PaymentGuard {
  constructor() {
    this.upiHandleRegex = UPI_HANDLE_REGEX;
    this.upiUriRegex = UPI_URI_REGEX;
  }

  /**
   * Evaluates a chat message or text snippet for payment interception moments.
   */
  inspectMessage(messageText, context = {}) {
    if (!messageText) {
      return {
        is_payment_moment: false,
        detected_upis: [],
        detected_uris: [],
        coercion_signals: []
      };
    }

    const text = messageText.toString();

    // 1. Extract UPI IDs
    const detectedUpis = this.extractUpiIds(text);

    // 2. Extract UPI URIs
    const detectedUris = this.extractUpiUris(text);

    // 3. Extract Amount
    const amountMatch = text.match(AMOUNT_REGEX);
    const amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, ''), 10) : null;

    // 4. Detect Multilingual Coercion Phrases
    const coercionSignals = [];
    for (const phrase of MULTILINGUAL_PAYMENT_PHRASES) {
      if (phrase.pattern.test(text)) {
        coercionSignals.push({
          lang: phrase.lang,
          label: phrase.label
        });
      }
    }

    // 5. Determine if this constitutes a "Payment Moment" intercept
    const hasUpi = detectedUpis.length > 0 || detectedUris.length > 0;
    const hasCoercion = coercionSignals.length > 0;
    const isPaymentMoment = hasUpi || (hasCoercion && amount !== null);

    // Calculate Payment Risk Score (0-100)
    let paymentRiskScore = 0;
    if (hasUpi) paymentRiskScore += 50;
    if (detectedUris.length > 0) paymentRiskScore += 20;
    if (amount) paymentRiskScore += 15;
    if (coercionSignals.length > 0) paymentRiskScore += Math.min(25, coercionSignals.length * 10);

    paymentRiskScore = Math.min(100, paymentRiskScore);

    // Generate Warning Modal Data for the frontend UI
    const warningModalData = isPaymentMoment ? {
      title: '🚨 Payment-Moment Intercepted by Trust Shield',
      urgency: paymentRiskScore >= 70 ? 'CRITICAL' : 'WARNING',
      risk_score: Math.max(88, paymentRiskScore),
      intercepted_upi: detectedUpis[0] || (detectedUris[0] ? 'Deep Link Payment URI' : 'Direct Cash Demand'),
      amount_requested: amount ? `₹${amount.toLocaleString()}` : 'Unspecified Amount',
      reasons: [
        'An individual is soliciting direct money transfer via UPI inside a direct message.',
        'Legitimate employers and official companies NEVER ask candidates to pay for offer letters or laptop deposits.',
        'UPI transactions are immediate and irreversible once PIN is entered.'
      ],
      safety_checklist: [
        '❌ Never pay money to confirm an internship, test, or interview.',
        '❌ Do not send money to personal UPI handles ending in @okaxis, @okhdfcbank, @paytm, or @ybl.',
        '✅ Verify official vacancies only at careers.company.com or ncs.gov.in.'
      ],
      helpline: '1930',
      action_recommendation: 'Tap One-Tap Report to package evidence and dispatch to Cybercrime.'
    } : null;

    return {
      is_payment_moment: isPaymentMoment,
      detected_upis: detectedUpis,
      detected_uris: detectedUris,
      amount: amount,
      coercion_signals: coercionSignals,
      payment_risk_score: paymentRiskScore,
      warning_modal_data: warningModalData
    };
  }

  /**
   * Robust UPI ID extractor handling case-insensitivity, trailing punctuation, and special characters
   */
  extractUpiIds(text) {
    if (!text) return [];
    const matches = [];
    // Reset regex index
    this.upiHandleRegex.lastIndex = 0;
    let match;
    while ((match = this.upiHandleRegex.exec(text)) !== null) {
      const cleanUpi = match[1].trim().toLowerCase();
      if (!matches.includes(cleanUpi)) {
        matches.push(cleanUpi);
      }
    }
    return matches;
  }

  /**
   * Extracts UPI URIs (upi://pay?...)
   */
  extractUpiUris(text) {
    if (!text) return [];
    const matches = [];
    this.upiUriRegex.lastIndex = 0;
    let match;
    while ((match = this.upiUriRegex.exec(text)) !== null) {
      const uri = match[0].trim();
      if (!matches.includes(uri)) {
        matches.push(uri);
      }
    }
    return matches;
  }
}

const paymentGuard = new PaymentGuard();

module.exports = {
  UPI_HANDLE_REGEX,
  UPI_URI_REGEX,
  MULTILINGUAL_PAYMENT_PHRASES,
  PaymentGuard,
  paymentGuard
};
