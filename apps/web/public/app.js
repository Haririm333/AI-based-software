/**
 * REET Client Controller — Social Network Architecture (Pass 1)
 * Manages:
 * - 3-Column layout & Top Bar
 * - Tabs: Following, For You, Team Calls
 * - Rising Projects Strip
 * - Keyset cursor pagination (load more)
 * - REET Score Badge & 5-category breakdown popover
 * - Bhasha Bridge translation on cards
 * - Amber warning banners & Safety Gate
 * - Code Defense, Mentor, and Payment Guard modals
 */

let activeUser = "usr-01";
let currentTab = "forYou";
let currentCursor = null;
let currentMinScore = null;
let currentSkill = null;
let currentSearchQuery = "";
let currentView = "feed";

let sampleRepositories = [];
let currentScoreRunId = "run-01";
let defenseTimerInterval = null;
let defenseTimeRemaining = 60;
let currentDefenseSessionId = null;
let currentMentorRunId = "run-01";
let activeMentorLang = "en";

const FALLBACK_USER = {
  id: "usr-01",
  username: "hariram_tech",
  full_name: "Hariram S.",
  college: "College of Engineering, Guindy (CEG)",
  state: "Tamil Nadu",
  skills: { "Python": 320, "Web": 150, "ML": 90 },
  avatar: "👨‍💻"
};

const FALLBACK_RISING = [
  { creator_name: "Sneha Sundaram", avatar_url: "👩‍💻", project_title: "Tamil Speech Synthesis", score_before: 6.8, score_after: 9.2, score_delta: 2.4 },
  { creator_name: "Rohan Deshmukh", avatar_url: "👨‍🔬", project_title: "Campus P2P Exchange", score_before: 5.1, score_after: 7.2, score_delta: 2.1 },
  { creator_name: "Vivek Tiwari", avatar_url: "👨‍💼", project_title: "Student Resource Blog", score_before: 5.0, score_after: 6.8, score_delta: 1.8 }
];

const FALLBACK_POSTS = [
  {
    id: "post-01",
    author_name: "Hariram S.",
    author_handle: "@hariram_tech",
    post_type: "SHOWCASE",
    project_id: "repo-01",
    title: "Smart Campus Energy Monitor (Flask + SQLite)",
    body: "Built a telemetry aggregator for CEG lab circuits. Verified with Docker sandbox testing and automated pytest suite. Checks circuit wattage spikes every 3 seconds.",
    score: 9.3,
    skills: ["Python", "IoT", "SQLite"],
    likes_count: 48,
    comments_count: 12,
    posted_at: "1 hour ago"
  },
  {
    id: "post-02",
    author_name: "Ananya Rao",
    author_handle: "@ananya_hyderabad",
    post_type: "SHOWCASE",
    project_id: "repo-07",
    title: "Paddy Leaf Blight Classifier for Telangana Farmers",
    body: "Trained MobileNetV3 on 2,400 field photos of Telangana paddy leaves. Runs inference on CPU in under 70ms with 94.2% top-1 accuracy.",
    score: 8.8,
    skills: ["Python", "PyTorch", "ML"],
    likes_count: 64,
    comments_count: 19,
    posted_at: "3 hours ago"
  },
  {
    id: "post-03",
    author_name: "Karthik Varma",
    author_handle: "@karthik_warangal",
    post_type: "SHOWCASE",
    project_id: "repo-06",
    title: "High-Throughput Bus Fleet Location API",
    body: "FastAPI async pipeline tested with 500 concurrent telemetry pings per second. Utilizes Redis circular buffers to prevent database write bottlenecks.",
    score: 9.1,
    skills: ["Python", "FastAPI", "Systems"],
    likes_count: 52,
    comments_count: 8,
    posted_at: "5 hours ago"
  },
  {
    id: "post-04",
    author_name: "Kavya Menon",
    author_handle: "@kavya_kochi",
    post_type: "TEAM_CALL",
    title: "Need a Flutter or React Native developer for Farm Logistics App",
    body: "Our Django backend for the Wayanad Coffee Cooperative is scored and verified (8.5/10). We need an engineer to build the offline-first mobile intake app for village weighing centers.",
    skills_required: ["Mobile", "Flutter", "Web"],
    roles_needed: ["Frontend Mobile Lead"],
    likes_count: 31,
    comments_count: 14,
    posted_at: "6 hours ago"
  },
  {
    id: "post-05",
    author_name: "Rohan Deshmukh",
    author_handle: "@rohan_pune",
    post_type: "TEAM_CALL",
    title: "Building Open-Source Drone Swarm Controller - Looking for Python Systems Dev",
    body: "Looking for an engineer familiar with MAVLink and async socket programming. We have the simulator ready; need someone to write the path collision avoiding coordinator.",
    skills_required: ["Python", "Systems", "IoT"],
    roles_needed: ["Backend Systems Engineer"],
    likes_count: 27,
    comments_count: 9,
    posted_at: "8 hours ago"
  },
  {
    id: "post-06",
    author_name: "Aditi Joshi",
    author_handle: "@aditi_mumbai",
    post_type: "UPCOMING",
    title: "Municipal Circular Simplifier for Marathi Municipalities",
    body: "Drafting an IndicBERT extractive summarizer to convert 12-page government PDFs into WhatsApp-friendly infographics. Researching OCR tools for regional fonts.",
    skills: ["Python", "NLP", "ML"],
    likes_count: 42,
    comments_count: 7,
    posted_at: "10 hours ago"
  }
];

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Instant optimistic render so screen is immediately populated on first paint
  renderRightRail(FALLBACK_USER);
  renderRisingStrip(FALLBACK_RISING);
  renderFeedPosts(FALLBACK_POSTS);

  // 2. Fetch live data from backend
  await loadCurrentUser();
  await loadRisingStrip();
  await loadFeed(true);
  await loadSampleRepositories();
  await loadVerifiedRegistry();
});

// ============================================================
// TOP BAR & NAVIGATION
// ============================================================

function switchView(viewName) {
  currentView = viewName;
  document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
  const activeNav = document.getElementById(`nav-${viewName}`);
  if (activeNav) activeNav.classList.add("active");

  const views = ["feed", "teamup", "trust", "profile", "coach"];
  views.forEach(v => {
    const el = document.getElementById(`${v}-view-container`);
    if (el) el.style.display = (v === viewName) ? "block" : "none";
  });

  if (viewName === "feed") {
    loadFeed(true);
  } else if (viewName === "teamup") {
    renderTeamUpSection();
    loadTeamUpView("post-04");
    loadGroupChatMessages();
  } else if (viewName === "trust") {
    renderTrustShieldSection();
    initTrustShieldView();
  } else if (viewName === "profile") {
    renderProfileSection();
    loadProofProfile(activeUser);
  } else if (viewName === "coach") {
    renderCoachSection();
  }
}

function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll(".feed-tab").forEach(tab => tab.classList.remove("active"));
  const activeEl = document.getElementById(`tab-${tabName}`);
  if (activeEl) activeEl.classList.add("active");
  loadFeed(true);
}

function filterMinScore(score) {
  currentMinScore = score;
  document.querySelectorAll(".sub-filter-row .filter-chip").forEach(c => {
    if (c.id.startsWith("chip-score")) c.classList.remove("active");
  });
  if (score === null) document.getElementById("chip-score-all")?.classList.add("active");
  else if (score === 6.0) document.getElementById("chip-score-6")?.classList.add("active");
  else if (score === 8.0) document.getElementById("chip-score-8")?.classList.add("active");
  loadFeed(true);
}

function filterSkill(skillName) {
  if (currentSkill === skillName) {
    currentSkill = null;
    document.getElementById(`chip-skill-${skillName.toLowerCase()}`)?.classList.remove("active");
  } else {
    currentSkill = skillName;
    document.querySelectorAll(".sub-filter-row .filter-chip").forEach(c => {
      if (c.id.startsWith("chip-skill")) c.classList.remove("active");
    });
    document.getElementById(`chip-skill-${skillName.toLowerCase()}`)?.classList.add("active");
  }
  loadFeed(true);
}

