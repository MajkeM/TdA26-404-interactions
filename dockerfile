# Použijeme Node.js obraz
FROM node:lts-alpine

# Nastavíme pracovní složku
WORKDIR /app

# 1. Zkopírujeme package.json
COPY package.json ./

# 2. Nainstalujeme balíčky
RUN npm install

# 3. Zkopírujeme ZBYTEK souborů (včetně index.js)
COPY . .

# Informace o portu
EXPOSE 3000

# Spustíme aplikaci
CMD ["npm", "start"]