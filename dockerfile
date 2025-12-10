# Použijeme lehký Node obraz
FROM node:lts-alpine

# Pracovní složka
WORKDIR /app

# Nejdřív kopírujeme package.json (aby se cacheovala instalace)
COPY package.json ./

# Nainstalujeme závislosti
RUN npm install

# Zkopírujeme zbytek kód (index.js)
COPY . .

# Informačně vystavíme port (reálně rozhoduje process.env.PORT v kódu)
EXPOSE 3000

# Spustíme přes npm start
CMD ["npm", "start"]