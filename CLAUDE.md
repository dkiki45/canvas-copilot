# CLAUDE.md — Canvas Copilot (nome provisório do repositório)

> Este arquivo é o contexto do projeto para o Claude Code. Leia tudo antes de planejar
> qualquer implementação. As seções "Fase 1" definem o que deve ser construído AGORA.
> As demais seções são backlog de referência — não implementar ainda, só para dar
> contexto de onde o projeto vai chegar.

## 1. Visão geral

Web app que conecta um aluno da PUCPR (ou qualquer instituição que rode Canvas LMS) à
própria conta do Canvas via token pessoal de API, organizando cursos, prazos, tarefas e
notas num painel único. Em fases futuras, camadas de IA (via API da Anthropic) vão
ajudar a interpretar conteúdo e, por fim, auxiliar na produção de atividades — sempre
com confirmação explícita do aluno antes de qualquer envio.

Não existe integração com Telegram ou qualquer bot externo. Toda a interação —
incluindo futuras confirmações de envio — acontece dentro do próprio web app.

## 2. Stack técnica (tudo em camada gratuita para o MVP)

- **Frontend/Backend**: Next.js (App Router), hospedado no Vercel (free tier)
- **Banco de dados**: Neon Postgres (free tier)
- **Autenticação**: própria (não é login via Canvas OAuth institucional — cada aluno
  cola manualmente o token pessoal que ele mesmo gera em Conta → Configurações →
  "+ Novo token de acesso" no Canvas)
- **Sem uso da API da Anthropic nesta fase** — ver seção 4

## 3. Autenticação e segurança (crítico, implementar corretamente desde o início)

- Página de login/onboarding do aluno pede: (a) URL base da instituição no Canvas
  (ex: `pucpr.instructure.com`), (b) token pessoal de acesso.
- O token **nunca** é armazenado em texto puro. Antes de gravar no banco:
  criptografar com AES-256-GCM na camada da aplicação, usando uma chave mestra
  guardada como variável de ambiente do Vercel (nunca no banco, nunca no repositório).
- O token só é descriptografado em memória, no momento exato de fazer a chamada à API
  do Canvas, e nunca é reenviado ao cliente (frontend) depois de salvo.
- Nunca logar o token em nenhum log de aplicação, erro, ou analytics.
- Tabela sugerida: `canvas_credentials (user_id, base_url, encrypted_token, iv, created_at)`

## 4. FASE 1 — Escopo do MVP (implementar agora)

Regra da fase: **somente endpoints da API do Canvas que não têm custo nenhum de IA.**
Nenhuma chamada à API da Anthropic/Claude deve existir nesta fase — nem para
"interpretar" nem para "resumir" nada. O objetivo é validar a integração com o Canvas
e a experiência de login/segurança antes de somar custo variável de IA.

Funcionalidades da Fase 1:

- [x] Onboarding: aluno insere URL da instituição + token, token é criptografado e salvo
- [x] Listar cursos do semestre atual (`GET /courses`), com filtro manual de cursos
      administrativos ocultos (Biblioteca, PUC Acolhe, etc.)
- [x] Painel com lista de pendências cruzando todos os cursos (atrasadas + próximos 30 dias)
- [x] Visualização de calendário/prazos em grade de mês (`GET /calendar_events` + prazos de
      atividades/provas vindos de `GET /courses/:id/assignments`)
- [x] Ver notas lançadas por curso (`GET /courses/:id/enrollments`)
- [x] Ver arquivos do curso, tipo Plano de Ensino (`GET /courses/:id/files`) — extra, não
      estava no escopo original, adicionado a pedido
- [x] Ver detalhe de uma atividade: descrição, prazo, pontos, anexos
      (`GET /courses/:id/assignments/:id`)
- [x] Checar status de entrega de uma atividade (`GET .../submissions/self`)
- [x] Baixar anexo de uma atividade (download direto do arquivo, sem processar conteúdo)
- [x] Enviar arquivo de entrega manualmente, sempre por ação explícita do aluno no
      próprio app (upload de arquivo → clique em "Enviar" → `POST .../submissions`) —
      **implementado no código, mas nunca testado de ponta a ponta.** Ver aviso abaixo.

### ⚠️ Aviso: nunca testar o envio de entrega com uma conta real de aluno

O fluxo de "Enviar entrega" (`app/api/canvas/submit/route.ts`) faz o envio de verdade pro
Canvas da instituição — se testado com o token real de um aluno, o arquivo chega de fato na
caixa de correção do professor da turma, como uma entrega oficial. Isso não é reversível de
forma trivial (o aluno precisaria pedir pro professor desconsiderar/apagar manualmente).

