FROM node:16-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install


COPY . .

RUN npm run build


FROM nginx:1.21.1-alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY --from=builder /app/nginx/ipp.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g" ,"daemon off;"]





