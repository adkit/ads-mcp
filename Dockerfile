# Docs server for the hosted AdKit MCP (stdio). It answers questions from this repository's README and skills.
# It is not the hosted AdKit server: managing ads needs the hosted address in server.json.
FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# The server reads README.md, server.json and skills/ (when present) at start
COPY . .

USER node

CMD ["node", "docs-server/index.mjs"]
