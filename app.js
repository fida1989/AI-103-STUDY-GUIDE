// AI-103 Study Guide Web Application Logic

// Global State
const STATE = {
  activeView: "modules",
  theme: localStorage.getItem("ai103_theme") || "dark",
  masteredModules: JSON.parse(localStorage.getItem("ai103_mastered") || "[]"),
  masteredFlashcards: JSON.parse(localStorage.getItem("ai103_fc_mastered") || "[]"),
  
  // Flashcard state
  fcIndex: 0,
  fcFilter: "ALL",
  fcFlipped: false,
  fcList: [],
  
  // Quiz & Exam state
  quizMode: "practice", // 'practice' or 'timed'
  quizFilterDomain: "ALL",
  quizQuestions: [],
  currentQuestionIdx: 0,
  userAnswers: {}, // { questionId: selectedIndex }
  flaggedQuestions: new Set(),
  examTimeRemaining: 100 * 60, // 100 minutes in seconds
  examTimerInterval: null,
  quizSubmitted: false,
  
  // Architecture diagram state
  activeDiagramId: "rag-flow",
  activeNodeId: "chunk"
};

// Architecture Diagram Configurations
const ARCHITECTURE_DATA = {
  "rag-flow": {
    title: "Enterprise Grounded RAG Pipeline",
    description: "The complete lifecycle of ingesting documents into Azure AI Search, executing hybrid retrieval with Semantic Ranker, and grounding LLM generation with citations.",
    nodes: [
      {
        id: "ingest",
        step: "Step 1",
        title: "Document Cracking",
        desc: "OCR & Document Intelligence",
        details: "Raw PDFs, scanned images, and forms are cracked using Azure AI Document Intelligence prebuilt-layout. Setting output_content_format='markdown' preserves tables and section headings."
      },
      {
        id: "chunk",
        step: "Step 2",
        title: "Semantic Chunking",
        desc: "Overlap & Header-Aware Split",
        details: "Text is chunked into 500-1000 token segments with 10-15% overlap. Header-aware chunking keeps sections together, ensuring semantic continuity."
      },
      {
        id: "embed",
        step: "Step 3",
        title: "Vector Embedding",
        desc: "text-embedding-3-small/large",
        details: "Each chunk is transformed into a high-dimensional vector (1536 or 3072 dimensions) and indexed into Azure AI Search with cosine similarity."
      },
      {
        id: "hybrid",
        step: "Step 4",
        title: "Hybrid Search + RRF",
        desc: "Vector + BM25 Lexical",
        details: "Queries run both vector similarity search and BM25 keyword matching concurrently. Reciprocal Rank Fusion (RRF: sum(1/(60+rank))) combines scores seamlessly."
      },
      {
        id: "semantic",
        step: "Step 5",
        title: "Semantic Ranker",
        desc: "L2 Deep Transformer",
        details: "Microsoft Turing transformer re-ranks top 50 hybrid results, computing semantic relevance scores (0-4) and extracting extractive answers."
      },
      {
        id: "ground",
        step: "Step 6",
        title: "LLM Grounding & Citations",
        desc: "Prompt Shield + GPT-4o",
        details: "Retrieved snippets are injected into system prompt as verified context. GPT-4o generates answers with grounded citations ([doc1], [doc2])."
      }
    ]
  },
  "agent-lifecycle": {
    title: "Azure AI Agent Service Execution Lifecycle",
    description: "State machine of an agent run: from user query, tool resolution, requires_action event loop, to final message completion.",
    nodes: [
      {
        id: "create",
        step: "Step 1",
        title: "Agent & Thread Init",
        desc: "Role, Tools & Session State",
        details: "An Agent is configured with instructions, model, and tool definitions (Code Interpreter, File Search, Custom Functions). A persistent Thread holds the conversation."
      },
      {
        id: "trigger",
        step: "Step 2",
        title: "Run Creation",
        desc: "Client initiates Run",
        details: "Client posts user message to the Thread and triggers a Run. Run enters 'queued' then 'in_progress'."
      },
      {
        id: "tool-eval",
        step: "Step 3",
        title: "Tool Decision",
        desc: "Model selects Tool Schema",
        details: "Model evaluates user intent against tool JSON schemas. If a custom function call is needed, status transitions to 'requires_action'."
      },
      {
        id: "action",
        step: "Step 4",
        title: "Host Function Execution",
        desc: "requires_action State",
        details: "The host application intercepts requires_action, parses tool_calls arguments, executes local database or API code, and prepares tool_outputs."
      },
      {
        id: "submit",
        step: "Step 5",
        title: "Submit Tool Outputs",
        desc: "submit_tool_outputs_to_run",
        details: "App submits outputs back to Agent Service. The model consumes tool responses and resumes reasoning."
      },
      {
        id: "complete",
        step: "Step 6",
        title: "Run Completion",
        desc: "status = 'completed'",
        details: "Agent appends assistant message to the Thread. Host application displays final response with synthesized facts."
      }
    ]
  },
  "safety-pipeline": {
    title: "Responsible AI & Content Safety Guardrail Pipeline",
    description: "Multilayer defense architecture protecting against jailbreaks, prompt injection, harmful content, and IP infringement.",
    nodes: [
      {
        id: "prompt-shield",
        step: "Step 1",
        title: "Prompt Shields",
        desc: "Direct & Indirect Injection Check",
        details: "Scans input user prompts and retrieved external documents for adversarial instructions ('Ignore all previous rules', jailbreaks)."
      },
      {
        id: "input-safety",
        step: "Step 2",
        title: "Input Content Safety",
        desc: "4 Severity Levels (0,2,4,6)",
        details: "Azure AI Content Safety analyzes text and images across Hate, Sexual, Violence, and Self-Harm. If threshold exceeded, request halts immediately."
      },
      {
        id: "inference",
        step: "Step 3",
        title: "Constrained Inference",
        desc: "System Framing & Tool Gates",
        details: "Foundation model executes with strict system instructions, least-privilege tool schemas, and human-in-the-loop gates for high-risk tools."
      },
      {
        id: "groundedness-chk",
        step: "Step 4",
        title: "Groundedness & Copyright",
        desc: "Hallucination & IP Scan",
        details: "Output is verified against source context. Protected Material detector checks for copyrighted song lyrics, books, or proprietary code."
      },
      {
        id: "provenance",
        step: "Step 5",
        title: "Provenance & C2PA",
        desc: "Content Credentials & Audit",
        details: "AI outputs (especially images/media) receive cryptographically signed C2PA provenance metadata. Audit events are dispatched to Application Insights."
      }
    ]
  }
};

// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  initHeroToggle();
  initModulesView();
  initFlashcardsView();
  initQuizView();
  initDiagramsView();
  initCheatsheetView();
  initDiagnosticView();
  updateGlobalProgress();
  setupKeyboardShortcuts();
});

// Hero Banner Collapse Toggle
function initHeroToggle() {
  const heroBanner = document.getElementById("heroBanner");
  const toggleBtn = document.getElementById("heroToggleBtn");
  if (!heroBanner || !toggleBtn) return;
  
  const isMinimized = localStorage.getItem("ai103_hero_minimized") === "true";
  if (isMinimized) {
    heroBanner.classList.add("minimized");
    updateHeroBtn(toggleBtn, true);
  }
  
  toggleBtn.addEventListener("click", () => {
    const willMinimize = !heroBanner.classList.contains("minimized");
    heroBanner.classList.toggle("minimized", willMinimize);
    localStorage.setItem("ai103_hero_minimized", willMinimize ? "true" : "false");
    updateHeroBtn(toggleBtn, willMinimize);
  });
}

function updateHeroBtn(btn, isMinimized) {
  const textEl = btn.querySelector(".hero-toggle-text");
  const iconEl = btn.querySelector(".hero-toggle-icon");
  if (textEl) textEl.innerText = isMinimized ? "Expand Overview" : "Minimize";
  if (iconEl) iconEl.innerText = isMinimized ? "+" : "−";
}

// Theme Management
function initTheme() {
  document.documentElement.setAttribute("data-theme", STATE.theme);
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      STATE.theme = STATE.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", STATE.theme);
      localStorage.setItem("ai103_theme", STATE.theme);
      showToast(`Switched to ${STATE.theme} mode`);
    });
  }
}

// Navigation & View Router
function initNavigation() {
  const navLinks = document.querySelectorAll("[data-view-target]");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = link.getAttribute("data-view-target");
      switchView(targetView);
    });
  });
}

