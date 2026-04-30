# IA Radar — Rafael Ondei

Radar diário do mercado de IA. Atualizado todo dia às 7h (horário de São Paulo).

## Live

- **Dashboard:** https://rafaelondei.appnaia.com
- **Repositório:** https://github.com/rafaondei-bot/ia-radar

## Foco da curadoria

10 itens mais relevantes do dia entre:

- Claude / Anthropic
- OpenAI / ChatGPT / Sora
- Google Gemini / Veo
- xAI / Grok
- Meta / Llama
- Mistral, Cohere, Perplexity
- Cursor, Vercel AI, Replit
- Frameworks e tools que estão se destacando

## Estrutura

```
data/
  index.json              → índice cronológico das execuções (mais recente primeiro)
  AAAA-MM-DD.json         → dados de cada execução diária
index.html                → dashboard com abas por data
```

## Saídas prontas para uso

Cada execução gera 3 versões:

1. **JSON estruturado** — pra alimentar o dashboard
2. **WhatsApp** — texto bloco único pra colar em grupo/canal
3. **Instagram** — caption + sugestão de carrossel slide-a-slide
