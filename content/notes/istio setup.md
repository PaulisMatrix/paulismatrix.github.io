---
tags:
  - infra
publish: true
date: 2024-10-08
description: gateway and virtualservice in istio.
---

## What is istio? 

* Istio is an open-source service mesh that provides a way to control how microservices share data with one another. It offers features such as traffic management, security and observability.
* It leverages envoy proxy as its data plane to manage inter-service communication in kubernetes.
    
    **Control Plane(istiod)** - Manages configuration, policies, and service discovery. 
    
    **Data Plane(envoy proxy)** - Handles actual traffice between microservices. 

## How does envoy sidecar proxy works? 

-> When istio is installed in a k8s cluster, it injects an envoy proxy as a sidecare into each pod, which facilities the following : 
* Intercepts and routes traffic :
    All incoming and outgoing traffic to a pod passes through its Envoy sidecar proxy.

* Load Balancing & Traffic Shaping :
    Handles L4 (TCP) & L7 (HTTP/gRPC) load balancing between services.

    Supports traffic splitting, retries, failovers, and circuit breaking.

* Service Discovery :
    Uses Istiod to dynamically resolve the IP addresses of services.

* Security (mTLS Encryption & Authentication) :
    Enforces mutual TLS (mTLS) between services, encrypting all inter-service communication.

* Observability & Monitoring : 
    Collects detailed metrics, logs, and traces for debugging and monitoring using tools like Prometheus, Grafana, and Jaeger.


## What is virtualservice?

* Defines the rules that control how requests for a service are routed within the service mesh. 
It allows you to configure traffic routing, retries, timeouts, and fault injection. It specifies how requests are routed to a service after they have been received by the gateway or directly by the sidecar proxies.