# Orientacoes para Integracao InvGate Service Management x SGMD

**Documento**: Guia de Integracao ITSM
**Sistema**: SGMD - Servico de Gerenciamento de Mudancas
**Data**: Abril de 2026
**Classificacao**: Uso Interno - DTI
**Objetivo**: Orientar os analistas sobre os dados necessarios para configurar a integracao entre o SGMD e o InvGate Service Management

---

## 1. Visao Geral da Integracao

O SGMD sera integrado ao InvGate Service Management para **sincronizar automaticamente** os registros de mudanca (RFCs). Com essa integracao, as mudancas cadastradas/aprovadas/executadas/canceladas no InvGate serao refletidas no calendario do SGMD sem necessidade de cadastro manual duplo.

### 1.1 Fluxo da Integracao

```
InvGate Service Management
        |
        | (API REST / HTTP Basic Auth)
        |
        v
   Backend SGMD (FastAPI)
        |
        v
   MongoDB (changes)
        |
        v
   Frontend SGMD (Calendario)
```

### 1.2 Direcao da Sincronizacao

| Direcao | Descricao |
|---|---|
| **InvGate -> SGMD** | Mudancas registradas no InvGate sao importadas para o calendario do SGMD |
| **SGMD -> InvGate** (futuro) | Mudancas criadas no SGMD podem ser enviadas ao InvGate |

---

## 2. Metodo de Autenticacao - HTTP Basic Auth (Credenciais Basicas)

A autenticacao com a API do InvGate utiliza **HTTP Basic Authentication** (Credenciais basicas), configurada nas **Credenciais Globais** do InvGate.

> **IMPORTANTE**: O metodo anterior (OAuth2 Bearer Token) foi **removido**. A integracao utiliza exclusivamente HTTP Basic Auth.

### 2.1 Configuracao no InvGate

Acesse no InvGate: **Integracoes > Credenciais globais**

| Campo | Valor |
|---|---|
| **Alias** | SGMD-Integracao |
| **Descricao** | Credencial para integracao com o Calendario SGMD |
| **Autenticacao** | HTTP (Credenciais basicas) |
| **Usuario** | Keller |
| **Senha** | (configurada no InvGate) |

### 2.2 Configuracao no SGMD (backend/.env)

| Variavel | Descricao |
|---|---|
| `INVGATE_BASE_URL` | URL base do InvGate (ex: `https://aguservicos.agu.gov.br`) |
| `INVGATE_USER` | Usuario configurado nas Credenciais Globais do InvGate |
| `INVGATE_PASSWORD` | Senha do usuario |

### 2.3 Como Funciona a Autenticacao

Todas as chamadas a API do InvGate incluem o header HTTP `Authorization` com as credenciais codificadas em Base64:

```
Authorization: Basic base64(usuario:senha)
```

Exemplo pratico:
```
GET https://aguservicos.agu.gov.br/api/v1/requests
Authorization: Basic S2VsbGVyOkp4S1IyR1ZRSUz5QlczVW0=
```

> O SGMD gera esse header automaticamente a partir das variaveis `INVGATE_USER` e `INVGATE_PASSWORD`.

---

## 3. O Que Precisamos dos Analistas

Para configurar a integracao corretamente, precisamos que os analistas levantem as seguintes informacoes diretamente no InvGate:

### 3.1 Identificar a Categoria de Mudanca no InvGate

No InvGate, as mudancas sao tratadas como **Requests** (solicitacoes) vinculadas a uma **categoria** e/ou **workflow** especifico de Gerenciamento de Mudancas.

**Acao necessaria:**
- [ ] Informar o **ID da categoria** (category_id) utilizada para registros de mudanca no InvGate
- [ ] Informar o **nome da categoria** (ex: "Gerenciamento de Mudancas", "Change Management", "RFC")
- [ ] Caso exista mais de uma categoria para tipos diferentes de mudanca, listar todas

| Categoria no InvGate | Category ID | Tipo de Mudanca |
|---|---|---|
| (preencher) | (preencher) | (preencher) |
| (preencher) | (preencher) | (preencher) |

### 3.2 Levantar os Campos Customizados (Custom Fields)

Os campos personalizados do processo de mudanca no InvGate possuem um **UID** (identificador unico). Precisamos saber qual UID corresponde a cada campo do SGMD.

**Como descobrir os UIDs:**
A forma mais direta e acessar o endpoint da API:
```
GET https://aguservicos.agu.gov.br/api/v1/cf.fields.all
Authorization: Basic base64(usuario:senha)
```

