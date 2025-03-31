---
tags:
  - pg
  - db
publish: true
date: 2025-03-31
description: idempotency support at db protocol level.
---

Typically idempotency is implemented at the application level wherein the client passes a header 
`X-Idempotency-Key` in the request and the server maintains a request state against this key to 
allow safe retries. For example, as [documented here in Stripe docs.](https://docs.stripe.com/api/idempotent_requests)

But what if idempotency was supported at the database layer itself so we don't need the extra bookeeping?

Turns out postgres provides a way to check the status of a previous transaction in the form of 
`pg_xact_status` function. 

[Taken from the docs :](https://www.postgresql.org/docs/current/functions-info.html#FUNCTIONS-PG-SNAPSHOT) 
```
Reports the commit status of a recent transaction. The result is one of in progress, committed, 
or aborted, provided that the transaction is recent enough that the system retains
the commit status of that transaction. 

If it is old enough that no references to the transaction survive in the system and the
commit status information has been discarded, the result is NULL. 

Applications might use this function, for example, to determine whether their transaction 
committed or aborted after the application and database server become disconnected 
while a COMMIT is in progress. 

Note that prepared transactions are reported as in progress; applications must 
check pg_prepared_xacts if they need to determine whether a transaction ID 
belongs to a prepared transaction.
```

This isn't idempotency in the traditional but good enough to determine the submitted tx status on retries. 

Also, adding idempotency support for txs in Valkey(redis alternative) is in talks. It would be something like this : 

```
MULTI KEY <random-id> TTL 30
LPUSH mylist 1 2 3
EXEC

```
[Refer this Valkey issue for more.](https://github.com/valkey-io/valkey/issues/1087)


Ref : 
* [Lobster's post](https://lobste.rs/s/au3938/database_protocols_are_underwhelming)

