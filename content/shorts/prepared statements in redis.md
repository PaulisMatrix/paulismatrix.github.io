---
tags:
  - db
  - redis
publish: true
date: 2025-03-31
description: prepared statements in redis.
---

If needed, a [refresher](./prepared%20statements.md) on prepared statements.

But yeah, what!? Prepared statements in redis!? Its not exactly but redis does have something 
similar in the form of LUA script and `EVALHASH`


Like prepared statements, the lua scripts are cached on redis server and evaluated on execution. 
i.e they are parsed, compiled and stored only once. (JIT vibes!)

Redis returns a SHA1 digest which refers to the LUA scrpit. 

Load during init : 
```
> SCRIPT LOAD "return ARGV[1] .. ARGV[2]"
"702b19e4aa19aaa9858b9343630276d13af5822e"
```

Then you can execute the script as many times just by referring this digest. The redis-server
automatically loads the corresponding script to run, which is pretty cool if you ask me. 

```
> EVALSHA "702b19e4aa19aaa9858b9343630276d13af5822e" 0 "hello" "world!"
"helloworld!"
```

Also, this script registry is global and not session/conn specific so even if you have 1000s of connections active,
they are gonna use the same script which reduces the memory footprint.


Ref : 
* [Database protocols are underwhelming](https://byroot.github.io/performance/2025/03/21/database-protocols.html)
* [Lua scripting](https://valkey.io/topics/eval-intro/) in Valkey/Redis.
* [Example in Golang](https://redis.uptrace.dev/guide/lua-scripting.html)
* 