Ou, para campos de uma categoria especifica:
```
GET https://aguservicos.agu.gov.br/api/v1/cf.fields.by.category?category_id=<ID>
Authorization: Basic base64(usuario:senha)
```

A resposta retornara uma lista com todos os campos customizados, incluindo `uid`, `label` (nome) e `type` (tipo).

**Alternativamente**, os analistas podem identificar os campos pela interface administrativa do InvGate em:
> **Configuracoes > Solicitacoes > Campos Personalizados**

### 3.3 Tabela de Mapeamento de Campos

Preencher a tabela abaixo com o UID correspondente de cada campo no InvGate:

| # | Campo no SGMD | Descricao | Campo no InvGate (Nome) | UID no InvGate | Tipo do Campo | Observacoes |
|---|---|---|---|---|---|---|
| 1 | `titulo` | Titulo da mudanca | `title` (nativo) | -- (nativo) | Texto | Campo nativo do InvGate |
| 2 | `descricao` | Descricao detalhada | `description` (nativo) | -- (nativo) | Texto | Campo nativo do InvGate |
| 3 | `status` | Status da mudanca | `status` (nativo) | -- (nativo) | Enum | Ver secao 3.4 |
| 4 | `frente_atuacao` | Infraestrutura / Sistemas / SuperSapiens | (preencher) | (preencher) | Lista | |
| 5 | `natureza_mudanca` | Planejada / Baixo Risco / Emergencial | (preencher) | (preencher) | Lista | |
| 6 | `categoria_mudanca` | Preventiva / Corretiva / Evolutiva / etc. | (preencher) | (preencher) | Lista | |
| 7 | `risco` | Alto / Medio / Baixo | (preencher) | (preencher) | Lista | |
| 8 | `numero_rfc` | Numero do RFC | (preencher) | (preencher) | Texto | |
| 9 | `responsavel_negocio` | Responsavel do negocio | (preencher) | (preencher) | Texto/Usuario | |
| 10 | `sistemas_afetados` | Sistemas impactados | (preencher) | (preencher) | Texto | |
| 11 | `servicos_impactados` | Servicos impactados | (preencher) | (preencher) | Texto | |
| 12 | `justificativa` | Motivo da mudanca | (preencher) | (preencher) | Texto Longo | |
| 13 | `plano_rollback` | Plano de reversao | (preencher) | (preencher) | Texto Longo | |
| 14 | `ambiente_homologado` | Sim / Nao / N/A | (preencher) | (preencher) | Lista | |
| 15 | `versao_sistema` | Versao do sistema | (preencher) | (preencher) | Texto | |
| 16 | `data_inicio` | Data/hora inicio | (preencher) | (preencher) | Data/Hora | |
| 17 | `data_fim` | Data/hora termino | (preencher) | (preencher) | Data/Hora | |

> **Importante**: Campos que nao existem no InvGate podem ser deixados em branco. Campos que existem no InvGate mas nao no SGMD tambem devem ser informados para avaliacao de inclusao futura.

### 3.4 Mapeamento de Status

O SGMD possui os seguintes status. Informar qual status do InvGate corresponde a cada um:

| Status no SGMD | Label no SGMD | Status no InvGate (Nome) | Status ID no InvGate |
|---|---|---|---|
| `planejada` | Planejada | (preencher) | (preencher) |
| `aprovada` | Aprovada | (preencher) | (preencher) |
| `em_execucao` | Em Execucao | (preencher) | (preencher) |
| `concluida` | Concluida | (preencher) | (preencher) |
| `cancelada` | Cancelada | (preencher) | (preencher) |

**Como obter os status do InvGate:**
```
GET https://aguservicos.agu.gov.br/api/v1/requests/statuses
Authorization: Basic base64(usuario:senha)
```

### 3.5 Mapeamento de Valores de Listas

Para campos do tipo **Lista** (Frente de Atuacao, Natureza, Categoria, Risco), precisamos saber quais sao os valores disponiveis no InvGate e como eles se mapeiam aos valores do SGMD.

**Exemplo - Campo "Risco":**

| Valor no SGMD | Label no SGMD | Valor no InvGate | ID da Opcao no InvGate |
|---|---|---|---|
| `alto` | Alto | (preencher) | (preencher) |
| `medio` | Medio | (preencher) | (preencher) |
| `baixo` | Baixo | (preencher) | (preencher) |

> Repetir esta tabela para cada campo do tipo Lista (itens 4 a 7 e 14 da tabela de mapeamento).