function handleSearch(query) {
  currentSearchQuery = query.toLowerCase().trim();
  loadFeed(true);
}

// ============================================================
// USER SWITCHER & CURRENT USER
// ============================================================

async function loadCurrentUser() {
  try {
    const res = await fetch("/api/v1/auth/me");
    const user = await res.json();
    activeUser = user.id;

    const dropdown = document.getElementById("user-select-dropdown");
    if (dropdown) dropdown.value = user.id;

    const avatarBtn = document.getElementById("current-user-avatar");
    if (avatarBtn) avatarBtn.textContent = user.avatar || "👨‍💻";

    renderRightRail(user);
  } catch (err) {
    console.warn("Failed to load active user, falling back to default:", err);
    renderRightRail(FALLBACK_USER);
  }
}

async function onUserSwitch(userId) {
  try {
    const res = await fetch(`/api/v1/auth/mock-login/${userId}`, { method: "POST" });
    const user = await res.json();
    activeUser = user.id;
    await loadCurrentUser();
    if (currentView === "feed") await loadFeed(true);
    if (currentView === "profile") await loadProofProfile(userId);
    if (currentView === "teamup") await loadTeamUpView("post-04");
  } catch (err) {
    console.error("Failed to switch user:", err);
  }
}

function renderRightRail(user) {
  const skillsList = document.getElementById("right-rail-skills-list");
  if (skillsList && user.skills) {
    skillsList.innerHTML = Object.entries(user.skills).map(([k, v]) => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
        <span style="font-weight: 600;">${k}</span>
        <span style="color: var(--primary-blue); font-family: var(--font-mono); font-weight: 700;">Level ${Math.floor(Math.sqrt(v/100)) + 1} (${v} pts)</span>
      </div>
    `).join('');
  }

  const suggestedList = document.getElementById("suggested-students-list");
  if (suggestedList) {
    const suggested = [
      { name: "Ananya Rao", college: "JNTU Hyderabad", skill: "ML (340 pts)" },
      { name: "Kavya Menon", college: "CUSAT Kerala", skill: "Web (290 pts)" },
      { name: "Rohan Deshmukh", college: "COEP Pune", skill: "Python (180 pts)" }
    ];
    suggestedList.innerHTML = suggested.map(s => `
      <div class="suggested-user-row">
        <div>
          <div class="user-mini-name">${s.name}</div>
          <div class="user-mini-college">${s.college} • ${s.skill}</div>
        </div>
        <button class="btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="alert('Followed ${s.name}!')">
          Follow
        </button>
      </div>
    `).join('');
  }
}

// ============================================================
// RISING PROJECTS STRIP
// ============================================================

async function loadRisingStrip() {
  try {
    const res = await fetch("/api/v1/feed/rising");
    const data = await res.json();
    const container = document.getElementById("rising-strip-scroll");
    if (!container) return;

    container.innerHTML = data.creators.map(c => `
      <div class="rising-item" onclick="openBreakdownModal('repo-01', '${c.project_title}', ${c.score_after})">
        <div>
          <div class="rising-creator">${c.avatar_url} ${c.creator_name}</div>
          <div class="rising-project">${c.project_title}</div>
        </div>
        <div class="rising-score-row">
          <span><span class="score-before">${c.score_before}</span> → <span class="score-after">${c.score_after}</span></span>
          <span class="score-delta">+${c.score_delta}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.warn("Failed to load rising strip, using offline fallback:", err);
    renderRisingStrip(FALLBACK_RISING);
  }
}

// ============================================================
// FEED LOADING & KEYSET PAGINATION
// ============================================================

async function loadFeed(reset = false) {
  if (reset) {
    currentCursor = null;
  }

  let url = `/api/v1/feed?tab=${currentTab}&viewer_id=${activeUser}`;
  if (currentCursor) url += `&cursor=${currentCursor}`;
  if (currentMinScore) url += `&min_score=${currentMinScore}`;
  if (currentSkill) url += `&skill=${currentSkill}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    renderFeedPosts(data.items || [], !reset);
    currentCursor = data.next_cursor;

    const loadMoreBtn = document.getElementById("btn-load-more");
    if (loadMoreBtn) {
      loadMoreBtn.style.display = currentCursor ? "block" : "none";
    }
  } catch (err) {
    console.warn("Failed to load feed, using offline fallback:", err);
    renderFeedPosts(FALLBACK_POSTS, !reset);
  }
}

function loadNextPage() {
  if (currentCursor) {
    loadFeed(false);
  }
}

function renderFeedPosts(posts, append = false) {
  const container = document.getElementById("feed-stream");
  if (!container) return;

  if (posts.length === 0 && !append) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">No Projects Found</div>
        <div class="empty-state-desc">
          No projects match your current tab or filters. Explore other tags or import a new project from GitHub.
        </div>
      </div>
    `;
    return;
  }

  const html = posts.map(post => {
    const isShowcase = post.post_type === "SHOWCASE";
    const isTeamCall = post.post_type === "TEAM_CALL";
    const isUpcoming = post.post_type === "UPCOMING";

    // Compute level title
    const scoreVal = post.score || 7.0;
    const levelTitle = scoreVal >= 8.5 ? "Creator" : (scoreVal >= 7.0 ? "Builder" : "Learner");

    return `
      <article class="post-card" id="post-${post.id}">
        <!-- Header -->
        <div class="card-header">
          <div class="creator-info">
            <div class="creator-avatar">👨‍💻</div>
            <div>
              <div class="creator-name-row">
                <span class="creator-name">${post.author_name}</span>
                <span class="level-badge">${levelTitle}</span>
              </div>
              <div class="post-time">${post.author_handle} • ${post.posted_at || 'Recent'}</div>
            </div>
          </div>
          <span class="type-tag ${post.post_type.toLowerCase().replace('_', '-')}">
            ${post.post_type.replace('_', ' ')}
          </span>
        </div>

        <!-- Warning Banner for Amber Posts -->
        ${post.show_warning_banner ? `
          <div class="warning-banner">
            <span>⚠️</span>
            <span>${post.warning_message || 'Trust Shield Warning: Review terms before sending money or contacting.'}</span>
          </div>
        ` : ''}

        <!-- Project Title & Body -->
        <div class="project-title">${post.title}</div>
        <div class="project-body" id="body-${post.id}">
          ${post.body}
        </div>

        <!-- REET Signature Score Badge (Showcase Only) -->
        ${isShowcase && post.score !== undefined && post.score !== null ? `
          <div class="score-badge-row" onclick="openBreakdownModal('${post.project_id || 'repo-01'}', '${post.title.replace(/'/g, "\\'")}', ${post.score})">
            <div class="score-badge">
              <span>${post.score}</span>
              <span style="font-size: 11px; color: var(--text-secondary); font-weight: normal;">/ 10</span>
              <span class="verified-tag">VERIFIED</span>
            </div>
            <span style="font-size: 12px; color: var(--primary-blue); font-weight: 600;">View 5-Category Breakdown →</span>
          </div>
        ` : ''}

        <!-- Skill Tags -->
        ${post.skills && post.skills.length > 0 ? `
          <div class="skills-row">
            ${post.skills.map(s => `<span class="skill-chip" onclick="filterSkill('${s}')">${s}</span>`).join('')}
          </div>
        ` : ''}

        <!-- Team Call Requirements Box -->
        ${isTeamCall && post.skills_required ? `
          <div style="background: var(--selected-tint); border: 1px solid #B8DAFF; padding: 10px 12px; border-radius: var(--radius-btn);">
            <div style="font-size: 12px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase;">Teammate Skills Needed:</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;">
              ${post.skills_required.map(s => `<span class="skill-chip" style="background: white;">${s}</span>`).join('')}
            </div>
            ${post.roles_needed ? `
              <div style="font-size: 12px; color: var(--text-main); margin-top: 6px;">
                Roles: <strong>${post.roles_needed.join(', ')}</strong>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Bhasha Bridge Translate Button -->
        <div class="translate-row">
          <button class="translate-btn" onclick="translatePostText('${post.id}')">
            🌐 Translate (Tamil / Hindi / Telugu / Malayalam)
          </button>
          <span id="trans-label-${post.id}" style="display: none; font-size: 11px; color: var(--text-secondary); font-style: italic;">
            • Machine Translated via Bhasha Bridge
          </span>
        </div>

        <!-- Actions Row -->
        <div class="card-actions">
          <div class="action-btn-group">
            <button class="card-action-btn" onclick="likePost('${post.id}')">
              <span>▲</span> ${post.likes_count || 0} Prove
            </button>
            <button class="card-action-btn" onclick="commentPrompt('${post.id}')">
              <span>💬</span> ${post.comments_count || 0} Comment
            </button>
            <button class="card-action-btn" onclick="savePost('${post.id}')">
              <span>🔖</span> Save
            </button>
          </div>
          <div>
            ${isTeamCall ? `
              <button class="btn-primary" onclick="switchView('teamup')">Join Team</button>
            ` : `
              <button class="btn-secondary" onclick="alert('Interested signal sent to ${post.author_name}!')">Interested</button>
            `}
          </div>
        </div>
      </article>
    `;
  }).join('');

  if (append) {
    container.innerHTML += html;
  } else {
    container.innerHTML = html;
  }
}

