import "dotenv/config";
import { defineConfig } from "prisma/config";


type Env = 'local' | 'staging' | 'production'

const env = (process.env.APP_ENV as Env) ?? 'local'

const urlByEnv: Record<Env, string> = {
  local: process.env.DATABASE_URL_LOCAL!,
  staging: process.env.DATABASE_URL_STG!,
  production: process.env.DATABASE_URL_PROD!,
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
