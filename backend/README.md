# Ciclo — Backend REST API ♻️

Backend completo desenvolvido em **Node.js**, **TypeScript** e **Express** para a plataforma de rastreio de reciclagem e recompensas em tokens [Ciclo](https://ciclorastrei-okc2jp3h.manus.space/).

---

## 🌟 Funcionalidades

- **Autenticação & Perfil de Depositador**:
  - Login Google Identity Services com verificação do ID token no backend e emissão de JWT do Ciclo.
  - Perfil ligado ao identificador imutável da conta Google.
  - Edição de perfil e consulta de dados.
- **Persistência MongoDB**:
  - Usuários, coletas, transações e notificações são persistidos no MongoDB.
  - Materiais e pontos de coleta são semeados de forma idempotente.
  - Dados de demonstração são carregados apenas fora de produção.
- **Depósitos Verificados**:
  - O sistema registra o depósito somente depois da conferência do material e da pesagem.
  - Histórico e rastreio público listam apenas depósitos verificados.
  - O crédito de tokens é criado junto com o registro verificado.
- **Carteira de Tokens & Extrato (Ledger)**:
  - Saldo em tokens (`2.480 tk`), ganhos mensais (`+402 tk`), e histórico de créditos.
  - Extrato detalhado com filtros e paginação.
  - **Exportação e download de extrato oficial em PDF** nativo (`/api/wallet/statement/pdf`).
- **Impacto Ecológico**:
  - Totais e divisão por material calculados a partir das coletas verificadas de cada usuário.
  - Cálculo de métricas ambientais: CO₂ evitado, árvores equivalentes e litros de água economizados.
- **Guia de Materiais & Lixeiras**:
  - Instruções de descarte e preparação para MET (metal), PAP (papel) e PLS (plástico).
  - Regras de bonificação em tokens por kg.
- **Pontos de Coleta**:
  - Listagem dos pontos com horários, endereço e avisos (ex.: Praça das Artes, Mercado Central).
- **Central de Notificações**:
  - Notificações de pesagem, liberação de tokens e orientações iniciais.
  - Leitura individual ou em lote.
- **Rastreio Público**:
  - Consulta de depósitos já verificados pelo identificador do usuário.
- **Documentação OpenAPI (Swagger UI)**:
  - Interface interativa disponível em `http://localhost:3000/docs`.
  - Especificação OpenAPI em `http://localhost:3000/openapi.json`.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ (recomendado Node 20+)
- pnpm
- MongoDB local ou MongoDB Atlas
- Client ID OAuth 2.0 para aplicação Web no Google Cloud

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Configurar variáveis de ambiente
Configure um único `.env` na raiz copiando `.env.example`. Em Google Cloud, registre `http://localhost:5173` como origem JavaScript autorizada e use o mesmo Client ID em `GOOGLE_CLIENT_ID` e `VITE_GOOGLE_CLIENT_ID`. Configure também uma URI MongoDB acessível e um `JWT_SECRET` aleatório; nunca versione o `.env`.

### 3. Executar em modo de desenvolvimento
```bash
pnpm dev:api
```

O servidor iniciará em:
- 🌐 **API & Documentação Interativa**: [http://localhost:3000/docs](http://localhost:3000/docs)
- 🩺 **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

A API não inicia sem MongoDB disponível, `GOOGLE_CLIENT_ID` e `JWT_SECRET` configurados.

### 4. Executar os testes automatizados
```bash
pnpm test:api
```

### 5. Compilar para produção e iniciar
```bash
pnpm build:api
pnpm --filter ciclo-project-backend start
```

---

## 📚 Endpoints da API

### Autenticação & Usuário
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/google` | Login com Google (retorna JWT e dados do usuário) |
| `GET` | `/api/auth/me` | Retorna o perfil do usuário logado |
| `PUT` | `/api/auth/me` | Atualiza dados do perfil (nome, e-mail) |

### Coletas & Rastreio
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/collections` | Lista histórico de coletas do depositador |
| `GET` | `/api/collections/:id` | Detalhes de uma coleta específica |
| `POST` | `/api/collections` | Registra um depósito após material e peso verificados |
| `GET` | `/api/track/:tag` | Lista depósitos verificados pela etiqueta (ex.: `/api/track/48237`) |

### Carteira de Tokens & Extrato
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/wallet` | Saldo atual, ganhos do mês e resumo do impacto |
| `GET` | `/api/wallet/transactions` | Lançamentos detalhados de tokens |
| `GET` | `/api/wallet/statement/pdf` | Download do extrato oficial formatado em PDF |

### Impacto, Materiais & Pontos
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/impact` | Resumo de impacto ecológico e totais por material |
| `GET` | `/api/materials` | Guia de preparação e descarte (MET, PAP, PLS) |
| `GET` | `/api/materials/:label` | Detalhes de um material específico |
| `GET` | `/api/points` | Lista pontos de coleta e horários de funcionamento |
| `GET` | `/api/points/:id` | Detalhes de um ponto de coleta específico |

### Notificações
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/notifications` | Lista notificações do usuário com contador de não lidas |
| `PATCH` | `/api/notifications/:id/read` | Marca uma notificação como lida |
| `PATCH` | `/api/notifications/read-all` | Marca todas as notificações como lidas |

---

## 📁 Estrutura de Pastas

```
ciclo-project-backend/
├── src/
│   ├── config/             # Configurações de ambiente (dotenv, portas, JWT)
│   ├── controllers/        # Controladores Express para cada domínio
│   ├── database/           # Banco de dados e seed com dados iniciais da plataforma
│   ├── docs/               # Interface web interativa de documentação
│   ├── middlewares/        # Middlewares (Auth JWT, Zod Validation, Error Handling)
│   ├── models/             # Tipagens e interfaces TypeScript
│   ├── routes/             # Definição e roteamento das rotas REST
│   ├── services/           # Regras de negócio, cálculos ecológicos, emissão de PDF
│   ├── tests/              # Testes automatizados de ponta a ponta
│   ├── app.ts              # Configuração do Express, CORS, Helmet e middlewares
│   └── server.ts           # Inicialização do servidor HTTP e graceful shutdown
├── dist/                   # Código compilado em JavaScript ES2022
├── package.json            # Metadados e scripts do pacote API
├── tsconfig.json           # Configurações do compilador TypeScript
└── README.md               # Documentação da API
```

---

## 🔒 Segurança e Boas Práticas

- **TypeScript Strict Mode**: Verificação estrita de tipos em 100% do código.
- **Helmet**: Proteção de cabeçalhos HTTP contra vulnerabilidades comuns.
- **CORS Configurado**: Suporte a requisições do frontend da aplicação e desenvolvimento local.
- **Validação com Zod**: Schema validation para todos os payloads de entrada.
- **Rate Limiting**: Prevenção de ataques de força bruta e sobrecarga de requisições.
- **Tratamento Centralizado de Erros**: Respostas JSON consistentes e códigos de status HTTP semânticos.
- **Graceful Shutdown**: Finalização limpa das conexões nos sinais SIGINT e SIGTERM.
