# SGMD - Servico de Gerenciamento de Mudancas

## Problem Statement
Sistema web de calendario de mudancas agendadas seguindo o Design System Gov.br (Governo Federal do Brasil), com campos ITIL v4 para gestao profissional de mudancas.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI (porta 3000)
- **Backend**: FastAPI + MongoDB (porta 8001)
- **Auth**: JWT com bcrypt
- **Design System**: Gov.br (cores #1351B4, #071D41, #168821, #E52207, #FFCD07)

## User Personas
- Gestor de TI (cadastra e aprova mudancas)
- Equipe tecnica (visualiza calendario, executa mudancas)
- Administrador (gerencia usuarios e mudancas)

## Core Requirements
- Calendario mensal visual de mudancas
- CRUD completo de mudancas com campos ITIL
- Tipos: Infraestrutura, Sistemas, SAPIENS
- Classificacao ITIL: Categoria, Prioridade, Risco, Impacto
- Campos ITIL: RFC, Justificativa, Plano de Rollback, Janela de Manutencao, Aprovador
- Filtros por status e tipo
- Exportacao CSV
- Autenticacao JWT

## What's Been Implemented (2026-03-31)
- Login page Gov.br styled
- Dashboard com header Gov.br, metricas, calendario, sidebar
- CRUD completo de mudancas com 10+ campos ITIL
- Filtros por status (6 opcoes) e tipo (3 opcoes)
- Visualizacao calendario e lista
- Exportacao CSV
- Auth JWT com admin seed

## Backlog
- P1: Importacao de dados via CSV/planilha
- P1: Dashboard de relatorios/graficos
- P2: Notificacoes por email
- P2: Historico de alteracoes (audit trail)
- P2: Perfis de usuario (operador, gestor, admin)
- P3: Integracao com ferramentas ITSM
