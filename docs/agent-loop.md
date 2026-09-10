# Ponte entre o agente Work e o mundo

O processo do bot mantém três arquivos em `runtime/`:

- `world-state.json`: snapshot recente do mundo;
- `events.jsonl`: eventos ocorridos;
- `actions.jsonl`: ações que o agente quer executar.

O agente pode ler o estado e emitir ações pelo script:

```bash
npm run agent:action -- chat "Estou chegando na base."
npm run agent:action -- follow Methel
npm run agent:action -- goto 100 64 -20
npm run agent:action -- stop
```

Este protocolo é deliberadamente simples. Ele permite validar o ciclo:

```text
mundo → snapshot → decisão do agente → ação → mundo
```

Mais tarde, a camada de ação poderá receber objetivos estruturados gerados pelo modelo sem permitir que o modelo controle cada tick de movimento.
