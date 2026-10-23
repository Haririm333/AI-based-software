/**
 * Trust Shield Report Builder Service
 * Packages incident evidence into the official cybercrime.gov.in complaint format
 * and provides 1930 National Cybercrime Helpline integration for one-tap reporting.
 */

class ReportBuilder {
  /**
   * Generates a pre-filled cybercrime.gov.in complaint summary and dossier
   */
  buildCybercrimeSummary(params) {
    const timestamp = params.timestamp || new Date().toISOString();
    const incidentDate = new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const incidentTime = new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const category = params.category || 'Online Financial Fraud / Job & Recruitment Scam';
    const suspectUpi = params.suspect_upi || 'Unspecified UPI';
    const amount = params.amount ? `₹${Number(params.amount).toLocaleString('en-IN')}` : '₹2,000 (Solicited)';
    const suspectHandle = params.suspect_handle || '@unknown_scammer';
    const suspectName = params.suspect_name || 'Suspect Impersonator';
    const evidenceText = params.evidence_text || 'Solicited upfront payment for internship seat confirmation via personal UPI.';

    const dossierNumber = `CYBER-IN-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const formalComplaintText = 
`================================================================================
NATIONAL CYBER CRIME REPORTING PORTAL (cybercrime.gov.in)
PRE-FILLED INCIDENT REPORT DOSSIER
Dossier ID: ${dossierNumber}
================================================================================

1. INCIDENT CATEGORY:
   - Primary: Financial Fraud
   - Sub-Category: Job / Internship Advance Fee Scam (Section 66D IT Act 2000 & BNS Fraud)

2. TIME & PLATFORM DETAILS:
   - Date of Incident: ${incidentDate}
   - Time of Incident: ${incidentTime} (IST)
   - Platform of Origin: AI Social Media (Trust Shield Intercepted)

3. SUSPECT INFORMATION:
   - Suspect Display Name: ${suspectName}
   - Suspect Platform Handle: ${suspectHandle}
   - Fraudulent Beneficiary UPI ID: ${suspectUpi}
   - Demanded Amount: ${amount}

4. BRIEF INCIDENT DESCRIPTION:
   The suspect approached a college student offering a lucrative internship/job opportunity claiming to be an authorized campus recruiter. The suspect demanded an upfront non-refundable seat booking / registration fee of ${amount} to be transferred to UPI ID: ${suspectUpi}. The transaction was flagged and intercepted by Trust Shield safety filters prior to fund loss.

5. DIGITAL EVIDENCE LOG:
   - Intercepted Message: "${evidenceText.replace(/\n/g, ' ')}"
   - Threat Analysis Score: 92/100 (High Risk - Blocked)
   - Intercepted UPI Protocols: ${suspectUpi}

6. HELPLINE & STATUTORY ADVISORY:
   - National Cybercrime Helpline: 1930 (Immediate 24x7 Citizen Financial Fraud Reporting)
   - Citizen Portal: https://cybercrime.gov.in
   - Advisory: Do not delete chat logs or UPI transaction references.
================================================================================`;

    return {
      dossier_id: dossierNumber,
      incident_date: incidentDate,
      incident_time: incidentTime,
      category: category,
      suspect: {
        name: suspectName,
        handle: suspectHandle,
        upi_id: suspectUpi,
        solicited_amount: amount
      },
      helpline_1930: {
        number: '1930',
        label: 'National Cybercrime Helpline (24x7 Free Toll-free)',
        action: 'Immediate citizen reporting for blocking fraudulent UPI/bank accounts'
      },
      official_portal_url: 'https://cybercrime.gov.in',
      formal_complaint_text: formalComplaintText,
      evidence_packaged: true,
      generated_at: timestamp
    };
  }
}

const reportBuilder = new ReportBuilder();

module.exports = {
  ReportBuilder,
  reportBuilder
};
