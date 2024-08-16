---
tags:
  - go
publish: true
date: 2024-08-16
description: How to fix gopls when using build tags in go files. 
---

So first of all, what are build tags? 

Build tags are basically conditional compilation mechanism provided by Go in which you can choose which files to include in the binary depending on tags specified in that file. 

For example : 
```go title="main.go"
//go:build foo
// +build foo

func main(){
    fmt.Println("hello world")
}
```
The directive `//go:build foo` is automatically added by go and you can build a binary of only this file by : 
`go build -tags foo -o main`

These tags can be quite handy. [More here](https://www.digitalocean.com/community/tutorials/customizing-go-binaries-with-build-tags)

Example from the go source :

[netgo_netcgo.go](https://go.dev/src/net/netgo_netcgo.go)

[src/net/conf.go](https://go.dev/src/net/conf.go)

```
// The net package's name resolution is rather complicated.
// There are two main approaches, go and cgo.
// The cgo resolver uses C functions like getaddrinfo.
// The go resolver reads system files directly and
// sends DNS packets directly to servers.
//
// The netgo build tag prefers the go resolver.
// The netcgo build tag prefers the cgo resolver.
```

One use case is for integration testing. Suppose you have multiple packages in your go project housing its own unit tests and you are prolly running them through `go test ./...`

Now suppose you want to add integration tests in a separate package at root level but want to differentiate it from the unit tests. 
In that cause you can add a `integration` tag to each of your file under this directory.

For example: 
```go title="init_test.go"
//go:build integration
// +build integration

package integration

import (
	"testing"
)

func TestSomething(t *testing.T) {
	// test something here
}
```

And in your makefile you can run the integration tests separately by using this tag in your `go test` command. 

```makefile
test.integration:
    go test -tags=integration ./integration/
```

Okay back to the main issue. As I was adding this, I lost the intellisense of my `init_test.go` file. 
Turns out gopls(golang's language server) stops working if build tags are mentioned in .go files. 

Apparently, its a known issue. [Follow this](https://github.com/golang/go/issues/29202)

I tried installing latest gopls and related tooling versions but that didn't help.
As mentioned in the above thread, a quick workaround is to edit your editor's settings file to explicitly add 
tags to gopls env flags. 

For example(in case of vscode):
```json title="settings.json"
"go.toolsEnvVars": {
        "GOFLAGS": "-tags=integration"
}
```

Should work for other code editors too. And you can mention multiple tags by separating them by a comma.

Fin.