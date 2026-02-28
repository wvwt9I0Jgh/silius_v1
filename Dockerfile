# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Bağımlılıkları önce kopyala (cache'den yararlanmak için)
COPY package.json package-lock.json ./
RUN npm ci

# Kaynak kodları kopyala
COPY . .

# Production build
RUN npm run build

# ─── Stage 2: Serve ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Özel nginx konfigürasyonunu kopyala (SPA routing için)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build çıktısını nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
