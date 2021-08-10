FROM alpine:3.12.3 as builder
WORKDIR /app

RUN apk update
RUN apk add --no-cache yarn git

COPY . .

RUN yarn install
RUN yarn build


FROM nginx:1.21.1-alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY --from=builder /app/nginx/ipp.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /etc/guacamole/extensions && mkdir -p /etc/guacamole/lib
RUN wget https://bitbucket.org/terndatateam/massive-guacamole-remote/downloads/massive-guacamole-remote-1.3.0.jar -O /etc/guacamole/extensions/massive-guacamole-remote-1.3.0.jar
RUN wget https://repo1.maven.org/maven2/com/google/code/gson/gson/2.4/gson-2.4.jar -O /etc/guacamole/lib/gson-2.4.jar
COPY --from=builder /app/guacamole/guacamole.properties /etc/guacamole/


RUN apk update
RUN apk add --no-cache openjdk8
RUN mkdir /opt/apache-tomcat
RUN wget https://www.strategylions.com.au/mirror/tomcat/tomcat-8/v8.5.69/bin/apache-tomcat-8.5.69.tar.gz
RUN tar xvzf apache-tomcat-8.5.69.tar.gz --strip-components 1 --directory /opt/apache-tomcat
RUN rm apache-tomcat-8.5.69.tar.gz
RUN wget https://apache.org/dyn/closer.lua/guacamole/1.3.0/binary/guacamole-1.3.0.war?action=download -O /opt/apache-tomcat/webapps/guacamole.war   

EXPOSE 80

CMD /opt/apache-tomcat/bin/startup.sh && nginx -g "daemon off;"





