# Chatbot Container

This folder contains the isolated chatbot backend.

## Run from repo root

```bash
docker compose -f docker-compose.chatbot.yml up --build
```

## Run ingestion (MySQL -> Qdrant)

One-time sync:

```bash
docker compose -f docker-compose.chatbot.yml run --rm chatbot python -m app.ingest
```

Periodic sync:

- Cron / Task Scheduler can run the same command every hour.
- Or trigger it via a webhook by wiring an endpoint that calls `app.ingest.run_ingestion()`.

## Endpoints

- Health: `http://localhost:8100/health`
- Chat: `POST http://localhost:8100/chat`

Example chat body:

```json
{
  "query": "What are the cheapest pizza options?",
  "history": [
    {"role": "user", "content": "Show me pizza"},
    {"role": "assistant", "content": "Here are some pizza options..."}
  ]
}
```

## Notes

- `docker-compose.chatbot.yml` is intentionally separate from your existing services.
- `.env.chatbot` is mounted into the chatbot service for configuration.
- `qdrant` runs as a sibling container for vector search.
- Ingestion SQL is configurable with `INGEST_SQL` in `.env.chatbot`.
- LLM call is configured via `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`.
