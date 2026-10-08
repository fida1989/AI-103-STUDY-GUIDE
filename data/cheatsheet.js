// AI-103: Developing AI Apps and Agents on Azure - Code Cookbook & Quick Reference

const CHEATSHEET_DATA = [
  {
    id: "cs-01",
    category: "Authentication & Foundry SDK",
    title: "Keyless Foundry Client Connection",
    description: "Initialize the official Azure AI Projects client using DefaultAzureCredential without hardcoded keys.",
    language: "python",
    code: `import os
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

# Keyless connection using Entra ID
project_client = AIProjectClient.from_connection_string(
    credential=DefaultAzureCredential(),
    conn_str=os.environ["AZURE_AIPROJECT_CONNECTION_STRING"]
)

# Enumerate connected resources
for conn in project_client.connections.list():
    print(f"Connected Resource: {conn.connection_name} ({conn.connection_type})")`
  },
  {
    id: "cs-02",
    category: "Agents & Workflows",
    title: "Azure AI Agent Service Tool Calling Loop",
    description: "The complete pattern to create an agent, run a thread, intercept 'requires_action', execute local logic, and submit tool outputs.",
    language: "python",
    code: `import json, time
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

client = AIProjectClient.from_connection_string(
    credential=DefaultAzureCredential(),
    conn_str=os.environ["AZURE_AIPROJECT_CONNECTION_STRING"]
)

# 1. Define tool schema
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"]
        }
    }
}]

# 2. Create agent & conversation thread
agent = client.agents.create_agent(model="gpt-4o", name="support-agent", tools=tools)
thread = client.agents.create_thread()
client.agents.create_message(thread_id=thread.id, role="user", content="What is the weather in Seattle?")

# 3. Create run and poll status
run = client.agents.create_run(thread_id=thread.id, assistant_id=agent.id)
while run.status in ["queued", "in_progress", "requires_action"]:
    time.sleep(1)
    run = client.agents.get_run(thread_id=thread.id, run_id=run.id)
    if run.status == "requires_action":
        tool_outputs = []
        for call in run.required_action.submit_tool_outputs.tool_calls:
            if call.function.name == "get_weather":
                output = {"temp": "62F", "condition": "Sunny"}
                tool_outputs.append({"tool_call_id": call.id, "output": json.dumps(output)})
        client.agents.submit_tool_outputs_to_run(thread_id=thread.id, run_id=run.id, tool_outputs=tool_outputs)

# 4. Read final agent reply
messages = client.agents.list_messages(thread_id=thread.id)
print(messages.data[0].content[0].text.value)`
  },
  {
    id: "cs-03",
    category: "Search & RAG",
    title: "Azure AI Search: Hybrid Search + Semantic Ranker",
    description: "Execute BM25 keyword search and vector search combined with Reciprocal Rank Fusion (RRF) and L2 semantic re-ranking.",
    language: "python",
    code: `from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizableTextQuery, QueryType

client = SearchClient(
    endpoint="https://my-search-service.search.windows.net",
    index_name="knowledge-base",
    credential=DefaultAzureCredential()
)

query_text = "What is the policy for expense report submission deadlines?"

results = client.search(
    search_text=query_text, # BM25 Full-text query
    vector_queries=[
        VectorizableTextQuery(text=query_text, k_nearest_neighbors=5, fields="content_vector")
    ],
    query_type=QueryType.SEMANTIC,
    semantic_configuration_name="default-semantic-config",
    top=5
)

for r in results:
    print(f"Title: {r['title']} | Reranker Score: {r['@search.reranker_score']}")`
  },
  {
    id: "cs-04",
    category: "Document Intelligence",
    title: "Layout Model with Markdown Output",
    description: "Extract text and tables formatted as clean Markdown tables, preserving structure for LLM grounding.",
    language: "python",
    code: `from azure.identity import DefaultAzureCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import DocumentContentFormat

client = DocumentIntelligenceClient(
    endpoint="https://my-docintel.cognitiveservices.azure.com/",
    credential=DefaultAzureCredential()
)

with open("annual_report.pdf", "rb") as f:
    poller = client.begin_analyze_document(
        model_id="prebuilt-layout",
        body=f,
        output_content_format=DocumentContentFormat.MARKDOWN
    )

result = poller.result()
# Markdown content with preserved tables and headers
print(result.content[:1000])`
  },
  {
    id: "cs-05",
    category: "Responsible AI",
    title: "Azure AI Evaluation SDK: Groundedness & Relevance",
    description: "Automate model evaluation for hallucinations (groundedness) and answer quality.",
    language: "python",
    code: `from azure.identity import DefaultAzureCredential
from azure.ai.evaluation import GroundednessEvaluator, RelevanceEvaluator

model_config = {
    "azure_endpoint": "https://my-foundry.openai.azure.com/",
    "azure_deployment": "gpt-4o",
    "credential": DefaultAzureCredential()
}

groundedness_eval = GroundednessEvaluator(model_config)
relevance_eval = RelevanceEvaluator(model_config)

query = "How long is my warranty?"
context = "All hardware includes a 2-year manufacturer warranty from delivery date."
response = "Your warranty lasts for 2 years starting from when the device was delivered."

g_score = groundedness_eval(query=query, response=response, context=context)
r_score = relevance_eval(query=query, response=response)

print(f"Groundedness (1-5): {g_score['groundedness']}")
print(f"Relevance (1-5): {r_score['relevance']}")`
  },
  {
    id: "cs-06",
    category: "Computer Vision",
    title: "GPT-4o Multimodal Vision with Base64 Image",
    description: "Send local images to GPT-4o for high-detail visual question answering.",
    language: "python",
    code: `import base64
from openai import AzureOpenAI
from azure.identity import DefaultAzureCredential

client = AzureOpenAI(
    azure_endpoint="https://my-foundry.openai.azure.com/",
    azure_ad_token_provider=DefaultAzureCredential(),
    api_version="2024-10-21"
)

with open("schematic.png", "rb") as f:
    b64_data = base64.b64encode(f.read()).decode("utf-8")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What is the part number indicated by arrow 3?"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64_data}", "detail": "high"}}
        ]
    }]
)
print(response.choices[0].message.content)`
  },
  {
    id: "cs-07",
    category: "Speech & Audio",
    title: "Azure Speech Synthesis with SSML Emotion Control",
    description: "Synthesize speech using Neural voices with custom speaking styles and pause control.",
    language: "python",
    code: `import os
import azure.cognitiveservices.speech as speechsdk

config = speechsdk.SpeechConfig(subscription=os.environ["AZURE_SPEECH_KEY"], region="eastus")
synthesizer = speechsdk.SpeechSynthesizer(speech_config=config)

ssml = """
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <mstts:express-as style="cheerful">
      Welcome back! <break time="200ms"/> Your report is ready to review.
    </mstts:express-as>
  </voice>
</speak>
"""
synthesizer.speak_ssml_async(ssml).get()`
  },
  {
    id: "cs-08",
    category: "Azure CLI & Infrastructure",
    title: "Deploying Foundry Hub and Projects via Azure CLI",
    description: "Script infrastructure creation for reproducible deployments.",
    language: "bash",
    code: `# Create Resource Group
az group create --name rg-ai103-prod --location eastus

# Create Azure AI Foundry Hub with Keyless SystemAssigned Identity
az ml workspace create \\
  --resource-group rg-ai103-prod \\
  --name hub-foundry-enterprise \\
  --kind hub \\
  --identity-type SystemAssigned

# Create Project within Hub
az ml workspace create \\
  --resource-group rg-ai103-prod \\
  --name prj-agentic-ops \\
  --hub-id /subscriptions/<SUB_ID>/resourceGroups/rg-ai103-prod/providers/Microsoft.MachineLearningServices/workspaces/hub-foundry-enterprise \\
  --kind project`
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CHEATSHEET_DATA };
}
