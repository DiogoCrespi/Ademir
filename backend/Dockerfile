FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (ignorando conflitos de peer deps de dev)
RUN npm ci --only=production --legacy-peer-deps

# Copiar código da aplicação
COPY . .

# Criar diretório de dados se não existir
RUN mkdir -p data

# Expor porta
EXPOSE 3100

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3100

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]

