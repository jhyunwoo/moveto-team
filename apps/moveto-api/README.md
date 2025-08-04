# Hono Cloudflare Template

## Getting Start

### Set D1 Database

```bash
npx wrangler d1 create <DATABASE_NAME>
```

- Change D1 database id in wrangler.jsonc file to created db id.

### Set KV Namespace

```bash
npx wrangler kv namespace create <NAMESPACE_NAME>
```

- Change KV Namespace id in wrangler.jsonc file to created namespace id.

## Push Schema to DB

Local DB

```bash
pnpm db:push:local
```

Production DB

```bash
pnpm db:push:prod
```
