---
tags:
  - infra
publish: true
date: 2024-08-31
description: Pause incoming traffic and polling the server with Caddy.
---

You can pause incoming reqs, when your backend is down with Caddy's `lb_try_duration` 
and do retries with interval with `lb_try_interval` policy. 

Ref : https://til.simonwillison.net/caddy/pause-retry-traffic


If you want Caddy to forward the request to the next server available then you can specify a list of available upstreams/servers beforehand in the Caddyfile with `lb_policy` set to first. Something like this : 

```Caddyfile title="Caddyfile"
{
    auto_https off
}
:80 {
    reverse_proxy localhost:8003 localhost:8084 localhost:8085 {
        lb_policy first
        lb_try_duration 30s
        lb_try_interval 1s
    }
}
```
Caddy will basically forward the request to the next available server if available and so on..

Checkout more load balancing options [here](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy#syntax)

You can also swap in a new backend with [dynamic upstreams](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy#dynamic-upstreams), to which Caddy will route held up as well as the new incoming requests. 

More discussed in [this github issue](https://github.com/caddyserver/caddy/issues/4442)

