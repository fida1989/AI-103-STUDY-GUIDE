// AI-103: Developing AI Apps and Agents on Azure - Flashcards Data
// Comprehensive spaced-repetition cards for rapid recall

const FLASHCARDS_DATA = [
  // DOMAIN 1: Plan and Manage
  {
    id: "fc-01",
    domain: "DOM-01",
    domainTitle: "Plan and Manage an Azure AI Solution",
    front: "What is the difference between an Azure AI Foundry Hub and a Project?",
    back: "A **Hub** is the top-level resource managing enterprise security boundaries, Virtual Networks, Key Vault, Storage, and shared connections. A **Project** is an isolated child workspace where engineers author prompt flows, configure experiments, test agents, and manage deployments.",
    tag: "Architecture"
  },
  {
    id: "fc-02",
    domain: "DOM-01",
    domainTitle: "Plan and Manage an Azure AI Solution",
    front: "When should you choose Provisioned Throughput Units (PTU) over Serverless Pay-As-You-Go?",
    back: "Choose **PTU** when you require **guaranteed processing capacity, deterministic latency SLAs, and flat predictable hourly billing** under high or surging production workloads without experiencing dynamic HTTP 429 throttling.",
    tag: "Deployments"
  },
  {
    id: "fc-03",
    domain: "DOM-01",
    domainTitle: "Plan and Manage an Azure AI Solution",
    front: "What Azure RBAC role allows an application to generate chat completions via Azure OpenAI without administrative rights?",
    back: "**Cognitive Services OpenAI User**. ('Cognitive Services Contributor' grants management plane access, not least privilege for model data plane inference).",
    tag: "Security"
  },
  {
    id: "fc-04",
    domain: "DOM-01",
    domainTitle: "Plan and Manage an Azure AI Solution",
    front: "What is the difference between Direct and Indirect Prompt Injection?",
    back: "**Direct**: Attacker types malicious instructions straight into the user prompt ('Ignore rules'). **Indirect**: Attacker places instructions inside external data (e.g., an ingested website, customer email, or PDF) retrieved by RAG.",
    tag: "Responsible AI"
  },
  {
    id: "fc-05",
    domain: "DOM-01",
    domainTitle: "Plan and Manage an Azure AI Solution",
    front: "What inputs are mandatory for the GroundednessEvaluator in the Azure AI Evaluation SDK?",
    back: "1. `query` (the user input)\n2. `response` (the model's generated answer)\n3. `context` (the retrieved source text that grounds the answer). Without `context`, groundedness cannot be scored!",
    tag: "Evaluation"
  },
  {
    id: "fc-06",
    domain: "DOM-01",
    domainTitle: "Plan and Manage an Azure AI Solution",
    front: "What are the 4 severity levels evaluated in Azure AI Content Safety?",
    back: "• Level 0: Safe\n• Level 2: Low\n• Level 4: Medium\n• Level 6: High\nEvaluated across 4 harm categories: Hate, Sexual, Violence, and Self-Harm.",
    tag: "Content Safety"
  },

  // DOMAIN 2: Generative AI and Agents
  {
    id: "fc-07",
    domain: "DOM-02",
    domainTitle: "Implement Generative AI and Agentic Solutions",
    front: "In Azure AI Agent Service, what does the Run status `requires_action` signify?",
    back: "The agent wants to execute a **Function Tool**. The host app must extract function arguments, execute the external code/API, and submit results back using `submit_tool_outputs_to_run`.",
    tag: "Agent Service"
  },
  {
    id: "fc-08",
    domain: "DOM-02",
    domainTitle: "Implement Generative AI and Agentic Solutions",
    front: "What is the difference between `json_object` mode and Structured Outputs (`strict=True`)?",
    back: "`json_object` only guarantees the string is syntactically valid JSON. **Structured Outputs** with `strict=True` (or Pydantic parsing) guarantees 100% adherence to a specific JSON schema with all required keys and types.",
    tag: "Model Output"
  },
  {
    id: "fc-09",
    domain: "DOM-02",
    domainTitle: "Implement Generative AI and Agentic Solutions",
    front: "What is the Code Interpreter tool in Azure AI Agent Service, and where does it execute?",
    back: "It runs sandboxed Python code inside a secure, Microsoft-managed cloud environment. It processes data files (CSV, Excel), performs complex calculations, and generates charts.",
    tag: "Agent Tools"
  },
  {
    id: "fc-10",
    domain: "DOM-02",
    domainTitle: "Implement Generative AI and Agentic Solutions",
    front: "Explain the Orchestrator-Worker multi-agent pattern.",
    back: "A central **Orchestrator (supervisor)** agent receives the user prompt, breaks it down into subtasks, delegates them to specialized **Worker** agents, and synthesizes the final response.",
    tag: "Multi-Agent"
  },
  {
    id: "fc-11",
    domain: "DOM-02",
    domainTitle: "Implement Generative AI and Agentic Solutions",
    front: "What is the difference between `frequency_penalty` and `presence_penalty`?",
    back: "• `frequency_penalty`: Penalizes tokens proportionally to how many times they have already appeared (reduces verbatim repetition).\n• `presence_penalty`: Penalizes tokens simply for having appeared at all (encourages introducing new topics).",
    tag: "Hyperparameters"
  },
  {
    id: "fc-12",
    domain: "DOM-02",
    domainTitle: "Implement Generative AI and Agentic Solutions",
    front: "What is a Reflexion / Self-Critique loop in agent workflows?",
    back: "An agentic pattern where the model generates a candidate answer, critiques it against explicit rules/criteria in an evaluation step, and iteratively refines the output before presenting it to the user.",
    tag: "Reasoning Patterns"
  },

  // DOMAIN 3: Computer Vision Solutions
  {
    id: "fc-13",
    domain: "DOM-03",
    domainTitle: "Implement Computer Vision Solutions",
    front: "In DALL-E 3, what is the visual difference between style='vivid' and style='natural'?",
    back: "• `vivid`: Generates hyper-real, dramatic, and stylized artistic visuals.\n• `natural`: Produces realistic, unexaggerated, documentary-style photography.",
    tag: "DALL-E 3"
  },
  {
    id: "fc-14",
    domain: "DOM-03",
    domainTitle: "Implement Computer Vision Solutions",
    front: "In GPT-4o Vision, when should you use `detail: 'high'` vs `detail: 'low'`?",
    back: "• `high`: Splits image into 512x512 tiles for fine OCR, small dials, charts, or serial numbers.\n• `low`: Fixed 85-token cost for fast, rough scene-level overviews.",
    tag: "Vision Multimodal"
  },
  {
    id: "fc-15",
    domain: "DOM-03",
    domainTitle: "Implement Computer Vision Solutions",
    front: "What is the purpose of C2PA Content Credentials in AI image generation?",
    back: "An open standard that embeds cryptographically signed, tamper-evident provenance metadata into generated images, certifying origin, author, and generation history.",
    tag: "Provenance"
  },
  {
    id: "fc-16",
    domain: "DOM-03",
    domainTitle: "Implement Computer Vision Solutions",
    front: "What is the difference between Inpainting and Outpainting?",
    back: "• **Inpainting**: Edits or replaces content within a masked region inside the image boundaries.\n• **Outpainting**: Extends the canvas beyond the original borders while maintaining stylistic consistency.",
    tag: "Image Editing"
  },
  {
    id: "fc-17",
    domain: "DOM-03",
    domainTitle: "Implement Computer Vision Solutions",
    front: "In Azure Content Understanding, what differentiates 'single-task' from 'pro-mode'?",
    back: "• **Single-task**: Fast, targeted extraction from one modality (e.g. document OCR).\n• **Pro-mode**: Cross-modal reasoning uniting video frames, audio speech transcripts, and document layouts into unified schemas.",
    tag: "Content Understanding"
  },

  // DOMAIN 4: Text Analysis Solutions
  {
    id: "fc-18",
    domain: "DOM-04",
    domainTitle: "Implement Text Analysis Solutions",
    front: "What is the benefit of SSML in Azure AI Speech synthesis?",
    back: "Allows precise acoustic control: speaking styles (`<mstts:express-as style='empathetic'>`), pitch, rate, pauses (`<break time='300ms'/>`), and phonetic pronunciations (`<phoneme>`).",
    tag: "Speech"
  },
  {
    id: "fc-19",
    domain: "DOM-04",
    domainTitle: "Implement Text Analysis Solutions",
    front: "Why use the OpenAI Realtime API on Azure instead of chaining STT -> LLM -> TTS?",
    back: "It uses persistent WebSockets for sub-second, bi-directional audio streaming with native turn-taking and user interruption handling (barge-in), avoiding cumulative REST latency hops.",
    tag: "Realtime Voice"
  },
  {
    id: "fc-20",
    domain: "DOM-04",
    domainTitle: "Implement Text Analysis Solutions",
    front: "When should you use Azure Translator Custom Glossaries over raw LLM translation?",
    back: "When strict deterministic preservation of trademarks, SKU codes, and proprietary terminology is required without the risk of model translation hallucinations.",
    tag: "Translation"
  },
  {
    id: "fc-21",
    domain: "DOM-04",
    domainTitle: "Implement Text Analysis Solutions",
    front: "What is the difference between Extractive and Abstractive Summarization?",
    back: "• **Extractive**: Pulls exact representative sentences directly from the original text.\n• **Abstractive**: Uses an LLM to generate novel, rephrased sentences capturing key concepts.",
    tag: "Summarization"
  },

  // DOMAIN 5: Information Extraction Solutions
  {
    id: "fc-22",
    domain: "DOM-05",
    domainTitle: "Implement Information Extraction Solutions",
    front: "What is Hybrid Search in Azure AI Search?",
    back: "Combines full-text BM25 keyword search and high-dimensional vector search into a single unified query, merged using Reciprocal Rank Fusion (RRF).",
    tag: "Search"
  },
  {
    id: "fc-23",
    domain: "DOM-05",
    domainTitle: "Implement Information Extraction Solutions",
    front: "What is the mathematical formula for Reciprocal Rank Fusion (RRF)?",
    back: "**RRF Score = Σ (1 / (k + rank))**, where `k` is a smoothing constant (default: 60) and `rank` is the 1-based ordinal position of the document in each search result stream.",
    tag: "RRF Formula"
  },
  {
    id: "fc-24",
    domain: "DOM-05",
    domainTitle: "Implement Information Extraction Solutions",
    front: "What does the Semantic Ranker do in Azure AI Search?",
    back: "It applies a deep Microsoft Turing transformer model to re-score and re-order the top 50 results from hybrid search based on deep linguistic context, producing semantic captions and answers.",
    tag: "Semantic Search"
  },
  {
    id: "fc-25",
    domain: "DOM-05",
    domainTitle: "Implement Information Extraction Solutions",
    front: "Why request `output_content_format='markdown'` from Document Intelligence Layout model?",
    back: "It renders complex tables with standard Markdown pipes and headers. LLMs parse and understand tabular spatial relationships in Markdown far better than raw unstructured OCR text.",
    tag: "Document Intelligence"
  },
  {
    id: "fc-26",
    domain: "DOM-05",
    domainTitle: "Implement Information Extraction Solutions",
    front: "What vector distance metric is optimal for `text-embedding-3-small` in Azure AI Search?",
    back: "**Cosine** (or dotProduct), because OpenAI embedding models output normalized unit-length vectors.",
    tag: "Vector Search"
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { FLASHCARDS_DATA };
}
