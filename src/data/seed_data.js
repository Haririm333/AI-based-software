/**
 * Trust Shield Seed Data
 * Contains comprehensive multilingual scam examples, false-positive test cases (genuine opportunities),
 * payment intercept chats, trusted source registries, and viral money rumors.
 */

const SCAM_CATEGORIES = {
  JOB_INTERNSHIP_FEE: 'job_internship_fee',
  TASK_RATING_FRAUD: 'task_rating_fraud',
  SCHOLARSHIP_GOVT_GRANT: 'scholarship_govt_grant',
  STUDENT_LOAN_FEE: 'student_loan_fee',
  CRYPTO_PONZI_DOUBLE: 'crypto_ponzi_double',
  EVENT_PASS_IMPERSONATION: 'event_pass_impersonation',
  RENTAL_PG_ADVANCE: 'rental_pg_advance'
};

const SCAMS = [
  // Category 1: Job / Internship Fee (Scam 1 & 2)
  {
    id: 'scam-01',
    category: SCAM_CATEGORIES.JOB_INTERNSHIP_FEE,
    title: 'Google Summer Internship 2026 - Direct Offer Letter',
    language: 'Tamil / Tanglish',
    language_code: 'ta',
    author: 'Google HR Campus Recruiter (Fake)',
    author_handle: '@google_recruitment_chennai',
    posted_at: '10 mins ago',
    content: 'Google internship, pay ₹2,000 to confirm your seat. Google India campus direct intake for 2nd/3rd year engineering students. Stipend ₹85,000/month. Offer letter confirm panna ₹2,000 seat booking fee pay pannanum. Seat confirm aanathum idhu 100% refundable. Send payment to google.hr.recruitment@okicici immediately. Only 4 slots left!',
    upi_ids: ['google.hr.recruitment@okicici'],
    fee_requested: 2000,
    currency: 'INR',
    suspicious_triggers: ['fee_for_job', 'brand_impersonation', 'personal_upi', 'artificial_urgency', 'refund_promise'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },
  {
    id: 'scam-02',
    category: SCAM_CATEGORIES.JOB_INTERNSHIP_FEE,
    title: 'Wipro Technologies - Work From Home Onboarding Laptop Deposit',
    language: 'English / Hinglish',
    language_code: 'hi-en',
    author: 'Wipro HR Onboarding Team',
    author_handle: '@wipro_career_desk',
    posted_at: '25 mins ago',
    content: 'Congratulations candidates! You have been selected for Wipro remote data analyst role. Monthly salary ₹38,000. Company will courier brand new Dell laptop and monitor. Lekin courier dispatch se pehle ₹3,500 security deposit dena hoga which will be refunded in your first salary slip. Transfer via GPay to wipro.onboarding.dispatch@ybl today by 5 PM.',
    upi_ids: ['wipro.onboarding.dispatch@ybl'],
    fee_requested: 3500,
    currency: 'INR',
    suspicious_triggers: ['fee_for_job', 'laptop_courier_fee', 'brand_impersonation', 'personal_upi'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },

  // Category 2: Task / Rating Fraud (Scam 3 & 4)
  {
    id: 'scam-03',
    category: SCAM_CATEGORIES.TASK_RATING_FRAUD,
    title: 'YouTube Video Like & Subscribe Daily Payout ₹1,500 - ₹3,000',
    language: 'Hindi',
    language_code: 'hi',
    author: 'Digital Media Task Hub',
    author_handle: '@daily_youtube_earning',
    posted_at: '1 hour ago',
    content: 'घर बैठे मोबाइल से पैसे कमाए! केवल यूट्यूब वीडियो लाइक और सब्सक्राइब करने पर प्रत्येक लाइक के ₹150 मिलेंगे। दिन के ₹3,000 तक आसानी से कमाएं। वीआईपी टास्क एक्टिवेशन के लिए सिर्फ ₹500 का सिक्योरिटी चार्ज पे करें: task.manager99@paytm पर। पेमेंट स्क्रीनशॉट भेजते ही टास्क आईडी चालू हो जाएगी।',
    upi_ids: ['task.manager99@paytm'],
    fee_requested: 500,
    currency: 'INR',
    suspicious_triggers: ['unrealistic_earnings', 'vip_task_deposit', 'telegram_task_scam'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },
  {
    id: 'scam-04',
    category: SCAM_CATEGORIES.TASK_RATING_FRAUD,
    title: 'Google Maps 5-Star Rating Part-Time Job for College Students',
    language: 'Telugu / Telglish',
    language_code: 'te',
    author: 'Hotel Promo Ratings Ltd',
    author_handle: '@hyderabad_ratings_parttime',
    posted_at: '2 hours ago',
    content: 'College students ki part-time earning chance! Just Google Maps lo hotels ki 5-star review ivvandi, per review ₹200 instant Google Pay. Daily 15 reviews cheyyachu. Modata mi wallet register chesukodaniki ₹499 portal fee pay cheyandi: maps.rating.corp@axisbank. Daily income direct mi account ki transfer avtundi.',
    upi_ids: ['maps.rating.corp@axisbank'],
    fee_requested: 499,
    currency: 'INR',
    suspicious_triggers: ['fake_review_fraud', 'portal_fee', 'unrealistic_earnings'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },

  // Category 3: Scholarship / Govt Grant Scheme (Scam 5 & 6)
  {
    id: 'scam-05',
    category: SCAM_CATEGORIES.SCHOLARSHIP_GOVT_GRANT,
    title: 'Central National Higher Education Scholarship 2026 ₹75,000',
    language: 'Malayalam',
    language_code: 'ml',
    author: 'National Scholarship Disbursal Office',
    author_handle: '@kerala_scholarship_portal',
    posted_at: '3 hours ago',
    content: 'എല്ലാ ഡിഗ്രി/എഞ്ചിനീയറിംഗ് വിദ്യാർത്ഥികൾക്കും കേന്ദ്ര ഗവൺമെന്റ് ₹75,000 സ്കോളർഷിപ്പ് അനുവദിച്ചിരിക്കുന്നു. മാർക്ക് നിബന്ധനകളില്ല. നേരിട്ട് ബാങ്ക് അക്കൗണ്ടിലേക്ക് പണം ലഭിക്കാൻ സർവർ രജിസ്ട്രേഷൻ ഫീസ് ₹750 scholarship.desk@oksbi എന്ന യുപിഐ ഐഡിയിലേക്ക് അയക്കുക. രസീത് നമ്പർ ടെലിഗ്രാമിൽ അയച്ചാൽ 24 മണിക്കൂറിനകം തുക ക്രെഡിറ്റാകും.',
    upi_ids: ['scholarship.desk@oksbi'],
    fee_requested: 750,
    currency: 'INR',
    suspicious_triggers: ['fake_govt_scheme', 'no_qualification_promise', 'server_activation_fee', 'personal_upi'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },
  {
    id: 'scam-06',
    category: SCAM_CATEGORIES.SCHOLARSHIP_GOVT_GRANT,
    title: 'PM Vidya Digital Device Grant - Free Laptop Delivery',
    language: 'Tamil / English',
    language_code: 'ta',
    author: 'PM Digital India Cell (Fake)',
    author_handle: '@pm_free_laptop_tn',
    posted_at: '4 hours ago',
    content: 'பிரധാന மந்திரி இலவச மடிக்கணினி திட்டம் 2026. கல்லூரி மாணவர்களுக்கு HP i5 லேப்டாப் இலவசமாக வழங்கப்படுகிறது. அரசாங்க போர்டல் சர்வீஸ் மற்றும் கூரியர் கட்டணம் ₹999 செலுத்த வேண்டும். Send to pm.vidya.grant@sbi. Last date today! கிளிக் செய்து விண்ணப்பிக்கவும்.',
    upi_ids: ['pm.vidya.grant@sbi'],
    fee_requested: 999,
    currency: 'INR',
    suspicious_triggers: ['govt_impersonation', 'delivery_fee_scam', 'artificial_deadline'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },

  // Category 4: Student Loan / Instant Campus Credit Fee (Scam 7 & 8)
  {
    id: 'scam-07',
    category: SCAM_CATEGORIES.STUDENT_LOAN_FEE,
    title: 'Instant ₹50,000 Student Loan - Zero CIBIL, Zero Interest for 1 Year',
    language: 'Telugu / Telglish',
    language_code: 'te',
    author: 'EduCredit Campus Finance',
    author_handle: '@campus_fast_loans',
    posted_at: '5 hours ago',
    content: 'Exam fees or college semester fee payment problem ah? Instant ₹50,000 loan approved in 5 minutes without any documents or income proof. NOC and loan approval file processing fee ₹999 mathrame. Pay to educredit.verify@icici quickly. Amount will be credited to your phonepe instantly.',
    upi_ids: ['educredit.verify@icici'],
    fee_requested: 999,
    currency: 'INR',
    suspicious_triggers: ['advance_fee_loan', 'no_credit_check_lie', 'urgent_processing_fee'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },
  {
    id: 'scam-08',
    category: SCAM_CATEGORIES.STUDENT_LOAN_FEE,
    title: 'Quick Campus Emergency Cash Assistance ₹25,000',
    language: 'Hindi',
    language_code: 'hi',
    author: 'Student Cash Assistance Group',
    author_handle: '@fast_student_rupee',
    posted_at: '6 hours ago',
    content: 'छात्रों के लिए तत्काल बिना ब्याज ₹25,000 की वित्तीय सहायता। कोई सिबिल स्कोर जरूरी नहीं। केवल कॉलेज आईडी कार्ड भेजें। फाइल डिस्बर्सल इंश्योरेंस चार्ज ₹499 तुरंत pay करें student.fund.verify@kotak पर। 10 मिनट में पैसा आपके बैंक खाते में।',
    upi_ids: ['student.fund.verify@kotak'],
    fee_requested: 499,
    currency: 'INR',
    suspicious_triggers: ['advance_fee_loan', 'unregulated_lending', 'upfront_insurance_charge'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },

  // Category 5: Crypto / Double Money Ponzi (Scam 9 & 10)
  {
    id: 'scam-09',
    category: SCAM_CATEGORIES.CRYPTO_PONZI_DOUBLE,
    title: 'Student Crypto Doubling Bot - 200% Returns in 24 Hours Guaranteed',
    language: 'English',
    language_code: 'en',
    author: 'Crypto Campus Wealth Club',
    author_handle: '@crypto_student_signals',
    posted_at: '7 hours ago',
    content: 'Multiply your pocket money! Send ₹1,000 get ₹2,500; send ₹5,000 get ₹12,000 within 24 hours using AI algorithmic arbitrage flash loans. 100% risk free SEBI-compliant algorithm. Deposit your starting principal to trading.bot.pool@okaxis. Over 1,200 students already profited this week!',
    upi_ids: ['trading.bot.pool@okaxis'],
    fee_requested: 1000,
    currency: 'INR',
    suspicious_triggers: ['guaranteed_returns', 'ponzi_multiplier', 'fake_compliance_claim'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },
  {
    id: 'scam-10',
    category: SCAM_CATEGORIES.CRYPTO_PONZI_DOUBLE,
    title: 'Forex AI Student Auto-Trader Pool - Daily 20% Dividend',
    language: 'Malayalam / Manglish',
    language_code: 'ml',
    author: 'Kerala Forex Student Hub',
    author_handle: '@forex_malayalam_profits',
    posted_at: '8 hours ago',
    content: 'College padikkumbol thanne lakshangal sampadhikkam. Nammude automated Forex trading botil invest cheyyu. Minimum ₹2,000 deposit cheythal daily ₹400 profit garanti. Send your stake to forex.pool.kerala@federalbank and join our private VIP Telegram group for withdrawal proofs.',
    upi_ids: ['forex.pool.kerala@federalbank'],
    fee_requested: 2000,
    currency: 'INR',
    suspicious_triggers: ['guaranteed_forex_profit', 'telegram_vip_trap', 'unlicensed_investment'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },

  // Category 6: Event / Hackathon Pass Impersonation (Scam 11 & 12)
  {
    id: 'scam-11',
    category: SCAM_CATEGORIES.EVENT_PASS_IMPERSONATION,
    title: 'IIT TechFest 2026 - Exclusive Student Delegate VIP Pass',
    language: 'Tanglish / Tamil',
    language_code: 'ta-en',
    author: 'TechFest Organizing Secretariate (Unofficial)',
    author_handle: '@iit_techfest_passes_unofficial',
    posted_at: '9 hours ago',
    content: 'IIT Techfest official registrations closed? Don\'t worry friends! Few VIP student delegate kits and backstage passes available. Free food coupons + hackathon entry + celebrity night pass. Seat kit fee ₹1,500 only. Transfer to fest.organizer.desk@okaxis immediately to reserve slot.',
    upi_ids: ['fest.organizer.desk@okaxis'],
    fee_requested: 1500,
    currency: 'INR',
    suspicious_triggers: ['unofficial_pass_resale', 'personal_upi_for_fest', 'artificial_urgency'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },
  {
    id: 'scam-12',
    category: SCAM_CATEGORIES.EVENT_PASS_IMPERSONATION,
    title: 'National AI Hackathon Grand Finale Shortlisted Seat Fee',
    language: 'English',
    language_code: 'en',
    author: 'National AI Summit Committee',
    author_handle: '@national_ai_summit_desk',
    posted_at: '10 hours ago',
    content: 'Congratulations team! Your project has been wild-card shortlisted for the National AI Hackathon Grand Finale in New Delhi (Prize Pool ₹10 Lakhs). To confirm your team table and hotel stay, pay the mandatory kit and badge clearance fee of ₹1,800 to hackathon.grand.finale@ybl within 3 hours or seat passes to next team.',
    upi_ids: ['hackathon.grand.finale@ybl'],
    fee_requested: 1800,
    currency: 'INR',
    suspicious_triggers: ['wildcard_shortlist_trap', 'mandatory_badge_fee', 'aggressive_deadline'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },

  // Category 7: Rental / PG Advance Deposit Scam (Scam 13 & 14)
  {
    id: 'scam-13',
    category: SCAM_CATEGORIES.RENTAL_PG_ADVANCE,
    title: 'Chennai OMR / Guindy AC Single Room Student PG - Instant Booking',
    language: 'Tamil / English',
    language_code: 'ta',
    author: 'OMR Luxury Student Hostels',
    author_handle: '@chennai_pg_rooms_omr',
    posted_at: '12 hours ago',
    content: 'College student luxury AC single room available near TIDEL Park / Guindy. Rent just ₹4,500/month with WiFi and 3 times food. Room paaka vara mudiyala na kooda token advance ₹2,500 pay panni room lock pannikalam: landlord.pg.chennai@okhdfcbank. Advance illana vera aaluku kuduthuduvom.',
    upi_ids: ['landlord.pg.chennai@okhdfcbank'],
    fee_requested: 2500,
    currency: 'INR',
    suspicious_triggers: ['unrealistic_rent_claim', 'advance_before_visit', 'lock_in_pressure'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  },
  {
    id: 'scam-14',
    category: SCAM_CATEGORIES.RENTAL_PG_ADVANCE,
    title: 'Bangalore Electronic City Student Co-Living - Advance Token',
    language: 'Hindi / English',
    language_code: 'hi-en',
    author: 'Bangalore Tech Stay Rooms',
    author_handle: '@blr_student_stays',
    posted_at: '14 hours ago',
    content: 'Bangalore college students attention! Furnished single room with AC and washing machine near Electronic City only ₹5,000 per month. Demand bahut high hai, visit karne se pehle ₹3,000 security token pay karo via UPI bng.stays.token@icici. If you don\'t like room during visit, token will be refunded in cash immediately.',
    upi_ids: ['bng.stays.token@icici'],
    fee_requested: 3000,
    currency: 'INR',
    suspicious_triggers: ['token_before_visit', 'pressure_tactic', 'fake_cash_refund_promise'],
    expected_risk_band: 'RED',
    ground_truth: 'SCAM'
  }
];

// 8 Genuine Opportunity Posts (Slightly suspicious at first glance, but verified & legitimate)
// Used to rigorously test and demonstrate FALSE POSITIVE prevention
const GENUINE_OPPORTUNITIES = [
  {
    id: 'gen-01',
    title: 'Open Source Mentorship Program - ₹15,000 Monthly Stipend',
    language: 'English',
    language_code: 'en',
    author: 'Julia Computing Open Research',
    author_handle: '@juliacomputing_careers',
    verified_source: true,
    domain: 'careers.google.com', // linked ecosystem
    posted_at: '1 hour ago',
    content: 'We are accepting student contributors for the 2026 Julia Open Source Fellowship! Selected mentees will work 15 hrs/week under mentor guidance and receive a monthly stipend of ₹15,000 for 3 months. No application fee. Submit your GitHub profile and code sample at https://juliacomputing.com/fellowship2026. Official announcement on verified blog.',
    reasons_it_looks_suspicious: ['Mentions stipend money', 'Remote work commitment'],
    reasons_it_is_legitimate: ['Zero upfront fees requested', 'Official corporate domain', 'Clear technical criteria', 'No personal UPI request'],
    expected_risk_band: 'GREEN',
    ground_truth: 'GENUINE'
  },
  {
    id: 'gen-02',
    title: 'Smart India Hackathon 2026 - College Logistics & Telegram Bus Group',
    language: 'English',
    language_code: 'en',
    author: 'Anna University Innovation Council',
    author_handle: '@anna_univ_hackathon',
    verified_source: true,
    domain: 'internship.aicte-india.org',
    posted_at: '2 hours ago',
    content: 'Attention all Anna University teams shortlisted for SIH 2026 Grand Finale! Please join our student transportation and logistics Telegram group at t.me/anna_univ_sih_logistics for bus departure timings, ID card badges, and nodal center coordination. Official notification signed by Dean Students Welfare is pinned on aucev.edu.in portal.',
    reasons_it_looks_suspicious: ['Asks students to join a Telegram group'],
    reasons_it_is_legitimate: ['Official university domain verification', 'No money or bank transfers', 'Coordinating travel for pre-registered teams'],
    expected_risk_band: 'GREEN',
    ground_truth: 'GENUINE'
  },
  {
    id: 'gen-03',
    title: 'Hands-on IoT & Drone Hardware Workshop - Nominal Kit Fee ₹150',
    language: 'Tamil / English',
    language_code: 'ta',
    author: 'MIT Campus Robotics Club',
    author_handle: '@mit_robotics_club',
    verified_source: true,
    domain: 'respark.iitm.ac.in',
    posted_at: '3 hours ago',
    content: 'MIT Robotics Club organizes a 2-day hands-on Arduino and Drone building workshop for engineering students. Workshop includes take-home sensor kit. Nominal component cost ₹150 payable strictly on our official university portal at https://mitindia.edu/events/iot2026. Strictly no cash or personal UPI. Certificate signed by HOD.',
    reasons_it_looks_suspicious: ['Asks for ₹150 kit fee'],
    reasons_it_is_legitimate: ['Uses verified .edu.in payment portal', 'Strict warning against personal UPI', 'Low cost backed by official college club'],
    expected_risk_band: 'GREEN',
    ground_truth: 'GENUINE'
  },
  {
    id: 'gen-04',
    title: 'Research Assistantship in AI/NLP - Prof. Sharma, IIT Delhi',
    language: 'English',
    language_code: 'en',
    author: 'Dept of Computer Science, IIT Delhi',
    author_handle: '@iitd_nlp_lab',
    verified_source: true,
    domain: 'education.gov.in',
    posted_at: '5 hours ago',
    content: 'Undergraduate Research Assistant position available in NLP Speech translation project under Prof. A. Sharma. Stipend ₹12,000/month sponsored by SERB. Please fill out the official institutional Google Form (linked with iitd.ac.in email requirement) at forms.gle/iitd_nlp_2026 with your transcript. Application deadline: 10th Nov.',
    reasons_it_looks_suspicious: ['Uses a Google Form link', 'Mentions monthly stipend'],
    reasons_it_is_legitimate: ['Restricted to institutional domain', 'Official faculty lab page cross-referenced', 'Zero application fee'],
    expected_risk_band: 'GREEN',
    ground_truth: 'GENUINE'
  },
  {
    id: 'gen-05',
    title: 'Junior Frontend UI/UX Internship (Next.js / React) - FinScale',
    language: 'English',
    language_code: 'en',
    author: 'FinScale Technologies Pvt Ltd',
    author_handle: '@finscale_tech',
    verified_source: true,
    domain: 'futureskillsprime.in',
    posted_at: '6 hours ago',
    content: 'FinScale (Bengaluru-based Y-Combinator alumni fintech) is hiring 2 Frontend Interns. Stipend ₹20,000/month. You will build user analytics dashboards. To apply, email your portfolio and GitHub links to careers@finscale.in. We never charge any fee at any stage of our interview process. Interview is 100% technical coding round.',
    reasons_it_looks_suspicious: ['High stipend for college students', 'Startup entity'],
    reasons_it_is_legitimate: ['Corporate domain email (@finscale.in)', 'Explicit anti-fee declaration', 'Verified employer registry'],
    expected_risk_band: 'GREEN',
    ground_truth: 'GENUINE'
  },
  {
    id: 'gen-06',
    title: 'GitHub Campus Contributor & Hackathon Organizer Program',
    language: 'English',
    language_code: 'en',
    author: 'GitHub Education Team',
    author_handle: '@github_education_india',
    verified_source: true,
    domain: 'education.github.com',
    posted_at: '7 hours ago',
    content: 'Applications are open for GitHub Campus Experts India! Lead workshops on Git and open source at your college. You receive event sponsorship grants up to ₹25,000 for your campus hackathon, swags, and mentor office hours. Apply on https://education.github.com/experts with your GitHub student developer pack.',
    reasons_it_looks_suspicious: ['Mentions ₹25,000 event grant money'],
    reasons_it_is_legitimate: ['Official github.com domain', 'Well established global program', 'Requires GitHub student pack authentication'],
    expected_risk_band: 'GREEN',
    ground_truth: 'GENUINE'
  },
  {
    id: 'gen-07',
    title: 'Freelance React Native Mobile App Bugfixes - Milestone Escrow',
    language: 'English / Hindi',
    language_code: 'en-hi',
    author: 'Kunal Verma (Verified Client)',
    author_handle: '@kunal_verma_builds',
    verified_source: true,
    domain: 'ncs.gov.in',
    posted_at: '9 hours ago',
    content: 'Need a student freelance dev for 4 days to fix 6 UI responsive bugs in our React Native app. Budget is ₹8,000. Payment will be held in platform escrow on Upwork contract before you write a single line of code. Contract URL: upwork.com/jobs/~01fe98234. No direct payment outside the escrow system.',
    reasons_it_looks_suspicious: ['Quick freelance cash offer', 'Direct contact'],
    reasons_it_is_legitimate: ['Uses regulated escrow contract', 'Strictly refuses offline money transfer', 'No deposit required from student'],
    expected_risk_band: 'GREEN',
    ground_truth: 'GENUINE'
  },
  {
    id: 'gen-08',
    title: 'Summer Youth Civic Action Fellowship - NGO Darpan Certified',
    language: 'English',
    language_code: 'en',
    author: 'Vigyan Prasar Student Foundation',
    author_handle: '@vigyan_prasar_fellows',
    verified_source: true,
    domain: 'naanmudhalvan.tn.gov.in',
    posted_at: '11 hours ago',
    content: 'Vigyan Prasar (Niti Aayog NGO Darpan Registered ID: DL/2021/0289412) invites undergraduate students for rural STEM workshop facilitation. Travel allowance and food stipend of ₹6,000 provided. Zero fee. Selection based on short telephonic interview. Register at https://vigyanprasarngo.org/fellowship.',
    reasons_it_looks_suspicious: ['Stipend mentioned for social work'],
    reasons_it_is_legitimate: ['Valid Niti Aayog NGO Darpan registration', 'Public policy verified partner', 'Zero applicant cost'],
    expected_risk_band: 'GREEN',
    ground_truth: 'GENUINE'
  }
];

// 6 Direct Message / Chats containing UPI IDs / payment links to test Payment Guard interceptor
const PAYMENT_CHATS = [
  {
    id: 'chat-01',
    conversation_with: 'HR Specialist (Google Impersonator)',
    sender_handle: '@google_placement_agent',
    last_message_time: 'Just now',
    messages: [
      {
        id: 'msg-101',
        sender: 'scammer',
        text: 'Hello candidate, your resume has been shortlisted for the Google SWE Summer Internship.',
        time: '10:02 AM'
      },
      {
        id: 'msg-102',
        sender: 'student',
        text: 'Wow, thank you! What is the next procedure?',
        time: '10:03 AM'
      },
      {
        id: 'msg-103',
        sender: 'scammer',
        text: 'Congratulations! To confirm your intern seat and receive onboarding credentials, pay ₹2,000 to google.hr.recruitment@okicici right now. Only 2 seats left, payment must be done within 10 minutes.',
        time: '10:04 AM',
        contains_payment_prompt: true,
        detected_upi: 'google.hr.recruitment@okicici',
        amount: 2000
      }
    ]
  },
  {
    id: 'chat-02',
    conversation_with: 'Task Supervisor Pooja',
    sender_handle: '@pooja_daily_tasks',
    last_message_time: '5 mins ago',
    messages: [
      {
        id: 'msg-201',
        sender: 'scammer',
        text: 'Aapne pehla test task complete kar liya hai! ₹150 credit kar diye hain.',
        time: '09:40 AM'
      },
      {
        id: 'msg-202',
        sender: 'student',
        text: 'Haan mujhe mil gaya. Next tasks kaise milenge?',
        time: '09:41 AM'
      },
      {
        id: 'msg-203',
        sender: 'scammer',
        text: 'VIP Level-2 activate karne ke liye transfer ₹500 to task.manager99@paytm. Iske baad aapko per day ₹3,000 ke 20 tasks milenge.',
        time: '09:42 AM',
        contains_payment_prompt: true,
        detected_upi: 'task.manager99@paytm',
        amount: 500
      }
    ]
  },
  {
    id: 'chat-03',
    conversation_with: 'National Scholarship Disbursement Officer',
    sender_handle: '@scholarship_officer_help',
    last_message_time: '12 mins ago',
    messages: [
      {
        id: 'msg-301',
        sender: 'scammer',
        text: 'Your application for DBT Student Grant ₹75,000 has been verified at server level.',
        time: '09:15 AM'
      },
      {
        id: 'msg-302',
        sender: 'student',
        text: 'When will the fund be credited to my account?',
        time: '09:16 AM'
      },
      {
        id: 'msg-303',
        sender: 'scammer',
        text: 'Sir please send ₹999 processing charge to scholarship.desk@oksbi for direct DBT bank server clearance. After UPI payment fund release certificate will be generated.',
        time: '09:18 AM',
        contains_payment_prompt: true,
        detected_upi: 'scholarship.desk@oksbi',
        amount: 999
      }
    ]
  },
  {
    id: 'chat-04',
    conversation_with: 'Express Logistics Courier Team',
    sender_handle: '@express_laptop_delivery',
    last_message_time: '20 mins ago',
    messages: [
      {
        id: 'msg-401',
        sender: 'scammer',
        text: 'Wipro company laptop consignment tracking ID: IN88492049 has reached your city hub.',
        time: '08:50 AM'
      },
      {
        id: 'msg-402',
        sender: 'student',
        text: 'Can I collect it today?',
        time: '08:52 AM'
      },
      {
        id: 'msg-403',
        sender: 'scammer',
        text: 'Package is under transit insurance hold. Send ₹3,500 laptop courier insurance via UPI ID courier.depot.india@ybl today or offer will be cancelled and package returned.',
        time: '08:55 AM',
        contains_payment_prompt: true,
        detected_upi: 'courier.depot.india@ybl',
        amount: 3500
      }
    ]
  },
  {
    id: 'chat-05',
    conversation_with: 'OMR Student PG Broker',
    sender_handle: '@chennai_pg_warden',
    last_message_time: '35 mins ago',
    messages: [
      {
        id: 'msg-501',
        sender: 'student',
        text: 'Sir room photos paathen, nalla irukku. Naalaiku vanthu paakalama?',
        time: '08:20 AM'
      },
      {
        id: 'msg-502',
        sender: 'scammer',
        text: 'Naalaiku vara kulla vera student book panniduvaanga bro. Already 3 enquiry irukku.',
        time: '08:22 AM'
      },
      {
        id: 'msg-503',
        sender: 'scammer',
        text: 'For room booking advance pay ₹2500 to landlord.pg.chennai@okhdfcbank UPI link immediately. Booking token slip send panren.',
        time: '08:24 AM',
        contains_payment_prompt: true,
        detected_upi: 'landlord.pg.chennai@okhdfcbank',
        amount: 2500
      }
    ]
  },
  {
    id: 'chat-06',
    conversation_with: 'Semester Exam Answers 2026 Admin',
    sender_handle: '@exam_answers_leaks',
    last_message_time: '1 hour ago',
    messages: [
      {
        id: 'msg-601',
        sender: 'student',
        text: 'Is the Anna University 3rd semester question paper real?',
        time: '07:30 AM'
      },
      {
        id: 'msg-602',
        sender: 'scammer',
        text: '100% genuine original paper with solved answers. Available 4 hours before exam.',
        time: '07:31 AM'
      },
      {
        id: 'msg-603',
        sender: 'scammer',
        text: 'Pay exam paper registration ₹1200 via direct UPI link: upi://pay?pa=papers.leak2026@axisbank&pn=ExamsDesk&am=1200 or send to papers.leak2026@axisbank. PDF password given in 2 mins.',
        time: '07:32 AM',
        contains_payment_prompt: true,
        detected_upi: 'papers.leak2026@axisbank',
        detected_upi_uri: 'upi://pay?pa=papers.leak2026@axisbank&pn=ExamsDesk&am=1200',
        amount: 1200
      }
    ]
  }
];

// 15 Trusted Source Entries (Verified Organizations, Portals, and Employers)
const TRUSTED_SOURCES = [
  {
    id: 'ts-01',
    name: 'Google Careers India',
    domain: 'careers.google.com',
    type: 'verified_employer',
    category: 'MNC Tech',
    badge: 'Official Employer',
    cin_gst: 'U72900KA2003PTC033028',
    safety_rule: 'Never asks for application fees, training deposits, or UPI payments.',
    verified: true
  },
  {
    id: 'ts-02',
    name: 'Tata Consultancy Services (TCS)',
    domain: 'tcs.com/careers',
    type: 'verified_employer',
    category: 'IT Services',
    badge: 'TCS NextStep Official',
    cin_gst: 'L22210MH1995PLC084781',
    safety_rule: 'All campus hiring happens via NextStep portal. TCS never charges any registration fees.',
    verified: true
  },
  {
    id: 'ts-03',
    name: 'Infosys Limited',
    domain: 'infosys.com/careers',
    type: 'verified_employer',
    category: 'IT Services',
    badge: 'Infosys Springboard Verified',
    cin_gst: 'L85110KA1981PLC013115',
    safety_rule: 'Official offers issued strictly from @infosys.com domain. Zero fees.',
    verified: true
  },
  {
    id: 'ts-04',
    name: 'National Career Service (NCS)',
    domain: 'ncs.gov.in',
    type: 'government_portal',
    category: 'Govt Employment Portal',
    badge: 'Ministry of Labour & Employment',
    cin_gst: 'GOVT-CENTRAL-NCS',
    safety_rule: 'Official portal of Govt of India connecting job seekers without any intermediary fees.',
    verified: true
  },
  {
    id: 'ts-05',
    name: 'AICTE Internship Portal',
    domain: 'internship.aicte-india.org',
    type: 'government_portal',
    category: 'National Education Council',
    badge: 'AICTE Approved',
    cin_gst: 'GOVT-AICTE-INT-2026',
    safety_rule: 'Direct verified internships for Indian technical students.',
    verified: true
  },
  {
    id: 'ts-06',
    name: 'Ministry of Education (Shiksha Mantralaya)',
    domain: 'education.gov.in',
    type: 'government_portal',
    category: 'Central Ministry',
    badge: 'Govt of India Verified',
    cin_gst: 'GOVT-EDU-IN-01',
    safety_rule: 'Central ministry overseeing higher education and national academic bodies.',
    verified: true
  },
  {
    id: 'ts-07',
    name: 'IIT Madras Research Park',
    domain: 'respark.iitm.ac.in',
    type: 'academic_institution',
    category: 'Premier Institute Hub',
    badge: 'IIT Madras Ecosystem',
    cin_gst: 'U73100TN2006NPL059045',
    safety_rule: 'Host for deep tech startups, student incubators, and research fellowships.',
    verified: true
  },
  {
    id: 'ts-08',
    name: 'National Scholarship Portal (NSP)',
    domain: 'scholarships.gov.in',
    type: 'government_portal',
    category: 'Govt Scholarship Gateway',
    badge: 'Direct Benefit Transfer (DBT)',
    cin_gst: 'GOVT-NSP-DBT',
    safety_rule: 'Only single official portal for central and state government scholarships. Never charges activation charges.',
    verified: true
  },
  {
    id: 'ts-09',
    name: 'Indian Space Research Organisation (ISRO)',
    domain: 'isro.gov.in/Careers',
    type: 'government_portal',
    category: 'Space Research Organization',
    badge: 'Dept of Space Verified',
    cin_gst: 'GOVT-DOS-ISRO',
    safety_rule: 'ICRB recruitment announcements published only on official gazette and isro.gov.in.',
    verified: true
  },
  {
    id: 'ts-10',
    name: 'GitHub Education & Student Developer Pack',
    domain: 'education.github.com',
    type: 'educational_platform',
    category: 'Developer Tools',
    badge: 'GitHub Campus Program',
    cin_gst: 'MSFT-GH-EDU-GLOBAL',
    safety_rule: 'Free development tools and student grants verified via academic email.',
    verified: true
  },
  {
    id: 'ts-11',
    name: 'Microsoft Learn Student Ambassadors',
    domain: 'studentambassadors.windows.com',
    type: 'educational_platform',
    category: 'Global Tech Program',
    badge: 'Microsoft Certified Partner',
    cin_gst: 'MSFT-LEARN-GLOBAL',
    safety_rule: 'Global student leadership initiative. No participation charge.',
    verified: true
  },
  {
    id: 'ts-12',
    name: 'Reserve Bank of India (RBI Kehta Hai)',
    domain: 'rbi.org.in',
    type: 'regulatory_authority',
    category: 'Central Banking Authority',
    badge: 'RBI Official Alert Authority',
    cin_gst: 'GOVT-RBI-CENTRAL',
    safety_rule: 'RBI never asks for OTP, UPI PIN, or advance fees to release lottery or funds.',
    verified: true
  },
  {
    id: 'ts-13',
    name: 'National Cyber Crime Reporting Portal & 1930 Helpline',
    domain: 'cybercrime.gov.in',
    type: 'law_enforcement',
    category: 'Govt Cyber Defense',
    badge: 'MHA / I4C Authorized',
    cin_gst: 'MHA-I4C-CYBERDEFENSE',
    safety_rule: 'Official Indian portal for lodging complaints on financial fraud and online scams. National Helpline 1930.',
    verified: true
  },
  {
    id: 'ts-14',
    name: 'NASSCOM FutureSkills Prime',
    domain: 'futureskillsprime.in',
    type: 'skilling_initiative',
    category: 'Industry Skilling',
    badge: 'MeitY & NASSCOM Joint Initiative',
    cin_gst: 'U91110DL1988NPL030761',
    safety_rule: 'Subsidized digital technology training for Indian graduates with government incentive.',
    verified: true
  },
  {
    id: 'ts-15',
    name: 'Naan Mudhalvan Skilling Portal',
    domain: 'naanmudhalvan.tn.gov.in',
    type: 'government_portal',
    category: 'State Skill Development',
    badge: 'Govt of Tamil Nadu TNSDC',
    cin_gst: 'GOVT-TN-TNSDC',
    safety_rule: 'State government sponsored technical courses and career guidance for Tamil Nadu college youth.',
    verified: true
  }
];

// 6 Viral Money Rumors Circulating on Social Media / WhatsApp to Fact Check
const VIRAL_RUMORS = [
  {
    id: 'rumor-01',
    rumor_title: 'PM Free Laptop Scheme 2026 WhatsApp Forward',
    languages: ['Tamil', 'Hindi', 'English'],
    claim: 'Government of India is distributing free HP and Lenovo laptops to all college students. Click the link to register.',
    viral_text_snippet: 'Govt announces Free Laptop Scheme for college students! Check your eligibility and register within 2 days at bit.ly/pm-free-laptop-2026. Forward to 5 groups to activate your registration ID.',
    fact_check_status: 'FAKE / PHISHING TRAP',
    is_safe: false,
    debunk_explanation: 'PIB Fact Check confirmed no such scheme exists. The link redirects to phishing pages designed to steal Aadhaar numbers and trigger fraudulent UPI registration fees.',
    official_advisory_link: 'https://pib.gov.in/FactCheck'
  },
  {
    id: 'rumor-02',
    rumor_title: 'RBI ₹5,000 Digital Rupee Student Diwali Airdrop',
    languages: ['Hindi', 'English'],
    claim: 'RBI is gifting ₹5,000 e-Rupee tokens directly to Indian bank accounts for youth digital adoption.',
    viral_text_snippet: 'Reserve Bank of India has announced ₹5,000 Diwali e-Rupee token grant. Download the attached APK to redeem into your Paytm or PhonePe wallet instantly.',
    fact_check_status: 'MALICIOUS TROJAN FRAUD',
    is_safe: false,
    debunk_explanation: 'RBI never conducts direct token giveaways or distributes APK files via WhatsApp. The APK contains an SMS stealer designed to intercept OTPs.',
    official_advisory_link: 'https://rbi.org.in'
  },
  {
    id: 'rumor-03',
    rumor_title: 'Telegram Part-time Amazon/Flipkart Review Job ₹3,000/Day',
    languages: ['Tamil', 'Telugu', 'Hindi'],
    claim: 'Earn ₹3,000 to ₹8,000 daily from home simply by giving 5-star ratings to e-commerce products.',
    viral_text_snippet: 'Work from home! Just 30 minutes per day. Give 5-star reviews to merchant products and earn ₹300 per review. Daily payouts guaranteed. Contact HR Manager on Telegram @amazon_review_parttime.',
    fact_check_status: 'ADVANCE-FEE TASK SCAM',
    is_safe: false,
    debunk_explanation: 'Classic task fraud. Scammers pay small ₹150 amounts initially, then demand large "prepaid merchant recharges" ranging from ₹5,000 to ₹50,000 which cannot be withdrawn.',
    official_advisory_link: 'https://cybercrime.gov.in'
  },
  {
    id: 'rumor-04',
    rumor_title: 'TCS Direct Off-Campus Joining Letter Without Interview',
    languages: ['English', 'Tamil'],
    claim: 'Direct TCS onboarding for engineering graduates upon payment of ₹1,500 document courier and verification charge.',
    viral_text_snippet: 'Direct Joining in TCS for 2024-2026 batches. No aptitude test, no technical interview. CTC 4.5 LPA. Pay mandatory background verification processing fee of ₹1,500 to confirm date of joining.',
    fact_check_status: 'JOB RECRUITMENT FRAUD',
    is_safe: false,
    debunk_explanation: 'TCS official notice affirms: TCS never charges any fee at any stage of hiring, nor has authorized any external agency to collect cash or UPI deposits.',
    official_advisory_link: 'https://tcs.com/careers'
  },
  {
    id: 'rumor-05',
    rumor_title: 'Mobile Captcha Typing ₹1,000/Hour Wallet Activation',
    languages: ['Hindi', 'Telugu'],
    claim: 'Type simple captchas on mobile and earn ₹1,000 per hour. Pay ₹300 activation wallet deposit.',
    viral_text_snippet: 'Earn daily salary from mobile! Captcha entry job. 100 captchas = ₹400. Start immediately after paying ₹300 server security deposit. Deposit refunded after 100 captchas.',
    fact_check_status: 'FAKE WORK FROM HOME SCAM',
    is_safe: false,
    debunk_explanation: 'Fraudulent portal designed to collect non-refundable ₹300 deposits from thousands of college students. The withdrawal threshold is intentionally rigged to never pay out.',
    official_advisory_link: 'https://cybercrime.gov.in'
  },
  {
    id: 'rumor-06',
    rumor_title: 'Student Education Loan Complete Waiver OTP Scam',
    languages: ['Malayalam', 'Tamil', 'English'],
    claim: 'New government gazette waives all student education loans up to ₹5 Lakhs if you confirm OTP on link.',
    viral_text_snippet: 'Student Education Loan Forgiveness Scheme 2026: All bank education loans under ₹5 Lakhs cleared by central government. Verify your bank account and enter Aadhaar OTP at loan-waiver-verify.in to receive no-due certificate.',
    fact_check_status: 'IDENTITY THEFT & BANK DRAINING SCAM',
    is_safe: false,
    debunk_explanation: 'No blanket student loan waiver has been announced. The scam portal captures net banking credentials and Aadhaar OTPs to siphon bank balances.',
    official_advisory_link: 'https://rbi.org.in'
  }
];

module.exports = {
  SCAM_CATEGORIES,
  SCAMS,
  GENUINE_OPPORTUNITIES,
  PAYMENT_CHATS,
  TRUSTED_SOURCES,
  VIRAL_RUMORS
};
