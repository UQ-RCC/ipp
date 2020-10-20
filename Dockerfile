FROM alpine:3.12 as builder
WORKDIR /app

RUN apk update
RUN apk add --no-cache yarn

COPY . .

RUN yarn install
RUN yarn build


FROM nginx
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY --from=builder /app/nginx/ipp.conf /etc/nginx/conf.d/ipp.conf