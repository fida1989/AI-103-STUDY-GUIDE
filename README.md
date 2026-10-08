# AI-103 Study Guide & Exam Prep Web App
> **Exam AI-103: Developing AI Apps and Agents on Azure**  
> *Official Syllabus Reference: April 16, 2026 Skills Measured*

A web application designed to prepare engineers for the **Microsoft Certified: Azure AI Engineer Associate (AI-103)** exam.

---

## 📋 Exam Domains & Weightages

| Domain Code | Domain Title | Exam Weight |
|:---|:---|:---:|
| **DOM-01** | **Plan and Manage an Azure AI Solution** | **25–30%** |
| **DOM-02** | **Implement Generative AI and Agentic Solutions** | **30–35%** |
| **DOM-03** | **Implement Computer Vision Solutions** | **10–15%** |
| **DOM-04** | **Implement Text Analysis Solutions** | **10–15%** |
| **DOM-05** | **Implement Information Extraction Solutions** | **10–15%** |

---

## 🚀 Key Web App Features

1. **Comprehensive Study Modules Explorer**:
   - Deep architectural breakdown for all 14 objectives across all 5 official domains.
   - Filter by domain pill or use the instant live search (`/` keyboard shortcut).
   - "Mark as Mastered" checkboxes that automatically calculate and persist overall preparation progress via `localStorage`.
   - Real-world Python SDK snippets (`azure-ai-projects`, `azure-ai-inference`, `azure-search-documents`, `azure-ai-contentsafety`, etc.).
   - Comparison matrices (e.g. Serverless vs PTU, Semantic Ranker vs Hybrid Search, Single-Task vs Pro-Mode Content Understanding).
   - Pro Tips & Exam Traps callouts warning against common Microsoft exam distractor tricks.

2. **Spaced-Repetition Flashcards Mode**:
   - 26+ cards with 3D flip animation (`Spacebar` to flip).
   - Filter by domain, shuffle deck, and mark cards as Mastered.
   - Keyboard shortcuts (`←` / `→` arrows for navigation).

3. **Realistic Practice Quiz & Timed Exam Simulation**:
   - **Practice Mode**: Instant rationale and deep distractor breakdowns explaining why the correct answer is right and why the 3 alternatives are wrong.
   - **Timed Simulation**: Simulates the real test experience with a 100-minute countdown timer, question flagging (`⚐`), question palette, and domain-level score breakdown (passing threshold: 700 / 1000).
   - 36 realistic scenario-based questions.

4. **Interactive Architecture Visualizer**:
   - Step-by-step interactive diagrams:
     - *Enterprise RAG & Grounding Pipeline* (Ingestion -> Chunking -> Vectorizing -> Hybrid Search + RRF -> Semantic Ranker -> LLM Grounding).
     - *Azure AI Agent Service Execution Lifecycle* (Thread -> Run -> `requires_action` -> Local Tool Output -> Final Message).
     - *Responsible AI Guardrail Pipeline* (Prompt Shields -> Content Safety -> Constrained Inference -> Groundedness Check -> C2PA Provenance).
   - Clickable nodes reveal technical specifications and implementation nuances.

5. **Azure AI Developer Code Cookbook**:
   - Instant copyable code templates for keyless `DefaultAzureCredential` connections, Agent Service custom tool loops, Structured Outputs with Pydantic, Document Intelligence Markdown extraction, and SSML speech synthesis.

6. **Exam Readiness Diagnostic Calculator**:
   - Interactive sliders to assess personal confidence across each domain.
   - Calculates estimated scaled score (0–1000) and provides prescriptive study action items for weak areas.

---

## 🏃 Running the Application

This is a zero-dependency, vanilla web application.

### Option 1: Direct File Opening
Simply double-click [`index.html`](file:///Users/fida/Projects/untitled%20folder/index.html) or open it in any web browser (Chrome, Edge, Safari, Firefox).

### Option 2: Local HTTP Server
Run in your terminal:
```bash
# Using Node
npx serve .
# or using Python
python3 -m http.server 3000
```
Then visit `http://localhost:3000`.

---

## 📁 File Structure

```
├── index.html           # Main single-page web app container
├── styles.css           # Azure Fluent UI inspired dark/light styling
├── app.js               # Reactive state manager, quiz & flashcard engine
├── data/
│   ├── curriculum.js    # Comprehensive study guide syllabus and deep dives
│   ├── questions.js     # Scenario-based practice questions & rationale
│   ├── flashcards.js    # Spaced repetition flashcards
│   └── cheatsheet.js    # Code snippets & CLI quick reference
└── README.md            # Project documentation
```
