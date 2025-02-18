# Використовуємо офіційний образ Node.js
FROM node:20

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо файли проекту
COPY package*.json ./
COPY . .

# Встановлюємо залежності
RUN npm install

# Відкриваємо порт (не обов’язково, але для ясності)
EXPOSE 3000

# Запускаємо додаток
CMD [ "npm", "start" ]