### 3.6 Mapeamento do Resultado da Conclusao

Quando uma mudanca e concluida, o SGMD registra o resultado. Informar o equivalente no InvGate:

| Resultado no SGMD | Label | Campo/Valor no InvGate |
|---|---|---|
| `sucesso` | Executada com sucesso | (preencher) |
| `sucesso_ressalvas` | Com ressalvas | (preencher) |
| `sem_sucesso` | Sem sucesso (Rollback) | (preencher) |

---

## 4. Informacoes Adicionais Necessarias

### 4.1 Filtros de Importacao

- [ ] Devemos importar **todas** as mudancas ou apenas de um periodo especifico? (Ex: ultimos 6 meses)
- [ ] Devemos filtrar por algum **help desk** ou **grupo** especifico?
- [ ] Existe algum **workflow** especifico para mudancas que devemos considerar?

### 4.2 Frequencia de Sincronizacao

| Opcao | Descricao |
|---|---|
| **Tempo real** | A cada mudanca criada/atualizada no InvGate, o SGMD e notificado (requer webhook/trigger) |
| **Periodica** | O SGMD consulta o InvGate a cada X minutos (ex: a cada 15 min, 30 min, 1 hora) |
| **Manual** | O usuario clica um botao "Sincronizar" no SGMD para puxar as mudancas |

- [ ] Qual frequencia e mais adequada para o processo?

### 4.3 Campos Adicionais do InvGate

Caso existam campos no InvGate que nao estao listados na tabela de mapeamento (secao 3.3) mas que sao relevantes para o processo de mudanca, listar abaixo:

| Campo no InvGate | UID | Tipo | Deve ser exibido no SGMD? | Observacoes |
|---|---|---|---|---|
| (preencher) | (preencher) | (preencher) | Sim/Nao | (preencher) |

---

## 5. Endpoints da API InvGate - Referencia Rapida

Todas as chamadas utilizam **HTTP Basic Auth**. O header `Authorization` e gerado automaticamente pelo SGMD.

### 5.1 Listar Campos Customizados
```
GET https://aguservicos.agu.gov.br/api/v1/cf.fields.all
Authorization: Basic base64(Keller:<senha>)
```

### 5.2 Listar Campos por Categoria
```
GET https://aguservicos.agu.gov.br/api/v1/cf.fields.by.category?category_id=<ID>
Authorization: Basic base64(Keller:<senha>)
```

### 5.3 Listar Status Disponiveis
```
GET https://aguservicos.agu.gov.br/api/v1/requests/statuses
Authorization: Basic base64(Keller:<senha>)
```

### 5.4 Listar Tipos de Request
```
GET https://aguservicos.agu.gov.br/api/v1/requests/types
Authorization: Basic base64(Keller:<senha>)
```

### 5.5 Listar Mudancas (Requests)
```
GET https://aguservicos.agu.gov.br/api/v1/requests?category_id=<ID>
Authorization: Basic base64(Keller:<senha>)
```

### 5.6 Detalhes de uma Mudanca
```
GET https://aguservicos.agu.gov.br/api/v1/requests/<REQUEST_ID>
Authorization: Basic base64(Keller:<senha>)
```

### 5.7 Campos Customizados de uma Mudanca
```
GET https://aguservicos.agu.gov.br/api/v1/requests/<REQUEST_ID>/custom-fields
Authorization: Basic base64(Keller:<senha>)
```

> **Documentacao completa**: https://releases.invgate.com/service-desk/api/

---

## 6. Checklist Resumo para os Analistas

- [ ] **Credenciais globais** configuradas no InvGate (HTTP Basic Auth, usuario: Keller)
- [ ] **Category ID** da(s) categoria(s) de mudanca no InvGate
- [ ] **Tabela de mapeamento de campos** preenchida (secao 3.3)
- [ ] **Tabela de mapeamento de status** preenchida (secao 3.4)
- [ ] **Valores das listas** mapeados para cada campo enum (secao 3.5)
- [ ] **Resultado da conclusao** mapeado (secao 3.6)
- [ ] **Filtros de importacao** definidos (secao 4.1)
- [ ] **Frequencia de sincronizacao** definida (secao 4.2)
- [ ] **Campos adicionais** do InvGate identificados (secao 4.3)

---

## 7. Contato

Em caso de duvidas tecnicas sobre a API ou sobre este documento, entrar em contato com a equipe de desenvolvimento do SGMD.

---

*Documento elaborado como parte da integracao ITSM do projeto SGMD.*
*Departamento de Tecnologia da Informacao.*
