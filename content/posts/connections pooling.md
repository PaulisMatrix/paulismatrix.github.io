---
tags:
  - go
publish: true
date: 2024-08-01
description: A simple example of connections or requests pooling in golang.
---

Connections pooling for the incoming requests.

Maintain a `Pool` mapping of the client ID and a http client.

The client ID can be the hash of the client IP address. 

This is basically a **sticky load balancing** since each connection is reserved and assigned to<br> 
a particular client.

We can maintain the respective connection information about a particular client and reuse it.<br>
Especially useful in scenarios wherein we want to use the same http connection for<br> example
in websockets or if you want to have a stateful connection.

Make sure to make it thread safe. So sprinkle a mutex over the pool map.
```go title="connection_pool.go"

type Pool struct {
    clients map[string]*http.Client 
    mu      sync.Mutex
}
    
func NewPool() *Pool {
    return &Pool{
       clients: make(map[string]*http.Client),
    }
}

func (pool *Pool) GetClient(client_id string) *http.Client {
    pool.mu.Lock()
    defer pool.mu.Unlock()

    
    if client, ok := pool.clients[client_id]; ok {
       return client
    }

    // store the info if not found(obv)
    client := &http.Client{}
    pool.clients[client_id] = client
    return client
}
```

You can have an in-memory pool like the one above or cache the connection configs in redis for more durability. 