Por isso: **não testar esse fluxo com uma conta real**, nem para "só ver se funciona". Se
precisar validar o código, revisar a implementação estaticamente (lint/build/leitura do código)
é suficiente; testar de ponta a ponta só faria sentido com uma conta de teste/sandbox do Canvas
que não pertença a uma turma real com professor de verdade — e mesmo assim, confirmar com o
usuário antes.

Fora de escopo na Fase 1 (não implementar ainda): qualquer resumo/interpretação de PDF,
qualquer chat em linguagem natural, qualquer geração de texto, pagamento/assinatura,
notificações automáticas por push/e-mail.

## 5. Referências de código a consultar (bibliotecas open source de MCP para Canvas)

Não estamos construindo um servidor MCP nesta fase (o app é um web app comum, não um
cliente MCP), mas essas bibliotecas são ótimas referências de como estruturar o cliente
da API do Canvas, tratamento de paginação e modelagem dos endpoints:

- https://github.com/vishalsachdev/canvas-mcp — Python, bom exemplo de organização por
  domínio (cursos, assignments, submissions, anúncios)
- Canvas MCP do plyght — TypeScript, 31 tools, referência de cobertura ampla de endpoints
- Documentação oficial da API: https://canvas.instructure.com/doc/api/

Detalhes técnicos da API a respeitar na implementação:
- Toda resposta é JSON, paginação via header `Link` (RFC 5988) — não assumir que a
  primeira página tem todos os resultados.
- Autenticação via header `Authorization: Bearer <token>`.
- Rate limit: ~700 requisições/10min por usuário — não é preocupação real no MVP
  (cada aluno usa o próprio token), mas tratar erro 429 com retry/backoff simples.
- Timestamps sempre em ISO 8601 UTC.

## 6. Backlog de funcionalidades (referência para fases futuras — NÃO implementar agora)

Dividido pelos 3 planos que pensamos. Coluna "Custo" indica se a funcionalidade usa
só a API do Canvas (grátis) ou também a API da Anthropic (custo variável por token).

### Plano "Organização" — só API do Canvas, zero IA
| Funcionalidade | Endpoint/mecanismo |
|---|---|
| Painel unificado de matérias, prazos e calendário | `/courses`, `/calendar_events` |
| Notificação de prazo próximo | cron comparando `/users/self/todo` com a data atual |
| Status de entrega (o que falta enviar) | `/submissions/self` |

### Plano "Análise" — Organização + IA leve e bem delimitada
| Funcionalidade | Custo |
|---|---|
| Resumo automático de uma atividade específica (o que pede, prazo, formato) | IA (Haiku) — 1 chamada curta por atividade, com prompt fixo e escopo fechado |
| Responder pergunta pontual sobre uma atividade já aberta na tela | IA (Haiku) — contexto limitado só àquela atividade, não é chat aberto |
| Consolidado de desempenho por matéria no semestre | IA (Haiku) só na formatação/insight; os números vêm direto da API |

### Plano "Fazer" — Análise + assistência na produção
| Funcionalidade | Custo |
|---|---|
| Rascunho assistido da atividade a partir do PDF de instrução | IA (Sonnet) — maior custo de saída, usar só quando o aluno pedir explicitamente |
| Fluxo de confirmação antes de qualquer envio | IA leve (opcional) + API do Canvas — aluno sempre revisa e aprova no próprio app antes do `POST` de submissão |

**Nota de controle de custo (importante para as fases 2 e 3):** toda funcionalidade de
IA deve ter escopo fechado — prompt fixo, contexto limitado ao que é estritamente
necessário (ex: só o texto daquela atividade, não o histórico do aluno inteiro) — em
vez de um chat aberto de propósito geral. Isso mantém o custo por interação previsível
e barato. Usar Haiku como padrão; só escalar para Sonnet nas tarefas que exigem geração
de texto mais longa ou raciocínio mais complexo (ex: rascunho de atividade).

## 7. Instruções diretas para o plan mode

1. Nesta sessão, planeje e implemente **apenas** a Fase 1 (seção 4).
2. Não crie nenhuma chamada à API da Anthropic/Claude neste momento.
3. Não crie integração com Telegram, WhatsApp, e-mail transacional ou qualquer canal
   externo de notificação — tudo fica dentro do próprio web app por enquanto.
4. Não implemente Stripe/pagamento ainda.
5. Priorize: (1) schema do banco no Neon, (2) fluxo de onboarding com criptografia do
   token, (3) cliente de API do Canvas com tratamento de paginação, (4) telas de
   listagem de cursos/tarefas/calendário/notas, (5) fluxo de upload e envio manual.
6. Pergunte antes de tomar decisões de escopo que não estejam claras aqui.
