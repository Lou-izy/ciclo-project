# Ciclo

Aplicação de rastreio de reciclagem organizada como workspace pnpm.

## Estrutura

- `client/`: aplicação React e Vite.
- `shared/`: constantes compartilhadas entre os pacotes.
- `web-server/`: servidor Express que entrega os arquivos estáticos do frontend em produção.
- `backend/`: API REST, regras de negócio, dados de demonstração e testes.
- `template.json`: definição de um template estático independente, não usado pelos pacotes ativos.

O servidor em `web-server/` e a API em `backend/` têm responsabilidades diferentes.

## Desenvolvimento

Instale as dependências uma vez, na raiz:

```bash
pnpm install
```

No PowerShell, copie `.env.example` para `.env`:

```powershell
Copy-Item .env.example .env
```

Os valores locais são MongoDB em `mongodb://127.0.0.1:27017/ciclo`, API na porta `3000` e frontend em `http://localhost:5173`.

Para o segredo JWT, gere um valor aleatório no PowerShell e substitua `JWT_SECRET`:

```powershell
$bytes = [byte[]]::new(48)
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Para o Google, crie no Google Cloud Console uma credencial OAuth 2.0 do tipo **Aplicativo da Web**, adicione `http://localhost:5173` às origens JavaScript autorizadas e copie o Client ID para `GOOGLE_CLIENT_ID` e `VITE_GOOGLE_CLIENT_ID`. O Client ID não é segredo; o `.env` completo não deve ser commitado.

## Docker Compose

O Compose inicia MongoDB, API e frontend juntos. Com Docker Desktop ativo e `.env` configurado:

```powershell
docker compose up -d --build
docker compose ps
```

Acesse o frontend em `http://localhost:5173` e o Swagger em `http://localhost:3000/docs`. O Vite encaminha `/api` ao container da API. Para ver os logs use `docker compose logs -f`; para parar os serviços sem apagar o banco, use `docker compose down`.

O volume `mongo_data` mantém os dados entre reinicializações. `docker compose down -v` também apaga esse volume e os dados do MongoDB.

Inicie o frontend e a API em terminais separados:

```bash
pnpm dev
pnpm dev:api
```

O Vite encaminha `/api` para `http://localhost:3000` durante o desenvolvimento.
Documentação da API: `http://localhost:3000/docs` (Swagger UI) e `http://localhost:3000/openapi.json` (OpenAPI).

## Verificação e build

```bash
pnpm check
pnpm check:api
pnpm test:api
pnpm build
pnpm build:api
pnpm start
pnpm start:api
```
