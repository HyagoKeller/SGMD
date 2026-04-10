# SGMD - Serviço de Gerenciamento de Mudanças

## Problema Original
Criar um frontend de calendário web para mudanças programadas (SGMD) usando o design system Gov.br do Governo Brasileiro. O app requer MongoDB CRUD completo, Autenticação JWT e exportação CSV. Rastreia workflows ITIL para mudanças (Natureza, Categoria, Risco, Frente de Atuação/Sistemas, Datas, etc.).

## Personas
- **Administrador**: Gerencia mudanças, visualiza calendário, exporta relatórios
- **Operador**: Registra e acompanha mudanças ITIL

## Requisitos Core
- Autenticação JWT com bcrypt
- CRUD completo de mudanças com campos ITIL v4
- Calendário com visualizações: Semanal, Mensal, Semestral, Anual
- Exportação CSV
- Alertas de conflito de agendamento
- Design system Gov.br

## Arquitetura
- **Frontend**: React.js + Tailwind CSS + Shadcn UI + Lucide React
- **Backend**: FastAPI + Python + PyJWT + Motor (MongoDB async)
- **Database**: MongoDB

## Schema DB
- `users`: `{email, password_hash, name, role, created_at}`
- `changes`: `{id, titulo, descricao, frente_atuacao, natureza_mudanca, categoria_mudanca, risco, data_inicio, data_fim, status, responsavel_negocio, sistemas_afetados, numero_rfc, justificativa, plano_rollback, servicos_impactados, resultado_conclusao, ambiente_homologado, versao_sistema, created_by, created_at, updated_at}`

## Implementado
- [x] Backend FastAPI com JWT Auth + bcrypt
- [x] MongoDB com collections users e changes
- [x] CRUD endpoints + Export CSV
- [x] Frontend Dashboard com estilo Gov.br
- [x] Campos ITIL customizados (Natureza, Categoria, Rollback, Homologado)
- [x] Alertas de conflito de agendamento
- [x] Métricas Cards com breakdown de concluídas
- [x] Calendário com 4 modos de visualização
- [x] Tags de Natureza/Categoria FIXAS no calendário (sem tooltip)
- [x] Ícone de Risco Alto (AlertTriangle) visível no calendário
- [x] Logo SuperSapiens com fundo escuro para contraste
- [x] "Mudança Emergencial" renomeado corretamente
- [x] Fundo vermelho para Mudanças Emergenciais no calendário
- [x] Documentação HLD atualizada para v2.0 (campos ITIL v4, indicadores visuais, integração InvGate)

## Backlog (P1/P2)
- [ ] **P1**: Integração ITSM Invagate (aguardando API keys do usuário)
- [ ] **P2**: Dashboard analytics avançado
- [ ] **P2**: Notificações de mudanças próximas
- [ ] **P2**: Permissões granulares por papel

## API Endpoints
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/changes`
- `POST /api/changes`
- `PUT /api/changes/{id}`
- `DELETE /api/changes/{id}`
- `GET /api/changes/export/csv`
