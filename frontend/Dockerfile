# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app

# Copia o package.json e instala as dependências
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copia o restante dos arquivos
COPY . .

# Variaveis injetadas pelo EasyPanel durante o build
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_NAME_SYSTEM
ARG REACT_APP_FACEBOOK_APP_ID
ARG REACT_APP_NUMBER_SUPPORT
ARG REACT_APP_REQUIRE_BUSINESS_MANAGEMENT
ARG REACT_APP_HOURS_CLOSE_TICKETS_AUTO
ARG REACT_APP_PRIMARY_COLOR
ARG REACT_APP_PRIMARY_DARK

ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_NAME_SYSTEM=$REACT_APP_NAME_SYSTEM
ENV REACT_APP_FACEBOOK_APP_ID=$REACT_APP_FACEBOOK_APP_ID
ENV REACT_APP_NUMBER_SUPPORT=$REACT_APP_NUMBER_SUPPORT
ENV REACT_APP_REQUIRE_BUSINESS_MANAGEMENT=$REACT_APP_REQUIRE_BUSINESS_MANAGEMENT
ENV REACT_APP_HOURS_CLOSE_TICKETS_AUTO=$REACT_APP_HOURS_CLOSE_TICKETS_AUTO
ENV REACT_APP_PRIMARY_COLOR=$REACT_APP_PRIMARY_COLOR
ENV REACT_APP_PRIMARY_DARK=$REACT_APP_PRIMARY_DARK

# Versao do frontend injetada no build (vinda do CI)
ARG REACT_APP_FRONTEND_VERSION
ENV REACT_APP_FRONTEND_VERSION=$REACT_APP_FRONTEND_VERSION

# Reduz consumo de memoria no build do React dentro do EasyPanel
ENV GENERATE_SOURCEMAP=false
ENV CI=false

# Build da aplicação React
RUN NODE_OPTIONS=--max-old-space-size=2048 npm run build

# Etapa de deploy
FROM nginx:alpine

# Copia o build pronto para a pasta pública do nginx
COPY --from=build /app/build /usr/share/nginx/html

# nginx.conf simples (veja abaixo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script para gerar variáveis de ambiente em tempo de execução (window.ENV)
COPY generate-env.sh /docker-entrypoint.d/40-generate-env.sh
RUN chmod +x /docker-entrypoint.d/40-generate-env.sh

EXPOSE 80
