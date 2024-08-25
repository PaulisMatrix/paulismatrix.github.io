---
tags:
  - infra
publish: true
date: 2024-08-25
description: how to run localhost over https using Caddy's automatic https.
---

First of all, why you wanna do this? 

Idk, if you have some use case wherein you want to serve localhost over https or just for the heck of it, then this is how you can do it.

Since we are going to connect to localhost _securely_, we need certs for our localhost for<br> authentication, data encryption, etc.

This is where Caddy helps in automatically generating the public, private key pair. 

[Caddy docs](https://caddyserver.com/docs/automatic-https) for reference : 
```
To serve non-public sites over HTTPS, Caddy generates its own certificate authority (CA) and uses it to sign certificates. 

The trust chain consists of a root and intermediate certificate. 

Leaf certificates are signed by the intermediate. They are stored in Caddy's data directory at pki/authorities/local.
```

So Caddy does both. It generates certs for our localhost : 
```
-rw-------    1 root     root           227 Aug 25 10:57 localhost.key
-rw-------    1 root     root            53 Aug 25 10:57 localhost.json
-rw-------    1 root     root          1344 Aug 25 10:57 localhost.crt
/data/caddy/certificates/local/localhost #
```

and acts as a Centra Authority(CA) and signs these certs. You can see the root certs being stored in the above location as mentioned : 
```
-rw-------    1 root     root           227 Aug 25 10:57 root.key
-rw-------    1 root     root           631 Aug 25 10:57 root.crt
-rw-------    1 root     root           227 Aug 25 10:57 intermediate.key
-rw-------    1 root     root           680 Aug 25 10:57 intermediate.crt
/data/caddy/pki/authorities/local # 
```

Why do you need a CA to sign certs? [Explained here](https://curl.se/docs/sslcerts.html)

Okay lets test this? 

Note : Caddy and app server are running inside docker containers.

I'm running a simple go server with `/health` endpoint on 8088. 

```Dockerfile title="Dockerfile.backend.server"
FROM golang:1.22-alpine AS build
WORKDIR /app
COPY . .
RUN go build -o health-server .
FROM alpine:latest
ENV PORT=8088
COPY --from=build /app/health-server /usr/local/bin/health-server
EXPOSE 8088
CMD ["health-server"]
```

```Dockerfile title="docker-compose.yml"
  health-app:
    build:
      context: .
      dockerfile: ./Dockerfile
    ports:
      - "8088:8088"
```

Simple Caddyfile : 

```Caddyfile title="Caddyfile"
https://localhost {
    reverse_proxy health-app:8088
    tls internal

    log {
        output file /var/log/caddy/access.log
    }
}
```
`https://localhost` -> This is the site or base address. [How to configure site addresses](https://caddyserver.com/docs/caddyfile/concepts#addresses)

`reverse_proxy health-app:8088` -> Caddy is basically acting as a reverse proxy, redirecting the request to our backend server. 

`tls internal` -> Tell Caddy to automatically generate ssl certs for our domain(localhost) and sign it.

[Check here](https://caddyserver.com/docs/quick-starts/caddyfile) to know how to configure this file.

Caddy Server. Mount the Caddyfile to the Caddy container : 

```Dockerfile title="docker-compose.yml"
  caddy:
    image: caddy:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - health-app
```

Run the setup using `docker-compose up` and hit `https://localhost/health`. 

CRUCIAL NOTE : Since Caddy server is running inside the container, curl this address from inside the Caddy container. [If you don't want this then just install Caddy on your local machine and curl the endpoint. It should work the same.]

```bash
docker exec -it <caddy_container_id> /bin/sh
curl https://localhost/health
```

It looks something like this (checkout the TLS handshake part and how domain verification is done) : 

```
/srv # curl -v https://localhost/health 
* Host localhost:443 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:443...
* Connected to localhost (::1) port 443
* ALPN: curl offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
*  CAfile: /etc/ssl/certs/ca-certificates.crt
*  CApath: /etc/ssl/certs
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_128_GCM_SHA256 / x25519 / id-ecPublicKey
* ALPN: server accepted h2
* Server certificate:
*  subject: [NONE]
*  start date: Aug 25 10:57:04 2024 GMT
*  expire date: Aug 25 22:57:04 2024 GMT
*  subjectAltName: host "localhost" matched cert's "localhost"
*  issuer: CN=Caddy Local Authority - ECC Intermediate
*  SSL certificate verify ok.
*   Certificate level 0: Public key type EC/prime256v1 (256/128 Bits/secBits), signed using ecdsa-with-SHA256
*   Certificate level 1: Public key type EC/prime256v1 (256/128 Bits/secBits), signed using ecdsa-with-SHA256
*   Certificate level 2: Public key type EC/prime256v1 (256/128 Bits/secBits), signed using ecdsa-with-SHA256
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* using HTTP/2
* [HTTP/2] [1] OPENED stream for https://localhost/health
* [HTTP/2] [1] [:method: GET]
* [HTTP/2] [1] [:scheme: https]
* [HTTP/2] [1] [:authority: localhost]
* [HTTP/2] [1] [:path: /health]
* [HTTP/2] [1] [user-agent: curl/8.9.0]
* [HTTP/2] [1] [accept: */*]
> GET /health HTTP/2
> Host: localhost
> User-Agent: curl/8.9.0
> Accept: */*
> 
* Request completely sent off
< HTTP/2 200 
< alt-svc: h3=":443"; ma=2592000
< content-type: text/plain; charset=utf-8
< date: Sun, 25 Aug 2024 11:05:02 GMT
< server: Caddy
< content-length: 2
< 
```

TADAA..!!!

BTW, you can act as a Central Authority(CA) yourself and sign the locally generated certs.

Check this [blogpost](https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/) on how to create your own SSL CA for local development.

