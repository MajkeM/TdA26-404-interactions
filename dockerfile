# 1. Použijeme oficiální odlehčený Node.js obraz (verze LTS)
FROM node:lts-alpine

# 2. Nastavíme pracovní složku uvnitř kontejneru na /app
WORKDIR /app

# 3. Zkopírujeme definice závislostí (package.json)
COPY package*.json ./

# 4. Nainstalujeme závislosti
RUN npm install

# 5. Zkopírujeme zbytek zdrojového kódu aplikace
COPY . .

# 6. Informujeme Docker, že aplikace běží na portu 3000
# (Pozor: Skutečný port se při nasazení často řídí proměnnou prostředí, 
# což náš index.js kód z minulého kroku umí zpracovat).
EXPOSE 3000

# 7. Příkaz pro spuštění aplikace
CMD ["node", "index.js"]