function switchView(viewName) {
  STATE.activeView = viewName;
  
  // Update nav links
  document.querySelectorAll("[data-view-target]").forEach(l => {
    l.classList.toggle("active", l.getAttribute("data-view-target") === viewName);
  });
  
  // Update views
  document.querySelectorAll(".view-section").forEach(sec => {
    sec.classList.remove("active");
  });
  
  const targetSection = document.getElementById(`view-${viewName}`);
  if (targetSection) {
    targetSection.classList.add("active");
  }
  
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- MODULES & CURRICULUM VIEW ---
function initModulesView() {
  renderCurriculum();
  setupCurriculumFilters();
}

function renderCurriculum(filterDomain = "ALL", searchQuery = "") {
  const container = document.getElementById("modulesContainer");
  if (!container) return;
  
  container.innerHTML = "";
  
  CURRICULUM_DATA.forEach(domain => {
    if (filterDomain !== "ALL" && domain.code !== filterDomain) return;
    
    // Filter modules based on search
    const matchingModules = domain.modules.filter(m => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = m.title.toLowerCase().includes(q);
      const overviewMatch = m.overview.toLowerCase().includes(q);
      const skillsMatch = m.skills.some(s => s.toLowerCase().includes(q));
      const conceptMatch = m.keyConcepts.some(c => c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q));
      return titleMatch || overviewMatch || skillsMatch || conceptMatch;
    });
    
    if (matchingModules.length === 0) return;
    
    const domainGroup = document.createElement("div");
    domainGroup.className = "domain-group";
    
    domainGroup.innerHTML = `
      <div class="domain-group-header">
        <div class="domain-group-title-area">
          <span class="domain-code-pill">${domain.code}</span>
          <h2>${domain.title}</h2>
        </div>
        <span class="domain-weight-badge">Exam Weight: ${domain.weight}</span>
      </div>
      <div class="modules-list" id="list-${domain.id}"></div>
    `;
    
    container.appendChild(domainGroup);
    const modulesList = domainGroup.querySelector(`#list-${domain.id}`);
    
    matchingModules.forEach(mod => {
      const isMastered = STATE.masteredModules.includes(mod.id);
      const card = document.createElement("div");
      card.className = "module-card";
      card.id = `mod-card-${mod.id}`;
      
      let conceptsHtml = mod.keyConcepts.map(c => `
        <div class="concept-card">
          <h5>${escapeHtml(c.term)}</h5>
          <p>${escapeHtml(c.definition)}</p>
        </div>
      `).join("");
      
      let skillsHtml = mod.skills.map(s => `<li>${escapeHtml(s)}</li>`).join("");
      
      let trapsHtml = mod.examTraps && mod.examTraps.length > 0 ? `
        <div class="exam-traps-callout">
          <h4>⚠️ Pro Tips & Exam Traps</h4>
          <ul>
            ${mod.examTraps.map(t => `<li>${escapeHtml(t)}</li>`).join("")}
          </ul>
        </div>
      ` : "";
      
      let tableHtml = "";
      if (mod.comparisonTable) {
        tableHtml = `
          <div class="table-responsive">
            <table class="curriculum-table">
              <thead>
                <tr>
                  ${mod.comparisonTable.headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${mod.comparisonTable.rows.map(row => `
                  <tr>
                    ${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `;
      }
      
      let codeHtml = "";
      if (mod.codeSnippet) {
        codeHtml = `
          <div class="code-box">
            <div class="code-header">
              <span class="code-title">💻 ${escapeHtml(mod.codeSnippet.title)} (${mod.codeSnippet.language})</span>
              <button class="btn-copy" onclick="copySnippet('${mod.id}')">Copy Code</button>
            </div>
            <pre><code id="code-${mod.id}">${escapeHtml(mod.codeSnippet.code)}</code></pre>
          </div>
        `;
      }
      
      card.innerHTML = `
        <div class="module-card-header" onclick="toggleModuleExpand('${mod.id}')">
          <div class="module-header-left">
            <input type="checkbox" class="checkbox-mastered" 
                   id="chk-${mod.id}" 
                   ${isMastered ? "checked" : ""} 
                   onclick="event.stopPropagation(); toggleMastered('${mod.id}')">
            <div class="module-title-box">
              <h3>${escapeHtml(mod.title)}</h3>
              <span class="skills-count-badge">${mod.skills.length} Skills Evaluated</span>
            </div>
          </div>
          <button class="module-expand-btn" aria-label="Expand module">▼</button>
        </div>
        <div class="module-card-body">
          <div class="skills-list-container">
            <h4>Target Skills Measured</h4>
            <ul>${skillsHtml}</ul>
          </div>
          <p class="module-overview-text">${escapeHtml(mod.overview)}</p>
          <div class="key-concepts-grid">${conceptsHtml}</div>
          ${tableHtml}
          ${codeHtml}
          ${trapsHtml}
        </div>
      `;
      
      modulesList.appendChild(card);
    });
  });
}

function toggleModuleExpand(moduleId) {
  const card = document.getElementById(`mod-card-${moduleId}`);
  if (card) {
    card.classList.toggle("expanded");
  }
}

function toggleMastered(moduleId) {
  const idx = STATE.masteredModules.indexOf(moduleId);
  if (idx >= 0) {
    STATE.masteredModules.splice(idx, 1);
  } else {
    STATE.masteredModules.push(moduleId);
    showToast("Marked as Mastered! 🎉");
  }
  localStorage.setItem("ai103_mastered", JSON.stringify(STATE.masteredModules));
  updateGlobalProgress();
}

function setupCurriculumFilters() {
  const searchInput = document.getElementById("moduleSearchInput");
  const pills = document.querySelectorAll(".filter-pill[data-filter-domain]");
  
  let currentDomain = "ALL";
  
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderCurriculum(currentDomain, e.target.value.trim());
    });
  }
  
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentDomain = pill.getAttribute("data-filter-domain");
      const q = searchInput ? searchInput.value.trim() : "";
      renderCurriculum(currentDomain, q);
    });
  });
}

// Global Progress Calculation
function updateGlobalProgress() {
  let totalModules = 0;
  CURRICULUM_DATA.forEach(d => totalModules += d.modules.length);
  
  const masteredCount = STATE.masteredModules.length;
  const pct = totalModules > 0 ? Math.round((masteredCount / totalModules) * 100) : 0;
  
  const progressBar = document.getElementById("heroProgressBar");
  const progressText = document.getElementById("heroProgressPercent");
  const statsText = document.getElementById("heroProgressStats");
  
  if (progressBar) progressBar.style.width = `${pct}%`;
  if (progressText) progressText.innerText = `${pct}%`;
  if (statsText) statsText.innerText = `${masteredCount} of ${totalModules} Objectives Mastered`;
}

// --- FLASHCARDS ENGINE ---
function initFlashcardsView() {
  STATE.fcList = [...FLASHCARDS_DATA];
  
  const cardScene = document.getElementById("flashcardScene");
  const cardEl = document.getElementById("flashcardElement");
  const filterSelect = document.getElementById("fcDomainFilter");
  const prevBtn = document.getElementById("fcPrevBtn");
  const nextBtn = document.getElementById("fcNextBtn");
  const shuffleBtn = document.getElementById("fcShuffleBtn");
  const markKnownBtn = document.getElementById("fcMarkKnownBtn");
  
  if (cardScene && cardEl) {
    cardScene.addEventListener("click", () => {
      STATE.fcFlipped = !STATE.fcFlipped;
      cardEl.classList.toggle("flipped", STATE.fcFlipped);
    });

    // Mobile touch swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;
    cardScene.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    cardScene.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 45) {
        if (swipeDistance < 0) {
          // Swiped left -> Next
          if (nextBtn) nextBtn.click();
        } else {
          // Swiped right -> Previous
          if (prevBtn) prevBtn.click();
        }
      }
    }
  }
  
  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      STATE.fcFilter = e.target.value;
      if (STATE.fcFilter === "ALL") {
        STATE.fcList = [...FLASHCARDS_DATA];
      } else {
        STATE.fcList = FLASHCARDS_DATA.filter(fc => fc.domain === STATE.fcFilter);
      }
      STATE.fcIndex = 0;
      STATE.fcFlipped = false;
      renderCurrentFlashcard();
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (STATE.fcIndex > 0) {
        STATE.fcIndex--;
        STATE.fcFlipped = false;
        renderCurrentFlashcard();
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (STATE.fcIndex < STATE.fcList.length - 1) {
        STATE.fcIndex++;
        STATE.fcFlipped = false;
        renderCurrentFlashcard();
      }
    });
  }
  
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      STATE.fcList.sort(() => Math.random() - 0.5);
      STATE.fcIndex = 0;
      STATE.fcFlipped = false;
      renderCurrentFlashcard();
      showToast("Flashcards Shuffled! 🔀");
    });
  }
  
  if (markKnownBtn) {
    markKnownBtn.addEventListener("click", () => {
      const curCard = STATE.fcList[STATE.fcIndex];
      if (!curCard) return;
      
      const idx = STATE.masteredFlashcards.indexOf(curCard.id);
      if (idx === -1) {
        STATE.masteredFlashcards.push(curCard.id);
        showToast("Marked card as Known! 👍");
      } else {
        STATE.masteredFlashcards.splice(idx, 1);
        showToast("Card moved back to Review");
      }
      localStorage.setItem("ai103_fc_mastered", JSON.stringify(STATE.masteredFlashcards));
      renderCurrentFlashcard();
    });
  }
  
  renderCurrentFlashcard();
}

function renderCurrentFlashcard() {
  const cardEl = document.getElementById("flashcardElement");
  const countEl = document.getElementById("fcCounter");
  const tagEl = document.getElementById("fcTag");
  const domainBadge = document.getElementById("fcDomainBadge");
  const frontText = document.getElementById("fcFrontText");
  const backText = document.getElementById("fcBackText");
  const knownBtn = document.getElementById("fcMarkKnownBtn");
  
  if (!cardEl || STATE.fcList.length === 0) return;
  
  cardEl.classList.toggle("flipped", STATE.fcFlipped);
  
  const card = STATE.fcList[STATE.fcIndex];
  const isMastered = STATE.masteredFlashcards.includes(card.id);
  
  if (countEl) countEl.innerText = `${STATE.fcIndex + 1} / ${STATE.fcList.length}`;
  if (tagEl) tagEl.innerText = card.tag;
  if (domainBadge) domainBadge.innerText = `${card.domain} • ${card.domainTitle}`;
  if (frontText) frontText.innerHTML = escapeHtml(card.front);
  if (backText) backText.innerHTML = card.back.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  
  if (knownBtn) {
    knownBtn.innerHTML = isMastered ? "✓ Mastered" : "Mark as Mastered";
    knownBtn.className = isMastered ? "btn-primary" : "btn-secondary";
  }
}

// --- QUIZ & EXAM ENGINE ---
function initQuizView() {
  setupQuizControls();
}

function setupQuizControls() {
  const practiceTabBtn = document.getElementById("quizTabPractice");
  const examTabBtn = document.getElementById("quizTabExam");
  const domainFilter = document.getElementById("quizDomainSelect");
  
  if (practiceTabBtn && examTabBtn) {
    practiceTabBtn.addEventListener("click", () => {
      practiceTabBtn.classList.add("btn-primary");
      practiceTabBtn.classList.remove("btn-secondary");
      examTabBtn.classList.add("btn-secondary");
      examTabBtn.classList.remove("btn-primary");
      startQuiz("practice");
    });
    
    examTabBtn.addEventListener("click", () => {
      examTabBtn.classList.add("btn-primary");
      examTabBtn.classList.remove("btn-secondary");
      practiceTabBtn.classList.add("btn-secondary");
      practiceTabBtn.classList.remove("btn-primary");
      startQuiz("timed");
    });
  }
  
  if (domainFilter) {
    domainFilter.addEventListener("change", (e) => {
      STATE.quizFilterDomain = e.target.value;
      startQuiz(STATE.quizMode);
    });
  }
  
  startQuiz("practice");
}

function startQuiz(mode) {
  STATE.quizMode = mode;
  STATE.currentQuestionIdx = 0;
  STATE.userAnswers = {};
  STATE.flaggedQuestions.clear();
  STATE.quizSubmitted = false;
  clearInterval(STATE.examTimerInterval);
  
  if (mode === "timed") {
    STATE.quizQuestions = [...PRACTICE_QUESTIONS].sort(() => Math.random() - 0.5);
    STATE.examTimeRemaining = 100 * 60; // 100 minutes
    startExamTimer();
    const timerBox = document.getElementById("quizTimerDisplay");
    if (timerBox) timerBox.style.display = "flex";
  } else {
    if (STATE.quizFilterDomain === "ALL") {
      STATE.quizQuestions = [...PRACTICE_QUESTIONS];
    } else {
      STATE.quizQuestions = PRACTICE_QUESTIONS.filter(q => q.domain === STATE.quizFilterDomain);
    }
    const timerBox = document.getElementById("quizTimerDisplay");
    if (timerBox) timerBox.style.display = "none";
  }
  
  renderQuizInterface();
}

function startExamTimer() {
  const timerText = document.getElementById("quizTimerText");
  STATE.examTimerInterval = setInterval(() => {
    STATE.examTimeRemaining--;
    if (STATE.examTimeRemaining <= 0) {
      clearInterval(STATE.examTimerInterval);
      submitQuiz();
      alert("Exam time expired! Your exam has been automatically submitted.");
      return;
    }
    const mins = Math.floor(STATE.examTimeRemaining / 60);
    const secs = STATE.examTimeRemaining % 60;
    if (timerText) {
      timerText.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  }, 1000);
}

function renderQuizInterface() {
  const container = document.getElementById("quizActiveArea");
  const reportArea = document.getElementById("quizReportArea");
  if (!container) return;
  
  if (STATE.quizSubmitted) {
    container.style.display = "none";
    if (reportArea) reportArea.style.display = "block";
    renderScoreReport();
    return;
  }
  
  container.style.display = "block";
  if (reportArea) reportArea.style.display = "none";
  
  if (STATE.quizQuestions.length === 0) {
    container.innerHTML = `<div class="quiz-card"><p>No questions found for the selected domain.</p></div>`;
    return;
  }
  
  const q = STATE.quizQuestions[STATE.currentQuestionIdx];
  const userAns = STATE.userAnswers[q.id];
  const isAnswered = userAns !== undefined;
  const isFlagged = STATE.flaggedQuestions.has(q.id);
  
  let optionsHtml = q.options.map((opt, idx) => {
    const letters = ["A", "B", "C", "D"];
    let btnClass = "option-btn";
    
    if (STATE.quizMode === "practice" && isAnswered) {
      if (idx === q.correctAnswer) {
        btnClass += " correct";
      } else if (idx === userAns) {
        btnClass += " incorrect";
      }
    } else if (userAns === idx) {
      btnClass += " selected";
    }
    
    return `
      <button class="${btnClass}" 
              onclick="selectQuizOption(${idx})" 
              ${STATE.quizMode === "practice" && isAnswered ? "disabled" : ""}>
        <span class="option-letter">${letters[idx]}</span>
        <span>${escapeHtml(opt)}</span>
      </button>
    `;
  }).join("");
  
  let rationaleHtml = "";
  if (STATE.quizMode === "practice" && isAnswered) {
    const isCorrect = userAns === q.correctAnswer;
    rationaleHtml = `
      <div class="rationale-box ${isCorrect ? "" : "wrong"}">
        <div class="rationale-title">
          <span>${isCorrect ? "✓ Correct!" : "✗ Incorrect"}</span>
        </div>
        <p class="rationale-text">${escapeHtml(q.explanation)}</p>
        <ul class="distractor-list">
          ${q.distractors.map(d => `<li>${escapeHtml(d)}</li>`).join("")}
        </ul>
      </div>
    `;
  }
  
  const diffClass = q.difficulty.replace(/\s+/g, '-');
  
  container.innerHTML = `
    <div class="quiz-card">
      <div class="question-meta-row">
        <div>
          <span class="domain-code-pill">${q.domain}</span>
          <span style="font-size: 0.85rem; color: var(--text-secondary); margin-left: 0.5rem;">${escapeHtml(q.domainTitle)}</span>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <span class="question-difficulty-tag ${diffClass}">${q.difficulty}</span>
          <button class="btn-secondary" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;" onclick="toggleFlagQuestion('${q.id}')">
            ${isFlagged ? "🚩 Flagged" : "⚐ Flag"}
          </button>
        </div>
      </div>
      
      <div class="question-text">${escapeHtml(q.question)}</div>
      
      <div class="options-list">${optionsHtml}</div>
      
      ${rationaleHtml}
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        <span style="font-size: 0.85rem; color: var(--text-secondary);">
          Question ${STATE.currentQuestionIdx + 1} of ${STATE.quizQuestions.length}
        </span>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn-secondary" onclick="prevQuizQuestion()" ${STATE.currentQuestionIdx === 0 ? "disabled" : ""}>
            ← Previous
          </button>
          ${STATE.currentQuestionIdx === STATE.quizQuestions.length - 1
            ? `<button class="btn-primary" onclick="submitQuiz()">Submit Exam</button>`
            : `<button class="btn-primary" onclick="nextQuizQuestion()">Next →</button>`
          }
        </div>
      </div>
    </div>
  `;
}

function selectQuizOption(optionIdx) {
  const q = STATE.quizQuestions[STATE.currentQuestionIdx];
  if (!q) return;
  STATE.userAnswers[q.id] = optionIdx;
  renderQuizInterface();
}

function toggleFlagQuestion(questionId) {
  if (STATE.flaggedQuestions.has(questionId)) {
    STATE.flaggedQuestions.delete(questionId);
  } else {
    STATE.flaggedQuestions.add(questionId);
    showToast("Question flagged for review 🚩");
  }
  renderQuizInterface();
}

function prevQuizQuestion() {
  if (STATE.currentQuestionIdx > 0) {
    STATE.currentQuestionIdx--;
    renderQuizInterface();
  }
}

function nextQuizQuestion() {
  if (STATE.currentQuestionIdx < STATE.quizQuestions.length - 1) {
    STATE.currentQuestionIdx++;
    renderQuizInterface();
  }
}

function submitQuiz() {
  clearInterval(STATE.examTimerInterval);
  STATE.quizSubmitted = true;
  renderQuizInterface();
}

function renderScoreReport() {
  const reportArea = document.getElementById("quizReportArea");
  if (!reportArea) return;
  
  let correctCount = 0;
  const domainBreakdown = {};
  
  STATE.quizQuestions.forEach(q => {
    if (!domainBreakdown[q.domain]) {
      domainBreakdown[q.domain] = { title: q.domainTitle, total: 0, correct: 0 };
    }
    domainBreakdown[q.domain].total++;
    
    if (STATE.userAnswers[q.id] === q.correctAnswer) {
      correctCount++;
      domainBreakdown[q.domain].correct++;
    }
  });
  
  const total = STATE.quizQuestions.length;
  const rawPct = total > 0 ? (correctCount / total) : 0;
  // Microsoft scale is 1000 with 700 passing score
  const scaledScore = Math.round(rawPct * 1000);
  const isPassed = scaledScore >= 700;
  
  let rowsHtml = Object.keys(domainBreakdown).map(dKey => {
    const d = domainBreakdown[dKey];
    const pct = Math.round((d.correct / d.total) * 100);
    return `
      <tr>
        <td><strong>${dKey}</strong>: ${escapeHtml(d.title)}</td>
        <td>${d.correct} / ${d.total}</td>
        <td><strong>${pct}%</strong></td>
      </tr>
    `;
  }).join("");
  
  reportArea.innerHTML = `
    <div class="score-report-card">
      <div class="score-circle ${isPassed ? "" : "fail"}">
        ${scaledScore}
      </div>
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">
          ${isPassed ? "Congratulations! You Passed! 🎉" : "Needs Further Review"}
        </h2>
        <p style="color: var(--text-secondary);">
          Passing Benchmark: 700 / 1000 • Your Result: ${correctCount} of ${total} Correct (${Math.round(rawPct * 100)}%)
        </p>
      </div>
      
      <div class="table-responsive score-breakdown-table">
        <table class="curriculum-table">
          <thead>
            <tr>
              <th>Exam Domain</th>
              <th>Score</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      
      <div style="display: flex; gap: 1rem; margin-top: 1rem;">
        <button class="btn-primary" onclick="startQuiz('${STATE.quizMode}')">Retake Exam</button>
        <button class="btn-secondary" onclick="switchView('modules')">Review Curriculum</button>
      </div>
    </div>
  `;
}

// --- INTERACTIVE ARCHITECTURE DIAGRAMS ---
function initDiagramsView() {
  const tabs = document.querySelectorAll(".diagram-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      STATE.activeDiagramId = tab.getAttribute("data-diagram-id");
      const diag = ARCHITECTURE_DATA[STATE.activeDiagramId];
      if (diag && diag.nodes.length > 0) {
        STATE.activeNodeId = diag.nodes[0].id;
      }
      renderDiagram();
    });
  });
  
  renderDiagram();
}

function renderDiagram() {
  const diag = ARCHITECTURE_DATA[STATE.activeDiagramId];
  const canvas = document.getElementById("diagramCanvasArea");
  if (!diag || !canvas) return;
  
  let nodesHtml = diag.nodes.map((node, i) => {
    const isActive = node.id === STATE.activeNodeId;
    const arrow = i < diag.nodes.length - 1 ? `<div class="flow-arrow"><span class="arrow-desktop">→</span><span class="arrow-mobile">↓</span></div>` : "";
    return `
      <div class="flow-node ${isActive ? "active" : ""}" onclick="selectDiagramNode('${node.id}')">
        <div class="flow-node-step">${node.step}</div>
        <div class="flow-node-title">${escapeHtml(node.title)}</div>
        <div class="flow-node-desc">${escapeHtml(node.desc)}</div>
      </div>
      ${arrow}
    `;
  }).join("");
  
  const activeNode = diag.nodes.find(n => n.id === STATE.activeNodeId) || diag.nodes[0];
  
  canvas.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--azure-cyan);">${escapeHtml(diag.title)}</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 700px; margin: 0.5rem auto 0;">${escapeHtml(diag.description)}</p>
    </div>
    
    <div class="flow-node-row">
      ${nodesHtml}
    </div>
    
    <div class="diagram-detail-pane">
      <h4>🔍 ${activeNode.step}: ${escapeHtml(activeNode.title)}</h4>
      <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary);">${escapeHtml(activeNode.details)}</p>
    </div>
  `;
}

function selectDiagramNode(nodeId) {
  STATE.activeNodeId = nodeId;
  renderDiagram();
}

// --- CHEATSHEET & CODE COOKBOOK ---
function initCheatsheetView() {
  const container = document.getElementById("cheatsheetContainer");
  const filterSelect = document.getElementById("cheatsheetFilter");
  if (!container) return;
  
  function renderCheatsheet(category = "ALL") {
    container.innerHTML = "";
    CHEATSHEET_DATA.forEach(item => {
      if (category !== "ALL" && item.category !== category) return;
      
      const card = document.createElement("div");
      card.className = "code-box";
      card.style.marginBottom = "1.5rem";
      
      card.innerHTML = `
        <div class="code-header">
          <div>
            <span class="domain-code-pill" style="margin-right: 0.5rem;">${escapeHtml(item.category)}</span>
            <span class="code-title" style="display: inline-block;">${escapeHtml(item.title)}</span>
          </div>
          <button class="btn-copy" onclick="copySnippet('cs-${item.id}')">Copy Code</button>
        </div>
        <p style="padding: 0.75rem 1rem 0; font-size: 0.85rem; color: var(--text-secondary);">
          ${escapeHtml(item.description)}
        </p>
        <pre><code id="code-cs-${item.id}">${escapeHtml(item.code)}</code></pre>
      `;
      container.appendChild(card);
    });
  }
  
  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      renderCheatsheet(e.target.value);
    });
  }
  
  renderCheatsheet("ALL");
}

// --- READINESS DIAGNOSTIC CALCULATOR ---
function initDiagnosticView() {
  const sliders = document.querySelectorAll(".diagnostic-slider");
  sliders.forEach(slider => {
    slider.addEventListener("input", calculateDiagnosticScore);
  });
  calculateDiagnosticScore();
}

function calculateDiagnosticScore() {
  const weights = {
    "d1": 0.275, // Domain 1: 25-30%
    "d2": 0.325, // Domain 2: 30-35%
    "d3": 0.125, // Domain 3: 10-15%
    "d4": 0.125, // Domain 4: 10-15%
    "d5": 0.150  // Domain 5: 10-15%
  };
  
  let totalScore = 0;
  const domainConfidences = {};
  
  Object.keys(weights).forEach(k => {
    const slider = document.getElementById(`slider-${k}`);
    const valText = document.getElementById(`val-${k}`);
    const val = slider ? parseInt(slider.value, 10) : 50;
    if (valText) valText.innerText = `${val}%`;
    domainConfidences[k] = val;
    totalScore += val * weights[k];
  });
  
  const estimatedExamScore = Math.round(totalScore * 10); // scale 0-1000
  const scoreEl = document.getElementById("diagnosticScoreVal");
  const verdictEl = document.getElementById("diagnosticVerdict");
  const recList = document.getElementById("diagnosticRecList");
  
  if (scoreEl) scoreEl.innerText = `${estimatedExamScore} / 1000`;
  
  if (verdictEl) {
    if (estimatedExamScore >= 750) {
      verdictEl.innerText = "Exam Ready! High likelihood of passing. Take a timed practice exam to solidify timing.";
      verdictEl.style.color = "var(--success)";
    } else if (estimatedExamScore >= 680) {
      verdictEl.innerText = "Borderline. Target your lowest domain below to cross the 700 threshold.";
      verdictEl.style.color = "var(--warning)";
    } else {
      verdictEl.innerText = "Study Required. Deep dive into Domain 2 (Generative AI & Agents) and Domain 1.";
      verdictEl.style.color = "var(--danger)";
    }
  }
  
  if (recList) {
    recList.innerHTML = "";
    
    // Check lowest domain
    let lowestKey = "d2";
    let minVal = 101;
    Object.keys(domainConfidences).forEach(k => {
      if (domainConfidences[k] < minVal) {
        minVal = domainConfidences[k];
        lowestKey = k;
      }
    });
    
    const recommendations = [];
    if (domainConfidences["d2"] < 70) {
      recommendations.push("Master the Azure AI Agent Service execution lifecycle ('requires_action' loop, custom function tools, and VectorStore attachment).");
    }
    if (domainConfidences["d1"] < 70) {
      recommendations.push("Review PTU vs Serverless scaling trade-offs, Entra ID keyless authentication, and Prompt Shields for indirect prompt injection.");
    }
    if (domainConfidences["d5"] < 70) {
      recommendations.push("Memorize Reciprocal Rank Fusion (RRF: sum(1/(60+rank))) and Document Intelligence prebuilt-layout with markdown formatting.");
    }
    if (domainConfidences["d3"] < 70) {
      recommendations.push("Understand DALL-E 3 parameters (vivid vs natural style) and C2PA Content Credentials provenance.");
    }
    if (domainConfidences["d4"] < 70) {
      recommendations.push("Study the OpenAI Realtime API on Azure vs traditional STT/TTS cascades, plus SSML emotion tags.");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("All domains appear solid! Complete a 50-question Timed Exam simulation to test stamina.");
    }
    
    recommendations.forEach(r => {
      const li = document.createElement("li");
      li.innerText = r;
      recList.appendChild(li);
    });
  }
}

// --- UTILITIES ---
function copySnippet(elementId) {
  let text = "";
  if (elementId.startsWith("cs-")) {
    const codeEl = document.getElementById(`code-${elementId}`);
    if (codeEl) text = codeEl.innerText;
  } else {
    const codeEl = document.getElementById(`code-${elementId}`);
    if (codeEl) text = codeEl.innerText;
  }
  
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Code copied to clipboard! 📋");
    });
  }
}

function showToast(message) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setupKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    // Only handle if not in an input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") {
      return;
    }
    
    // Space flips flashcard
    if (e.code === "Space" && STATE.activeView === "flashcards") {
      e.preventDefault();
      STATE.fcFlipped = !STATE.fcFlipped;
      const cardEl = document.getElementById("flashcardElement");
      if (cardEl) cardEl.classList.toggle("flipped", STATE.fcFlipped);
    }
    
    // Arrow keys navigate flashcards
    if (STATE.activeView === "flashcards") {
      if (e.code === "ArrowRight") {
        const nextBtn = document.getElementById("fcNextBtn");
        if (nextBtn) nextBtn.click();
      } else if (e.code === "ArrowLeft") {
        const prevBtn = document.getElementById("fcPrevBtn");
        if (prevBtn) prevBtn.click();
      }
    }
    
    // Shortcut '/' focuses search input
    if (e.key === "/" && STATE.activeView === "modules") {
      e.preventDefault();
      const search = document.getElementById("moduleSearchInput");
      if (search) search.focus();
    }
  });
}
