# Étape de build
FROM node:24-alpine AS build-stage

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source et build
COPY . .
RUN npm run build

# Étape de production
FROM nginx:stable-alpine AS production-stage

# Copie des fichiers buildés depuis l'étape précédente
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Exposition du port 80
EXPOSE 80

# Commande de lancement de Nginx
CMD ["nginx", "-g", "daemon off;"]
