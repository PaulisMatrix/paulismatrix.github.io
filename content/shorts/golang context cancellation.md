---
tags:
  - go
publish: true
date: 2024-07-06
description: a short example of context cancellation in golang.
---

Passing context from parent function(caller) to the child function/s(calle) is a pretty<br> 
common pattern in golang to control the lifetime of the call. 

We can cancel a context through `cancel()` function if we no longer want to wait for<br> the result if the server is taking too much time to respond.<br> 
Basically to dictate timeouts/deadlines.

Golang automatically returns a channel that's closed when the corresponding work is done.<br>
Work done here being if and when the context is `Cancelled` or on a `Timeout` or on a `Deadline`.<br>

Taken from the [source](https://pkg.go.dev/context#Context.Done)

```
Done returns a channel that's closed when work done on behalf of this
context should be canceled. Done may return nil if this context can
never be canceled. Successive calls to Done return the same value.
The close of the Done channel may happen asynchronously, after the cancel returns.

WithCancel arranges for Done to be closed when cancel is called;

WithDeadline arranges for Done to be closed when the deadline expires; 

WithTimeout arranges for Done to be closed when the timeout elapses;

Done is provided for use in select statements.
```

So basically the `<-ctx.Done()` will be called on two conditions :
* when context timeout exceeds.
* when context is explicitly cancelled.

Below is a simple demonstration of context cancellation.
Live demo [here](https://go.dev/play/p/_HCyxyO2O3l)

```go
func calle(ctx context.Context, wg *sync.WaitGroup) {
	done := make(chan bool)
	defer wg.Done()

	go func() {
		// simulate long running task
		time.Sleep(4 * time.Second)
		done <- true
	}()

	for {
		select {
		case <-ctx.Done():
			if ctx.Err() == context.Canceled {
				fmt.Println("context cancelled, abandoning work!")
			}
			// Clean or graceful shutdown can be done 
			// here before returning on context cancellation
			return
		case <-done:
			fmt.Println("work done!")
			return

		}
	}
}

func main() {
	// main caller
	ctx, cancel := context.WithCancel(context.Background())
	var wg sync.WaitGroup

	wg.Add(1)
	go calle(ctx, &wg)
	// If the server takes more than 3secs to respond, cancel the context
	time.Sleep(3 * time.Second) 
	cancel()
	wg.Wait()
}
```

Typically for building web APIs, `WithTimeout` or `WithDeadline` are used while initializing the context.

```go title="client.go" /defer cancel()/
clientDeadline := time.Now().Add(time.Duration(*deadlineMs) * time.Millisecond)
ctx, cancel := context.WithDeadline(ctx, clientDeadline)
// Resources associated with the context are no longer needed
// In most of the cases this is added for safety to prevent resource leaks in case the 
// caller receives the resp in time and returns.
defer cancel() 
```

```go title="server_handler.go"
if ctx.Err() == context.Canceled {
	return status.New(codes.Canceled, "Client cancelled, abandoning.")
}
```

* Appendix:
	* [More](https://stackoverflow.com/a/52799874) on context cancellations.
	* Context handling in case of [db operations](https://go.dev/doc/database/cancel-operations)
	* 