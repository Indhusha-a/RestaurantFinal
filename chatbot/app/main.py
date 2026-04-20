from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from app.rag import build_context_string, retrieve_context
from app.llm import ask_llm


app = FastAPI(title="Restaurant Chatbot", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:3000",
        "https://yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    query: str
    history: list[dict] = Field(default_factory=list)


class RetrieveRequest(BaseModel):
    query: str
    top_k: int = 5
    score_threshold: float = 0.45


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/widget", response_class=HTMLResponse)
def widget():
    return """
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Restaurant Assistant</title>
  <style>
    :root { font-family: Inter, Arial, sans-serif; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f8fafc;
      color: #0f172a;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 12px 14px;
      border-bottom: 1px solid #e2e8f0;
      background: linear-gradient(90deg, #f97316, #ec4899);
      color: #fff;
      font-weight: 700;
    }
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .bubble {
      max-width: 86%;
      padding: 10px 12px;
      border-radius: 12px;
      line-height: 1.35;
      font-size: 14px;
      white-space: pre-wrap;
    }
    .user { align-self: flex-end; background: #ffe4e6; }
    .assistant { align-self: flex-start; background: #fff; border: 1px solid #e2e8f0; }
    .composer {
      border-top: 1px solid #e2e8f0;
      background: #fff;
      padding: 10px;
      display: flex;
      gap: 8px;
    }
    input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 14px;
      outline: none;
    }
    button {
      border: none;
      border-radius: 10px;
      padding: 10px 14px;
      color: #fff;
      font-weight: 600;
      background: linear-gradient(90deg, #f97316, #ec4899);
      cursor: pointer;
    }
    button:disabled { opacity: .6; cursor: not-allowed; }
  </style>
</head>
<body>
  <div class="header">Restaurant Assistant</div>
  <div id="messages" class="messages">
    <div class="bubble assistant">Hi. Ask me about restaurants, prices, categories, or recommendations.</div>
  </div>
  <form id="composer" class="composer">
    <input id="input" placeholder="Ask something..." autocomplete="off" />
    <button id="send" type="submit">Send</button>
  </form>

  <script>
    const messagesEl = document.getElementById("messages");
    const inputEl = document.getElementById("input");
    const sendBtn = document.getElementById("send");
    const composer = document.getElementById("composer");
    let history = [];

    function addBubble(text, role) {
      const div = document.createElement("div");
      div.className = `bubble ${role}`;
      div.textContent = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function sendMessage(userMsg) {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, history })
      });

      const data = await res.json();
      history.push({ role: "user", content: userMsg });
      history.push({ role: "assistant", content: data.answer || "" });

      if (history.length > 20) {
        history = history.slice(-20);
      }
      return data.answer || "I couldn't find that information.";
    }

    composer.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (!text) return;

      addBubble(text, "user");
      inputEl.value = "";
      sendBtn.disabled = true;

      try {
        const answer = await sendMessage(text);
        addBubble(answer, "assistant");
      } catch (err) {
        addBubble("I couldn't find that information.", "assistant");
      } finally {
        sendBtn.disabled = false;
        inputEl.focus();
      }
    });
  </script>
</body>
</html>
"""


@app.post("/chat")
def chat(request: ChatRequest):
    query = request.query.strip()
    chunks = retrieve_context(query=query, top_k=5, score_threshold=0.45)
    context = build_context_string(chunks)
    answer = ask_llm(query, context, request.history)

    return {
        "answer": answer,
        "retrieved_chunks": chunks,
    }


@app.post("/retrieve")
def retrieve(request: RetrieveRequest):
    query = request.query.strip()
    chunks = retrieve_context(
        query=query,
        top_k=request.top_k,
        score_threshold=request.score_threshold,
    )
    context = build_context_string(chunks)
    return {
        "query": query,
        "top_k": request.top_k,
        "score_threshold": request.score_threshold,
        "result_count": len(chunks),
        "retrieved_chunks": chunks,
        "context": context,
    }
