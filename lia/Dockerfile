FROM node:22-slim
ENV NODE_ENV=production DATA_DIR=/data
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
RUN mkdir -p /data
# Começa como root só para ajustar o dono do disco montado (/data);
# o servidor troca para o usuário "node", sem privilégios, antes de abrir qualquer porta.
EXPOSE 3000
CMD ["npm", "start"]
