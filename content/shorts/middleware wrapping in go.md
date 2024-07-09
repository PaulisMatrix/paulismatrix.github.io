---
tags:
  - go
publish: true
date: 2024-07-07
description: middlewares wrapping with the server handler in golang
---

Middlewares are used for tasks which are shared across your app handlers like validating<br>
the incoming request, logging, authentication, rate-limiting, etc.

`Router → Middleware Handler → Application Handler`

In case you have such a list of middlewares, you can wrap/chain them with your server handler.

Below is a small example of middleware wrapping.
Live demo [here](https://go.dev/play/p/iJiSUhy5bBC)

```go title="middleware_wrapping.go"
type MyServer struct {
	config string
}

func firstMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("first middleware!")
		next.ServeHTTP(w, r)
	})
}

func secondMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("second middleware!")
		next.ServeHTTP(w, r)
	})
}

func (s *MyServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, fmt.Sprintf("%s from backend server!", s.config))
}

func main() {

	handler := &MyServer{
		config: "hello",
	}

	go func(s *MyServer) {
		http.Handle("/hello", firstMiddleware(secondMiddleware(s)))
		err := http.ListenAndServe(":8080", nil)
		if err != nil {
			fmt.Printf("Error for lb server on :8080; %s\n", err.Error())
			return
		}
	}(handler)

	serverAddress := "http://localhost:8080/hello"
	req, _ := http.NewRequest("GET", serverAddress, nil)
	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		fmt.Printf("error: %+v in calling lb", err)
		return
	}

	defer resp.Body.Close()
	bytes, _ := io.ReadAll(resp.Body)
	fmt.Printf("server resp : %s", string(bytes))
}

```
The output being : 
```
first middleware!
second middleware!
server resp: hello from backend server!
```

Notice the sequence of execution. The call gets resolved based on the ordering of the<br> 
middlewares (left to right).

* Appendix:
* Package for simplifying [Chaining](https://github.com/justinas/alice) of middlewares.
* [Making and using middlewares](https://www.alexedwards.net/blog/making-and-using-middleware)
* [Exploring middlewares](https://vishnubharathi.codes/blog/exploring-middlewares-in-go/)
