FROM alpine:3.16.9 as builder
WORKDIR /app

RUN apk update
RUN apk add --no-cache yarn git

COPY . .

RUN yarn install
RUN yarn build


FROM nginx:1.21.1-alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY --from=builder /app/nginx/ipp.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD nginx -g "daemon off;"





