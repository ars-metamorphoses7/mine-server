# MVP — sessão temporária com amigos

## Objetivo

Validar uma sessão de Minecraft para quatro jogadores com um bot-companheiro presente no mundo.

## Critérios de sucesso

- o servidor inicia sem intervenção manual depois da configuração inicial;
- quatro jogadores conseguem entrar;
- `LunaCompanion` conecta e aparece no mundo;
- `!come` faz o bot seguir um jogador;
- `!stop` interrompe a movimentação;
- o processo pode ser encerrado sem corromper o mundo;
- os logs permitem diagnosticar desconexões e crashes.

## Fora do primeiro teste

- conversação livre com LLM;
- construção autônoma complexa;
- mineração ou combate autônomos;
- persistência de memória entre sessões;
- exposição pública permanente do servidor.

## Decisão técnica inicial

O servidor e o bot devem ser componentes separados. O bot controla ações no mundo; uma camada futura de planejamento poderá converter pedidos naturais em objetivos como `follow_player`, `go_to`, `collect` e `build`.
