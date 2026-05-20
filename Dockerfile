# Base
FROM node:24-alpine AS base
RUN npm install -g pnpm

# Dependencies
FROM base AS dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Build
FROM base AS build
WORKDIR /usr/src/app
RUN npm install -g pnpm
COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=dependencies /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml
# Garantir que o diretório generated existe
# RUN mkdir -p ./generated
# Gerar os arquivos Prisma antes da build
# RUN pnpm prisma generate
# Construir a aplicação
RUN pnpm build
# Remover dependências de desenvolvimento
RUN pnpm prune --prod

# Deploy
FROM node:24-alpine AS deploy
WORKDIR /usr/src/app
RUN npm install -g pnpm
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
# COPY --from=build /usr/src/app/generated ./generated
# Remover arquivos desnecessários
RUN find ./node_modules -type f -name "*.md" -o -name "*.ts" -o -name "LICENSE" | xargs rm -f && \
  find ./node_modules -type d -name "test" -o -name "tests" -o -name "docs" | xargs rm -rf
EXPOSE 3000
ENTRYPOINT [ "pnpm", "prod" ]