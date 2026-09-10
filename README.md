# Minecraft AI Companion

Protótipo de um servidor Minecraft temporário com um bot-companheiro controlado por IA.

O objetivo do primeiro teste é validar a parte mais básica do conceito com apenas duas entidades: o usuário e o agente de IA dentro do mundo:

1. subir um servidor Minecraft temporário;
2. conectar um bot visível ao mundo;
3. permitir que o agente Work leia o estado do mundo;
4. permitir que o agente envie ações ao bot;
5. preparar a ponte para o agente ser o “cérebro” do bot.

## Estado atual

O repositório contém um bot TypeScript usando Mineflayer e pathfinding. Ele já possui:

- conexão a um servidor Minecraft offline-mode;
- `!ping`;
- `!status`;
- `!come`, para seguir o jogador que enviou o comando;
- `!stop`;
- tratamento básico de reconexão, erros e encerramento.
- ponte de estado e ações em `runtime/`, para o agente Work observar e controlar o bot.

A integração com um modelo ainda não foi adicionada de propósito. Primeiro vamos provar que o servidor, o bot e a movimentação funcionam isoladamente.

## Requisitos

- Node.js 20+;
- um servidor Minecraft Java rodando;
- Minecraft Java Edition na mesma versão do servidor;
- acesso de rede entre o bot e o servidor.

## Rodando o bot

```bash
npm install
cp .env.example .env
npm run dev
```

Por padrão, o bot tenta conectar em `localhost:25565` na versão `1.20.4` com o nome `LunaCompanion`.

## Configuração

Edite `.env`:

```env
MC_HOST=127.0.0.1
MC_PORT=25565
MC_VERSION=1.21.1
MC_BOT_NAME=LunaCompanion
MC_AUTH=offline
```

## Comandos dentro do Minecraft

```text
!ping    responde pong
!status  mostra o estado básico do bot
!come    segue o jogador que enviou o comando
!stop    interrompe o objetivo atual
```

O agente também pode controlar o bot pela ponte de ações:

```bash
npm run agent:action -- chat "Estou online."
npm run agent:action -- follow Methel
npm run agent:action -- goto 100 64 -20
npm run agent:action -- stop
```

Veja o protocolo completo em `docs/agent-loop.md`.

## Próximos marcos

- adicionar memória de sessão;
- transformar mensagens naturais em objetivos estruturados;
- permitir tarefas como “me siga”, “vá até a base” e “traga madeira”;
- conectar comandos administrativos via RCON;
- criar uma camada de segurança para impedir ações destrutivas sem confirmação;
- testar um túnel de rede para amigos entrarem em uma sessão temporária;
- separar o controlador determinístico do planejador baseado em LLM.

## Princípio de arquitetura

O modelo não deve controlar cada movimento do bot. Pathfinding, inventário e ações repetitivas devem ser executados localmente. O modelo deve decidir objetivos de alto nível e reagir a eventos importantes. Isso reduz latência, custo e comportamento instável.
