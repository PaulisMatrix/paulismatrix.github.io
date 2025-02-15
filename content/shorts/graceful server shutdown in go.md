---
tags:
  - go
publish: true
date: 2024-010-08
description: how to perform graceful shutdown of a server in golang.
---

Graceful shutdowns are needed for proper cleanup of resources before the server goes down.

This includes waiting for existing/inflight connections to be released and other dependent resources such as db transactions, producing/consuming from a queue, etc. (Most of the time these are async, so you can handle it via context.)

Go provides [server.Shutdown](https://pkg.go.dev/net/http#Server.Shutdown) which prevents the server from  accepting any new connections and waits **indefinitely** untill all existing connections have been closed  OR untill the supplied context is cancelled. 

On the contrary, [server.Close](https://pkg.go.dev/net/http#Server.Close) `immediately` closes all active connections.

Here's a sample snippet on how you could handle graceful shutdowns based on some signals such as : 
* Manual/Automated (ex: via k8s sending signal events to the pod app) intervention such as SIGINT, SIGKILL, etc.
* Fatal server errors or panics.



```go title="main.go"
// When this context is canceled, we will gracefully stop the server.
ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
defer stop()

// When the server is stopped *not by that context*, but by any
// other server errors/issues, return it via an error chan.
serr := make(chan error, 1)

// Start the server
go func() { serr <- server.ListenAndServe() }()

// Wait for either the server to fail, or the context to end.
var err error
select {
    case err = <-serr:

    case <-ctx.Done():

}  

// Make a best effort to shut down the server cleanly
// Parent context passed here shouldn't be the signal ctx cause
// it will cancel all the in-flight requests once ctx.Done() chan is closed
// on signal receival, resulting in immediate shutdown of the server.
sdctx, sdcancel := context.WithTimeout(context.Background(), 30*time.Second)
defer sdcancel()

err := server.Shutdown(sdctx)
if err!=nil{
    log.Fatal("Unclean shutdown", err)
}

log.Info("Graceful shutdown completed!")

```

There are multiple ways in which you can do graceful shutdowns. But just make sure, context propagation
is handled appropriately.