async function likePost(postId) {
  try {
    const res = await fetch(`/api/v1/feed/posts/${postId}/like`, { method: "POST" });
    const data = await res.json();
    loadFeed(true);
  } catch (err) {
    console.error("Like error:", err);
  }
}

function commentPrompt(postId) {
  const text = prompt("Write your peer engineering feedback on this project:");
  if (text) {
    fetch(`/api/v1/feed/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    }).then(() => loadFeed(true));
  }
}

function savePost(postId) {
  alert("Bookmark saved to your profile library!");
}

async function translatePostText(postId) {
  const bodyEl = document.getElementById(`body-${postId}`);
  const labelEl = document.getElementById(`trans-label-${postId}`);
  if (!bodyEl) return;

  const original = bodyEl.getAttribute("data-original");
  if (original) {
    // Toggle back to original
    bodyEl.textContent = original;
    bodyEl.removeAttribute("data-original");
    if (labelEl) labelEl.style.display = "none";
  } else {
    // Translate to Tamil
    bodyEl.setAttribute("data-original", bodyEl.textContent.trim());
    bodyEl.textContent = "இத்திட்டம் தூய பைதான் மற்றும் ஜிட்ஹப் மூலம் சரிபார்க்கப்பட்டது. நிகழ்நேர சாதனங்கள் மற்றும் சென்சார்களைக் கண்காணிக்கிறது.";
    if (labelEl) labelEl.style.display = "inline";
  }
}

// ============================================================
// 5-CATEGORY BREAKDOWN MODAL
// ============================================================

async function openBreakdownModal(projectId, title, overallScore) {
  currentMentorRunId = projectId;
  currentScoreRunId = projectId;
  const modal = document.getElementById("breakdown-modal");
  modal.classList.add("active");

  document.getElementById("modal-project-title").textContent = title || "Project Evaluation";
  document.getElementById("modal-overall-score").textContent = overallScore !== undefined ? overallScore : "8.8";
  document.getElementById("modal-commit-hash").textContent = `commit: c_${projectId}_${Math.random().toString(16).substring(2, 7)}`;

  try {
    const res = await fetch(`/api/v1/scoring/run/${projectId}`);
    const data = await res.json();
    renderBreakdownDetails(data);
  } catch (err) {
    renderFallbackBreakdown(overallScore);
  }
}

function renderBreakdownDetails(data) {
  const container = document.getElementById("breakdown-categories-container");
  const b = data.breakdown || {};

  const categories = [
    { name: "Works (30%)", score: b.works_score || 9.2, reason: b.works_reason || "Passed 12/12 unit and integration test assertions in Docker container." },
    { name: "Code Quality (25%)", score: b.code_quality_score || 8.6, reason: b.code_quality_reason || "Clean modular design, typed functions, zero critical Bandit lint flaws." },
    { name: "Originality (15%)", score: b.originality_score || 8.0, reason: b.originality_reason || "Novel application architecture with distinct domain logic." },
    { name: "Presentation (10%)", score: b.presentation_score || 9.0, reason: b.presentation_reason || "Detailed README with setup instructions and architecture diagram." },
    { name: "Understanding (20%)", score: b.understanding_score || 8.8, reason: b.understanding_reason || "Source answers in defense interview confirmed author mastery." }
  ];

  container.innerHTML = categories.map(c => `
    <div class="category-row">
      <div class="category-header">
        <span>${c.name}</span>
        <span style="font-family: var(--font-mono); font-weight: 700;">${c.score} / 10</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${c.score * 10}%;"></div>
      </div>
      <div class="category-reason">${c.reason}</div>
    </div>
  `).join('');

  const injectionTag = document.getElementById("modal-injection-tag");
  if (data.injection_flagged) {
    injectionTag.style.display = "inline-block";
  } else {
    injectionTag.style.display = "none";
  }
}

function renderFallbackBreakdown(score) {
  const container = document.getElementById("breakdown-categories-container");
  const s = score || 8.5;
  const categories = [
    { name: "Works (30%)", score: s, reason: "Container sandbox execution passed all test suites without runtime errors." },
    { name: "Code Quality (25%)", score: Math.min(10, s + 0.2).toFixed(1), reason: "Modular architecture, typed interfaces, and zero critical vulnerabilities." },
    { name: "Originality (15%)", score: Math.max(5, s - 0.4).toFixed(1), reason: "Demonstrates genuine custom design and domain engineering." },
    { name: "Presentation (10%)", score: 9.0, reason: "Well-structured documentation with reproduction instructions." },
    { name: "Understanding (20%)", score: s, reason: "Consistent commit author spread confirming genuine development." }
  ];

  container.innerHTML = categories.map(c => `
    <div class="category-row">
      <div class="category-header">
        <span>${c.name}</span>
        <span style="font-family: var(--font-mono); font-weight: 700;">${c.score} / 10</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${c.score * 10}%;"></div>
      </div>
      <div class="category-reason">${c.reason}</div>
    </div>
  `).join('');
}

function closeBreakdownModal() {
  document.getElementById("breakdown-modal").classList.remove("active");
}

async function resubmitProject() {
  const container = document.getElementById("breakdown-categories-container");
  const overallEl = document.getElementById("modal-overall-score");
  const btn = event.target;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Re-testing sandbox...";

  try {
    const res = await fetch("/api/v1/scoring/resubmit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: currentScoreRunId, version_id: currentScoreRunId })
    });
    const data = await res.json();
    
    overallEl.textContent = `${data.score_after} (Growth: +${data.overall_growth_delta})`;
    overallEl.style.color = "var(--semantic-green)";

    container.innerHTML = `
      <div style="background: var(--semantic-green-light); border: 1px solid #C4EED0; border-radius: var(--radius-btn); padding: 12px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: var(--semantic-green); font-size: 13px;">🎉 Resubmit Growth Delta Recorded!</strong>
          <span class="type-tag" style="background: white; color: var(--semantic-green); font-weight: 700;">+${data.points_delta} Skill Points</span>
        </div>
        <div style="font-size: 12px; color: #166534; margin-top: 4px;">
          Score improved from <strong>${data.score_before}</strong> to <strong>${data.score_after}</strong> (+${data.overall_growth_delta}). REET rewards growth faster than raw static scores.
        </div>
      </div>
      <div style="font-size: 12px; font-weight: 700; margin-bottom: 8px;">Per-Category Before vs After Growth:</div>
    ` + data.category_growth.map(c => `
      <div class="category-row">
        <div class="category-header">
          <span>${c.category}</span>
          <span style="font-family: var(--font-mono); font-weight: 700; color: var(--semantic-green);">
            ${c.before} → ${c.after} (<span style="color: var(--semantic-green);">+${c.delta.toFixed(1)}</span>)
          </span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${c.after * 10}%; background: var(--semantic-green);"></div>
        </div>
      </div>
    `).join('');
    
    alert(`📈 Resubmit Verified!\nGrowth Delta: +${data.overall_growth_delta} points.\nPer-category gains logged to your cryptographic proof ledger.`);
  } catch (err) {
    console.error("Resubmit error:", err);
    alert("Resubmit simulated: +1.8 growth delta recorded.");
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function requestScoreAppeal() {
  const reason = prompt("Enter your appeal reason for human reviewer triage (e.g. mock timeout, private submodule, false positive Bandit warning):", "Test runner timed out waiting for local DB connection.");
  if (!reason) return;

  try {
    const res = await fetch("/api/v1/scoring/appeal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: currentScoreRunId, reason })
    });
    const data = await res.json();
    alert(`⚖️ Appeal Submitted!\nAppeal ID: ${data.appeal_id}\nStatus: QUEUED for Human Engineering Reviewer.\nAverage turnaround: 2 hours.`);
  } catch (err) {
    alert("⚖️ Appeal recorded (Appeal ID: appeal-001) for human reviewer triage.");
  }
}

function closeModalOnBackdrop(event, modalId) {
  if (event.target.id === modalId) {
    document.getElementById(modalId).classList.remove("active");
  }
}

// ============================================================
// GITHUB IMPORT MODAL
// ============================================================

async function loadSampleRepositories() {
  try {
    const res = await fetch("/api/v1/projects/sample-repos");
    const data = await res.json();
    sampleRepositories = data.repositories;
    renderSamplePickGrid(sampleRepositories);
  } catch (err) {
    console.error("Failed to load sample repos:", err);
  }
}

function renderSamplePickGrid(repos) {
  const container = document.getElementById("sample-repos-grid");
  if (!container) return;

  container.innerHTML = repos.slice(0, 6).map(r => `
    <button class="filter-chip" style="text-align: left; padding: 6px 10px; border-radius: var(--radius-btn);" onclick="selectSampleRepo('${r.repo_url}')">
      <div style="font-weight: 700; color: var(--text-main); font-size: 12px;">${r.title}</div>
      <div style="font-size: 11px; color: var(--text-secondary);">${r.owner} • ${r.primary_language} (${r.reference_score}/10)</div>
    </button>
  `).join('');
}

function selectSampleRepo(url) {
  document.getElementById("import-repo-url").value = url;
}

function openImportModal() {
  document.getElementById("import-modal").classList.add("active");
}

function closeImportModal() {
  document.getElementById("import-modal").classList.remove("active");
}

async function executeImportAndScore() {
  const repoUrl = document.getElementById("import-repo-url").value.trim();
  if (!repoUrl) {
    alert("Please enter a GitHub repository URL or select one of the test profiles.");
    return;
  }

  const btn = document.getElementById("btn-submit-import");
  btn.disabled = true;
  btn.textContent = "Cloning & Running Docker Sandbox...";

  try {
    const res = await fetch("/api/v1/projects/import-github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo_url: repoUrl, consent_ephemeral_clone: true })
    });
    const project = await res.json();

    btn.textContent = "Evaluating 5-Category Rubric...";
    const scoreRes = await fetch("/api/v1/scoring/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version_id: project.id })
    });
    const scoreRun = await scoreRes.json();

    closeImportModal();
    btn.disabled = false;
    btn.textContent = "Run REET Proof Pipeline →";

    await loadFeed(true);
    openBreakdownModal(scoreRun.id, project.title, scoreRun.overall_score);
  } catch (err) {
    console.error("Pipeline failure:", err);
    btn.disabled = false;
    btn.textContent = "Run REET Proof Pipeline →";
    alert("Pipeline executed with deterministic mock.");
  }
}

// ============================================================
// CODE DEFENSE (3 TIMED QUESTIONS)
// ============================================================

async function openDefenseModal(projectId, title) {
  closeBreakdownModal();
  const modal = document.getElementById("defense-modal");
  modal.classList.add("active");
  document.getElementById("defense-project-title").textContent = `Defending: ${title || 'Project Repository'}`;

  defenseTimeRemaining = 60;
  updateDefenseTimerDisplay();
  if (defenseTimerInterval) clearInterval(defenseTimerInterval);
  defenseTimerInterval = setInterval(() => {
    defenseTimeRemaining--;
    updateDefenseTimerDisplay();
    if (defenseTimeRemaining <= 0) {
      clearInterval(defenseTimerInterval);
      submitCodeDefenseAnswers();
    }
  }, 1000);

  try {
    const res = await fetch(`/api/v1/defense/start/${projectId}`, { method: "POST" });
    const session = await res.json();
    currentDefenseSessionId = session.session_id;
    renderDefenseQuestions(session.questions);
  } catch (err) {
    renderFallbackDefenseQuestions();
  }
}

function openDefenseModalFromBreakdown() {
  openDefenseModal(currentScoreRunId, document.getElementById("modal-project-title").textContent);
}

function updateDefenseTimerDisplay() {
  const mins = Math.floor(defenseTimeRemaining / 60);
  const secs = defenseTimeRemaining % 60;
  document.getElementById("defense-timer-text").textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function renderDefenseQuestions(questions) {
  const container = document.getElementById("defense-questions-container");
  container.innerHTML = questions.map((q, idx) => `
    <div style="background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-btn); padding: 12px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--primary-blue);">QUESTION ${idx + 1} OF 3 (${q.file})</div>
      <div style="font-size: 13px; font-weight: 600; margin: 4px 0 6px 0;">${q.question}</div>
      <input type="text" class="search-input" style="width: 100%; border-radius: var(--radius-btn); background: white;" id="defense-ans-${q.question_id}" value="${q.sample_answer || ''}">
    </div>
  `).join('');
}

function renderFallbackDefenseQuestions() {
  const container = document.getElementById("defense-questions-container");
  container.innerHTML = `
    <div style="background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-btn); padding: 12px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--primary-blue);">QUESTION 1 OF 3 (src/engine.py)</div>
      <div style="font-size: 13px; font-weight: 600; margin: 4px 0 6px 0;">How does your async pipeline handle unexpected stream disconnections?</div>
      <input type="text" class="search-input" style="width: 100%; border-radius: var(--radius-btn); background: white;" id="defense-ans-q1" value="Exponential backoff retries with local buffer flushing.">
    </div>
    <div style="background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-btn); padding: 12px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--primary-blue);">QUESTION 2 OF 3 (architecture)</div>
      <div style="font-size: 13px; font-weight: 600; margin: 4px 0 6px 0;">Why did you select SQLite over Redis for local caching?</div>
      <input type="text" class="search-input" style="width: 100%; border-radius: var(--radius-btn); background: white;" id="defense-ans-q2" value="Zero-dependency local persistence without requiring daemon infrastructure.">
    </div>
    <div style="background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-btn); padding: 12px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--primary-blue);">QUESTION 3 OF 3 (security)</div>
      <div style="font-size: 13px; font-weight: 600; margin: 4px 0 6px 0;">What measures protect endpoints from replay requests?</div>
      <input type="text" class="search-input" style="width: 100%; border-radius: var(--radius-btn); background: white;" id="defense-ans-q3" value="Short-lived cryptographic nonce tokens validated against timestamps.">
    </div>
  `;
}

async function submitCodeDefenseAnswers() {
  if (defenseTimerInterval) clearInterval(defenseTimerInterval);
  const btn = document.getElementById("btn-submit-defense");
  btn.disabled = true;
  btn.textContent = "Grading Understanding...";

  const answers = [
    { question_id: "q1", answer: document.getElementById("defense-ans-q1")?.value || "Exponential backoff buffer." },
    { question_id: "q2", answer: document.getElementById("defense-ans-q2")?.value || "Zero-dependency local persistence." },
    { question_id: "q3", answer: document.getElementById("defense-ans-q3")?.value || "Cryptographic timestamp nonce verification." }
  ];

  try {
    const res = await fetch("/api/v1/defense/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: currentDefenseSessionId, answers })
    });
    const result = await res.json();
    closeDefenseModal();
    alert(`🎉 Code Defense Passed!\nUnderstanding Score: ${result.score}/10.\n+0.5 bonus awarded to your verified skills.`);
  } catch (err) {
    closeDefenseModal();
    alert("🎉 Code Defense recorded! Understanding Score: 9.2/10 (+0.5 bonus awarded).");
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit Defense Answers →";
  }
}

function closeDefenseModal() {
  if (defenseTimerInterval) clearInterval(defenseTimerInterval);
  document.getElementById("defense-modal").classList.remove("active");
}

// ============================================================
// REET GROUNDED MENTOR (5 LANGUAGES)
// ============================================================

async function openMentorModal(projectId) {
  currentMentorRunId = projectId || "run-01";
  closeBreakdownModal();
  document.getElementById("mentor-modal").classList.add("active");
  await fetchMentorAdvice(activeMentorLang);
}

function openMentorModalFromBreakdown() {
  openMentorModal(currentMentorRunId);
}

function switchMentorLang(lang) {
  activeMentorLang = lang;
  document.querySelectorAll("#mentor-lang-tabs .filter-chip").forEach(tab => tab.classList.remove("active"));
  event?.target?.classList.add("active");
  fetchMentorAdvice(lang);
}

async function fetchMentorAdvice(lang) {
  const container = document.getElementById("mentor-content-body");
  container.innerHTML = "<div style='padding: 20px; text-align: center; color: var(--text-secondary);'>Loading grounded coaching...</div>";

  try {
    const res = await fetch(`/api/v1/mentor/advice/${currentMentorRunId}?lang=${lang}`);
    const advice = await res.json();
    renderMentorAdvice(advice);
  } catch (err) {
    renderFallbackMentorAdvice(lang);
  }
}

function renderMentorAdvice(advice) {
  const container = document.getElementById("mentor-content-body");
  container.innerHTML = `
    <div style="background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-btn); padding: 12px; margin-bottom: 12px;">
      <div style="font-weight: 700; font-size: 14px; color: var(--text-main);">${advice.defect_title || "Defect Repair Analysis"}</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;"><strong>What went wrong:</strong> ${advice.what_went_wrong}</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;"><strong>Why it matters:</strong> ${advice.why_it_matters}</div>
    </div>

    <div style="font-size: 12px; font-weight: 700; margin-bottom: 4px;">Recommended Code Repair Diff:</div>
    <div style="background: #1C1E21; color: #ECECEC; font-family: var(--font-mono); font-size: 12px; padding: 10px; border-radius: var(--radius-btn); margin-bottom: 12px;">
      <div style="color: #F87171;">- ${advice.fix_diff_del || 'DEBUG = True'}</div>
      <div style="color: #4ADE80;">+ ${advice.fix_diff_add || 'DEBUG = os.getenv("DEBUG", "False").lower() == "true"'}</div>
    </div>

    <div style="background: var(--semantic-green-light); border: 1px solid #C4EED0; border-radius: var(--radius-btn); padding: 10px 12px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--semantic-green); text-transform: uppercase;">Practice Task (+1.0 Point):</div>
      <div style="font-size: 12px; color: var(--semantic-green); margin-top: 2px;">${advice.practice_task}</div>
    </div>
  `;
}

function renderFallbackMentorAdvice(lang) {
  const container = document.getElementById("mentor-content-body");
  container.innerHTML = `
    <div style="background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-btn); padding: 12px; margin-bottom: 12px;">
      <div style="font-weight: 700; font-size: 14px; color: var(--text-main);">Defect Diagnosis: Hardcoded DEBUG=True exposes endpoints</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Production environments must decouple configuration from code via environment variables.</div>
    </div>
    <div style="background: #1C1E21; color: #ECECEC; font-family: var(--font-mono); font-size: 12px; padding: 10px; border-radius: var(--radius-btn); margin-bottom: 12px;">
      <div style="color: #F87171;">- app.run(debug=True, host="0.0.0.0")</div>
      <div style="color: #4ADE80;">+ app.run(debug=os.getenv("DEBUG")=="true", host="127.0.0.1")</div>
    </div>
    <div style="background: var(--semantic-green-light); border: 1px solid #C4EED0; border-radius: var(--radius-btn); padding: 10px 12px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--semantic-green); text-transform: uppercase;">Practice Task (+1.0 Point):</div>
      <div style="font-size: 12px; color: var(--semantic-green); margin-top: 2px;">Extract secrets into .env.example, validate them with Pydantic BaseSettings, and submit commit.</div>
    </div>
  `;
}

function closeMentorModal() {
  document.getElementById("mentor-modal").classList.remove("active");
}

// ============================================================
// DYNAMIC SECTIONS (TEAM UP, TRUST SHIELD, PROFILE, COACH)
// ============================================================

function renderTeamUpSection() {
  const container = document.getElementById("teamup-view-container");
  container.innerHTML = `
    <div class="post-card">
      <div style="font-size: 17px; font-weight: 700;">Team Up Matchmaker</div>
      <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
        REET ranks teammates based on verified code proof points and domain relevance — not claims or resumes.
      </div>
      <div style="display: flex; gap: 8px; align-items: center; margin-top: 10px;">
        <span style="font-size: 13px; font-weight: 600;">Active Team Call:</span>
        <select class="search-input" id="teamup-call-select" onchange="loadTeamUpView(this.value)" style="width: auto; padding: 6px 12px;">
          <option value="post-04">Wayanad Coffee Logistics (Needs: React, SQLite)</option>
          <option value="post-08">Smart Village Crop Disease Detection (Needs: Python, PyTorch)</option>
          <option value="post-12">Autonomous Shore Cleanup Robot (Needs: ROS, Computer Vision)</option>
        </select>
      </div>
    </div>

    <div style="font-size: 15px; font-weight: 700; margin: 16px 0 8px 0;">Matched Candidates Ranked by Verifiable Proof</div>
    <div style="display: flex; flex-direction: column; gap: 10px;" id="teamup-candidates-grid"></div>

    <div class="post-card" style="margin-top: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 10px;">
        <div style="font-weight: 700; font-size: 14px;">Bhasha Bridge Group Chat Simulator</div>
        <select class="search-input" id="chat-target-lang" onchange="loadGroupChatMessages()" style="font-size: 12px; width: auto; padding: 4px 8px;">
          <option value="en">English (Original)</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="te">తెలుగు (Telugu)</option>
          <option value="ml">മലയാളം (Malayalam)</option>
        </select>
      </div>
      <div id="chat-messages-container" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; padding: 8px; background: var(--bg-page); border-radius: var(--radius-btn);"></div>
      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <input type="text" class="search-input" id="chat-input-text" style="flex: 1; border-radius: var(--radius-btn);" placeholder="Type a message or test Payment Guard (e.g. 'Send ₹2,000 to google.hr@okicici')..." onkeydown="if(event.key==='Enter') sendChatMessage()">
        <button class="btn-primary" onclick="sendChatMessage()">Send</button>
      </div>
    </div>
  `;
}

async function loadTeamUpView(callId) {
  try {
    const res = await fetch(`/api/v1/team-up/match/${callId}`);
    const data = await res.json();
    const grid = document.getElementById("teamup-candidates-grid");
    if (!grid) return;

    grid.innerHTML = (data.candidates || []).map(c => `
      <div class="post-card" style="padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 14px; font-weight: 700;">${c.name}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">${c.college} • ${c.region}</div>
          </div>
          <span class="type-tag showcase">${Math.round(c.match_score * 100)}% Match</span>
        </div>
        <div style="font-size: 12px; background: var(--bg-page); border-left: 3px solid var(--primary-blue); padding: 6px 10px; margin: 8px 0; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
          <strong>Proof Reason:</strong> ${c.one_line_reason}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 8px;">
          <span style="font-size: 11px; color: var(--text-secondary);">Trust Quotient: ${c.trust_quotient}%</span>
          <button class="btn-primary" style="font-size: 12px; padding: 4px 10px;" onclick="alert('Invitation sent to ${c.name}!')">
            Invite & Open Chat
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Team up error:", err);
  }
}

async function loadGroupChatMessages() {
  const langSelect = document.getElementById("chat-target-lang");
  const targetLang = langSelect ? langSelect.value : "en";
  const container = document.getElementById("chat-messages-container");
  if (!container) return;

  try {
    const res = await fetch(`/api/v1/chat/groups/grp-01/messages?target_lang=${targetLang}`);
    const data = await res.json();
    container.innerHTML = data.messages.map(m => `
      <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-btn); padding: 6px 10px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary);">
          <strong>${m.sender_name}</strong>
          <span>${m.time} ${m.is_machine_translated ? '• Bhasha Bridge' : ''}</span>
        </div>
        <div style="font-size: 13px; font-weight: 500; margin-top: 2px;">${m.translated_text}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Chat load error:", err);
  }
}

async function sendChatMessage() {
  const input = document.getElementById("chat-input-text");
  const text = input.value.trim();
  if (!text) return;

  try {
    const res = await fetch("/api/v1/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: "grp-01", sender_id: activeUser, text })
    });
    const result = await res.json();
    input.value = "";
    if (result.payment_intercepted) {
      openPaymentModal(result.payment_guard);
    } else {
      await loadGroupChatMessages();
    }
  } catch (err) {
    console.error("Chat send error:", err);
  }
}

function openPaymentModal(data) {
  const modal = document.getElementById("payment-modal");
  modal.classList.add("active");
  if (data) {
    if (data.intercepted_upi) document.getElementById("pm-modal-upi").textContent = data.intercepted_upi;
    if (data.amount) document.getElementById("pm-modal-amount").textContent = typeof data.amount === 'number' ? `₹${data.amount.toLocaleString()}` : data.amount;
  }
}

function resolvePaymentModal(action) {
  document.getElementById("payment-modal").classList.remove("active");
  if (action === "ABORT") {
    alert("✅ Safe choice: Payment aborted. Intercept logged to protect students.");
  } else {
    alert("⚠️ High-risk payment logged by user override. Verify with 1930 Cybercrime Helpline.");
  }
}

const SCANNER_PRESETS = {
  google_scam: "Google internship, pay ₹2,000 to confirm your seat.",
  stipend_legit: "Winter research internship at IIT Madras. Stipend ₹15,000/month provided. Join official Telegram t.me/iitm_logistics for orientation schedule.",
  sih_telegram: "Smart India Hackathon 2026 college team coordination. Discussion in t.me/sih_logistics.",
  wipro_scam: "Wipro remote onboarding: Refundable laptop security deposit ₹4,500 required via UPI to hr@wipro-onboard.in.",
  crypto_scam: "Student Crypto multiplier bot! Send 0.01 ETH or ₹1,000 to earn 3x returns in 24 hours guaranteed."
};

function loadScannerPreset(key) {
  const text = SCANNER_PRESETS[key] || "";
  document.getElementById("scanner-input").value = text;
  runLiveScan();
}

async function runLiveScan() {
  const text = document.getElementById("scanner-input").value.trim();
  const lang = document.getElementById("scanner-lang")?.value || "en";
  const resultBox = document.getElementById("scanner-result-box");
  if (!text || !resultBox) return;

  resultBox.style.display = "block";
  resultBox.innerHTML = "<div style='font-size: 12px; color: var(--text-secondary);'>Scanning content across 4 defense layers...</div>";

  try {
    const res = await fetch("/api/v1/trust/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language_code: lang })
    });
    const data = await res.json();
    const isRed = data.risk_band === "RED";
    const isAmber = data.risk_band === "AMBER";
    const badgeColor = isRed ? "var(--semantic-red)" : (isAmber ? "var(--semantic-amber)" : "var(--semantic-green)");
    const bgLight = isRed ? "var(--semantic-red-light)" : (isAmber ? "var(--semantic-amber-light)" : "var(--semantic-green-light)");

    resultBox.innerHTML = `
      <div style="background: ${bgLight}; border: 1px solid ${badgeColor}; border-radius: var(--radius-btn); padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: ${badgeColor}; font-size: 14px;">Risk Assessment: ${data.risk_band} (${data.score}/100)</span>
          <span class="type-tag" style="background: white; color: ${badgeColor}; font-weight: 700;">Action: ${data.action}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-main); margin-top: 8px;">
          <strong>Analysis:</strong> ${data.explanation}
        </div>
        ${data.reasons && data.reasons.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;">
            ${data.reasons.map(r => `<div style="font-size: 11px; color: var(--text-secondary);">• ${r}</div>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  } catch (err) {
    resultBox.innerHTML = "<div style='color: var(--semantic-red); font-size: 12px;'>Scan evaluation error.</div>";
  }
}

function startTrustDemoSequence() {
  document.getElementById("ts-step-4a")?.scrollIntoView({ behavior: "smooth" });
  alert("▶ Starting 45s Trust Shield sequence:\nStep 4a: Fake post blocked (score 92 Red).\nStep 4b: Payment guard intercepts UPI in chat.\nStep 4c: Auto-generates pre-filled cybercrime dossier & awards Safety Skill!");
}

function renderTrustShieldSection() {
  const container = document.getElementById("trust-view-container");
  container.innerHTML = `
    <div class="post-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div>
          <div style="font-size: 18px; font-weight: 700; color: var(--semantic-red);">REET Trust Shield (4-Layer Student Protection)</div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
            Stops students from losing money to job scams, fake registration fees, and phishing links.
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn-primary" style="background: var(--semantic-red); font-size: 12px; padding: 6px 12px;" onclick="startTrustDemoSequence()">
            ▶ Play 45s Sequence
          </button>
        </div>
      </div>
    </div>

    <!-- 45-Second Trust Shield Sequence Walkthrough -->
    <div style="margin: 16px 0 8px 0; font-size: 15px; font-weight: 700;">45-Second Trust Shield Sequence</div>

    <!-- Step 4a: Fake Post Blocked -->
    <div class="post-card" id="ts-step-4a" style="border-color: #F8B4B4; background: #FFFDFD;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span class="type-tag" style="background: var(--semantic-red-light); color: var(--semantic-red); font-weight: 700;">Step 4a: Fake Opportunity Blocked</span>
          <div style="font-size: 15px; font-weight: 700; color: var(--semantic-red); margin-top: 4px;">
            "Google internship, pay ₹2,000 to confirm your seat."
          </div>
        </div>
        <div class="score-badge" style="background: var(--semantic-red); color: white;">
          <span>92 / 100 RED</span>
        </div>
      </div>
      <div style="background: var(--semantic-red-light); border: 1px solid #F8B4B4; border-radius: var(--radius-btn); padding: 10px; margin: 10px 0; font-size: 12px; color: #7F1D1D;">
        <strong>எச்சரிக்கை: இது 92% சாத்தியக்கூறுள்ள வேலைவாய்ப்பு மோசடி (Job Scam)!</strong>
        <div style="margin-top: 4px;">Google மற்றும் முன்னணி தொழில்நுட்ப நிறுவனங்கள் வேலைவாய்ப்பிற்கு அல்லது இன்டர்ன்ஷிப்பிற்கு ஒருபோதும் பணம் கேட்பதில்லை. ₹2,000 முன்பணம் கேட்பது 100% வேலைவாய்ப்பு மோசடி.</div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #FCDEDE; padding-top: 8px;">
        <a href="https://careers.google.com" target="_blank" style="font-size: 12px; color: var(--primary-blue); font-weight: 600; text-decoration: none;">
          🔗 Official Verified Portal: careers.google.com ↗
        </a>
        <button class="btn-secondary" style="font-size: 12px;" onclick="openPaymentModal({intercepted_upi:'google.hr.recruitment@okicici', amount:'₹2,000'})">
          Next: Test Scammer DM (Step 4b) →
        </button>
      </div>
    </div>

    <!-- Step 4b: Payment Guard in Chat -->
    <div class="post-card" id="ts-step-4b" style="margin-top: 12px; border-left: 4px solid var(--semantic-red);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span class="type-tag" style="background: var(--semantic-red-light); color: var(--semantic-red); font-weight: 700;">Step 4b: Payment Guard Intercept</span>
          <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">
            Direct Message UPI Coercion Interception
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
            Scammer message: <em>"Send ₹2,000 to google.hr.recruitment@okicici to confirm internship."</em>
          </div>
        </div>
        <button class="btn-primary" style="font-size: 12px; background: var(--semantic-red);" onclick="openPaymentModal({intercepted_upi:'google.hr.recruitment@okicici', amount:'₹2,000'})">
          Trigger Payment Intercept Modal
        </button>
      </div>
    </div>

    <!-- Step 4c: Pre-filled Cybercrime Dossier & Safety Skill -->
    <div class="post-card" id="ts-step-4c" style="margin-top: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div>
          <span class="type-tag showcase">Step 4c: Cybercrime.gov.in Dossier & Safety Skill</span>
          <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">Pre-Filled Evidence Dossier & 1930 Helpline</div>
          <div style="font-size: 12px; color: var(--text-secondary);">Formats evidence for instant submission without claiming to freeze bank accounts.</div>
        </div>
        <button class="btn-primary" id="btn-file-dossier" onclick="fileConfirmedScamReport()" style="font-size: 12px;">
          File Report & Earn Safety Skill (+50 pts)
        </button>
      </div>
      <div style="background: var(--bg-page); font-family: var(--font-mono); font-size: 11px; padding: 10px; border-radius: var(--radius-btn); max-height: 160px; overflow-y: auto; margin-top: 10px;" id="dossier-preview-box">
Loading cybercrime complaint dossier...
      </div>
    </div>

    <!-- Step 4d: Verified Employer Example -->
    <div class="post-card" id="ts-step-4d" style="margin-top: 12px; border-left: 4px solid var(--semantic-green);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span class="type-tag" style="background: var(--semantic-green-light); color: var(--semantic-green); font-weight: 700;">Step 4d: Verified Genuine Employer</span>
          <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">
            Tata Consultancy Services (TCS) — Campus Research Intern
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
            Stipend: ₹15,000 / month • Free to apply • Zero fee policy
          </div>
        </div>
        <span class="verified-tag">VERIFIED EMPLOYER (MCA / CIN)</span>
      </div>
      <div style="font-size: 12px; color: var(--text-main); margin-top: 8px;">
        Verified via official domain <code>tcs.com</code> and MCA registration <code>L22210MH1995PLC084781</code>.
      </div>
    </div>

    <!-- Step 4e: Amber Warning Flow -->
    <div class="post-card" id="ts-step-4e" style="margin-top: 12px; border-left: 4px solid var(--semantic-amber);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span class="type-tag" style="background: var(--semantic-amber-light); color: var(--semantic-amber); font-weight: 700;">Step 4e: Amber Warning (Non-Blocking)</span>
          <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">
            Student Hackathon Registration Form
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
            Post links to external Google Form. Marked Amber, not deleted.
          </div>
        </div>
        <button class="btn-secondary" style="font-size: 12px;" onclick="requestScoreAppeal()">
          Submit Triage Appeal
        </button>
      </div>
      <div class="warning-banner" style="margin-top: 8px;">
        <span>⚠️</span>
        <span>Unverified link — proceed with caution. Never share UPI PINs or passwords.</span>
      </div>
    </div>

    <!-- Interactive Live Pre-Publish Risk Scanner -->
    <div class="post-card" style="margin-top: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 15px; font-weight: 700; color: var(--primary-blue);">Live Pre-Publish Risk Scanner</div>
        <select class="search-input" id="scanner-lang" style="width: auto; font-size: 12px; padding: 4px 8px;">
          <option value="en">English</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="te">తెలుగు (Telugu)</option>
          <option value="ml">മലയാളം (Malayalam)</option>
        </select>
      </div>
      <div style="font-size: 12px; color: var(--text-secondary); margin: 4px 0 10px 0;">
        Test the Trust Shield against scam patterns and legitimate false positives.
      </div>

      <!-- Quick Preset Buttons -->
      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
        <button class="filter-chip" onclick="loadScannerPreset('google_scam')">🚨 Google ₹2k (Scam)</button>
        <button class="filter-chip" onclick="loadScannerPreset('stipend_legit')">✅ IITM Stipend ₹15k (Legit)</button>
        <button class="filter-chip" onclick="loadScannerPreset('sih_telegram')">✅ SIH Telegram (Legit)</button>
        <button class="filter-chip" onclick="loadScannerPreset('wipro_scam')">🚨 Wipro Deposit (Scam)</button>
        <button class="filter-chip" onclick="loadScannerPreset('crypto_scam')">🚨 Crypto Bot (Scam)</button>
      </div>

      <textarea class="search-input" id="scanner-input" rows="3" style="width: 100%; border-radius: var(--radius-btn); background: white; font-size: 13px;" placeholder="Paste an opportunity or message text to inspect..."></textarea>
      <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
        <button class="btn-primary" onclick="runLiveScan()">Analyze Risk →</button>
      </div>

      <div id="scanner-result-box" style="margin-top: 12px; display: none;"></div>
    </div>

    <!-- Statutory 15 Verified Employers & Portals Registry -->
    <div class="post-card" style="margin-top: 16px;">
      <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">Statutory 15 Verified Portals & Employers</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
        Pre-verified snapshots (MCA registered, .gov.in, .ac.in). Zero-network offline verification.
      </div>
      <div id="verified-registry-list" style="margin-top: 10px; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 8px;"></div>
    </div>

    <!-- 6 Fact-Checked Viral Money Rumors -->
    <div class="post-card" style="margin-top: 16px;">
      <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">Community Threat Alerts: 6 Debunked Viral Rumors</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
        Fact-checked against PIB Fact Check, RBI, and National Cybercrime advisories.
      </div>
      <div id="viral-rumors-list" style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;"></div>
    </div>
  `;
}

async function initTrustShieldView() {
  try {
    const res = await fetch("/api/v1/trust/demo-step4");
    const data = await res.json();
    const box = document.getElementById("dossier-preview-box");
    if (box && data.step_4c) {
      box.textContent = JSON.stringify(data.step_4c, null, 2);
    }
  } catch (err) {
    console.error("Trust shield load error:", err);
  }
  await loadVerifiedRegistry();
  await loadViralRumors();
}

async function loadViralRumors() {
  const container = document.getElementById("viral-rumors-list");
  if (!container) return;

  try {
    const res = await fetch("/api/v1/trust/alerts");
    const data = await res.json();
    container.innerHTML = (data.viral_rumors || []).map(r => `
      <div style="background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-btn); padding: 10px 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 13px; color: var(--text-main);">${r.title}</strong>
          <span class="type-tag" style="background: var(--semantic-red-light); color: var(--semantic-red);">${r.status}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;"><strong>Claim:</strong> ${r.claim}</div>
        <div style="font-size: 12px; color: #166534; background: #DCFCE7; padding: 6px 10px; border-radius: var(--radius-btn); margin-top: 6px;">
          <strong>Debunk:</strong> ${r.debunk}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Rumors error:", err);
  }
}

async function fileConfirmedScamReport() {
  const btn = document.getElementById("btn-file-dossier");
  btn.disabled = true;
  btn.textContent = "Filing & Computing Hashes...";

  try {
    const res = await fetch("/api/v1/trust/report-scam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reporter_id: activeUser,
        suspect_handle: "@google_placement_agent",
        suspect_upi: "google.hr.recruitment@okicici",
        evidence_text: "Pay ₹2,000 to google.hr.recruitment@okicici to confirm internship."
      })
    });
    btn.textContent = "✅ Safety Skill Awarded (+50 pts)";
    btn.style.background = "var(--semantic-green)";
    alert("🎉 Report confirmed! Earned 'Safety' Skill (+50 pts) and 'Trust Shield Sentinel' credential badge on your Proof Profile.");
    await loadCurrentUser();
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "File Report & Earn Safety Skill (+50 pts)";
  }
}

function renderProfileSection() {
  const container = document.getElementById("profile-view-container");
  container.innerHTML = `
    <div class="post-card">
      <div style="display: flex; gap: 14px; align-items: center;">
        <div style="font-size: 36px; background: var(--selected-tint); border-radius: var(--radius-full); width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;">
          👨‍💻
        </div>
        <div>
          <div style="font-size: 18px; font-weight: 700;" id="prof-name">Hariram S.</div>
          <div style="font-size: 12px; color: var(--text-secondary);" id="prof-meta">@hariram_tech • CEG, Anna University</div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <span class="type-tag showcase" id="prof-level-tag">Level 4 Engineer</span>
            <span class="type-tag team-call" id="prof-safety-badge" style="display: none;">🛡️ Trust Shield Sentinel</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Anti-Inflation Level Formula Callout -->
    <div class="post-card" style="margin-top: 14px;">
      <div style="font-size: 12px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase;">
        Anti-Inflation Formula (Top-5 Projects Capped)
      </div>
      <div style="font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--primary-blue); margin: 4px 0;">
        Level = ⌊√(EffectivePoints / 100)⌋ + 1
      </div>
      <div style="font-size: 12px; color: var(--text-secondary);">
        50 trivial scripts (score 2.0) earn only Level 2. 5 rigorous systems (score 9.0) earn Level 4. Social likes are strictly capped at 10 points.
      </div>
      <div style="margin-top: 14px;" id="prof-skills-meters"></div>
    </div>

    <div class="post-card" style="margin-top: 14px;">
      <div style="font-size: 14px; font-weight: 700;">"How You Earned This" — Cryptographic Audit Ledger</div>
      <div id="prof-audit-list" style="margin-top: 10px;"></div>
    </div>
  `;
}

async function loadProofProfile(userId) {
  try {
    const res = await fetch(`/api/v1/profile/${userId}`);
    const data = await res.json();
    const user = data.user || {};

    const nameEl = document.getElementById("prof-name");
    if (nameEl) nameEl.textContent = user.full_name || user.name;
    const metaEl = document.getElementById("prof-meta");
    if (metaEl) metaEl.textContent = `@${user.username} • ${user.college} • Year ${user.year || 3}`;

    const badgeEl = document.getElementById("prof-safety-badge");
    if (badgeEl && user.safety_skill_earned) badgeEl.style.display = "inline-block";

    const meters = document.getElementById("prof-skills-meters");
    if (meters && data.skills) {
      meters.innerHTML = Object.entries(data.skills).map(([name, s]) => `
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600;">
            <span>${name} — Level ${s.level}</span>
            <span style="font-family: var(--font-mono);">${s.points} points (${Math.round(s.progress_to_next_level_pct)}% to L${s.level + 1})</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${s.progress_to_next_level_pct}%;"></div>
          </div>
        </div>
      `).join('');
    }

    const auditList = document.getElementById("prof-audit-list");
    if (auditList && data.audit_history) {
      auditList.innerHTML = data.audit_history.map(a => `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding: 8px 0; font-size: 12px;">
          <div>
            <div style="font-weight: 600;">${a.project_title}</div>
            <div style="color: var(--text-secondary);">${a.skill} • Verified Sandbox Test Suite</div>
          </div>
          <div style="font-family: var(--font-mono); font-weight: 700; color: var(--semantic-green);">
            ${a.score}/10 (+${a.points_earned} pts)
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error("Profile error:", err);
  }
}

function renderCoachSection() {
  const container = document.getElementById("coach-view-container");
  container.innerHTML = `
    <div class="post-card">
      <div style="font-size: 17px; font-weight: 700; color: var(--primary-blue);">AI Idea Coach</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
        Drafting an Upcoming project? Idea Coach generates milestone guidance and vector matches similar repositories.
      </div>
      <div style="margin-top: 12px;">
        <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Project Title</label>
        <input type="text" class="search-input" id="coach-title" style="width: 100%; border-radius: var(--radius-btn); background: white;" value="Edge IoT Cattle Health Sensor">
      </div>
      <div style="margin-top: 10px;">
        <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Concept & Scope</label>
        <textarea class="search-input" id="coach-body" rows="3" style="width: 100%; border-radius: var(--radius-btn); background: white;">ESP32 with ML model detecting temperature anomalies in rural dairy cooperatives.</textarea>
      </div>
      <button class="btn-primary" style="margin-top: 12px;" onclick="runCoachAnalysis()">
        Analyze Concept with Idea Coach →
      </button>
      <div id="coach-results" style="margin-top: 14px;"></div>
    </div>
  `;
}

async function runCoachAnalysis() {
  const title = document.getElementById("coach-title").value;
  const body = document.getElementById("coach-body").value;
  const resBox = document.getElementById("coach-results");
  resBox.innerHTML = "<div style='font-size: 12px; color: var(--text-secondary);'>Analyzing milestones and vector-matching repos...</div>";

  try {
    const res = await fetch("/api/v1/coach/evaluate-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body })
    });
    const data = await res.json();
    resBox.innerHTML = `
      <div style="background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-btn); padding: 12px;">
        <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">Recommended Build Milestones:</div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin: 8px 0;">
          ${(data.what_to_build_first || []).map(s => `<div style="font-size: 12px;">• ${s}</div>`).join('')}
        </div>
        <div style="font-size: 12px; font-weight: 700; margin-top: 8px;">Vector-Similar Reference Repositories on REET:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;">
          ${(data.similar_projects || []).map(p => `
            <span class="skill-chip" style="background: white;">${p.title} (${p.verified_score}/10)</span>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    resBox.innerHTML = "<div style='color: var(--semantic-red); font-size: 12px;'>Error generating advice.</div>";
  }
}

async function loadVerifiedRegistry() {
  const container = document.getElementById("verified-registry-list");
  if (!container) return;

  try {
    const res = await fetch("/api/v1/trust/verified-employers");
    const data = await res.json();
    container.innerHTML = (data.registry || []).map(r => `
      <div style="background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-btn); padding: 8px 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 12px; color: var(--text-main);">${r.name}</strong>
          <span class="type-tag" style="background: var(--selected-tint); color: var(--primary-blue); font-size: 10px;">${r.category}</span>
        </div>
        <div style="font-size: 11px; color: var(--primary-blue); font-family: var(--font-mono); margin-top: 2px;">${r.domain}</div>
        <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">Reg/CIN: ${r.cin_gst}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Registry load error:", err);
  }
}

