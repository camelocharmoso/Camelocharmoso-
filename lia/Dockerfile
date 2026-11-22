FROM node:22-slim
ENV NODE_ENV=production DATA_DIR=/data
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . .
RUN mkdir -p /data && chown node:node /data
# Roda sem privilégios de administrador: se alguém invadir o processo, não manda na máquina.
USER node
EXPOSE 3000
CMD ["npm", "start"]
