---
tags:
  - go
publish: true
date: 2024-07-06
description: a short example of context cancellation in golang.
---

Passing context from parent function(caller) to the child function/s(calle) is a pretty common pattern in golang to control the lifetime of the call. 

We can cancel a context through `cancel()` function if we no longer want to wait for the result<br> if the client is taking too much time to respond. Basically to dictate timeouts/deadlines.

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

Below is a simple demonstration of how it works using `WaitGroups`. <br>
Live demo [here](https://go.dev/play/p/sJHOhPuGcSl)

```go
func calle(ctx context.Context, wg *sync.WaitGroup) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			fmt.Printf("Ctx cancelled : %+v\n", ctx.Err())
			wg.Done()
			return
		case <-ticker.C:
			fmt.Printf("not cancelled yet\n")

		}
	}
}

func main() {
	// main caller
	ctx, cancel := context.WithCancel(context.Background())
	var wg sync.WaitGroup

	wg.Add(1)
	go calle(ctx, &wg)
	time.Sleep(3 * time.Second)
	cancel()
	wg.Wait()
}
```