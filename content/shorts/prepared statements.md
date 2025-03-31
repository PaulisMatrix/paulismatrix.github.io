---
tags:
  - db
publish: true
date: 2025-01-12
description: database prepared statements.
---

Prepared statements are parsed, compiled and optimized once, when you register at the start. 
Sometimes the db caches the query plan as well. 

This is huge boost in performance if you are executing the same query multiple times with different parameters in the same session as compared to executing ad-hoc queries multiple times.

But in most of the databases, prepared statements are session/connection scoped; which means they are valid as long as the same connection is being used to execute the statements. They are not **globally stored**. 

This doesn't fit well with the traditional server setup wherein you generally maintain a pool of connections so you need to track these statements.

Also each statement allocates some memory on the database server. So make sure to explicitly call `DEALLOCATE` or `CLOSE` at the end to cleanup.

Here's how prepared statements are executed (PG protocol but most dbs follow the same steps):

```
Parse (statement_name="my_statement", query="SELECT * FROM users WHERE id = $1", param_types=[int])

Bind (portal="", statement_name="my_statement", parameters=[1])

Execute (portal="", max_rows=0)

[Optional] `Close (statement_name="my_statement")

```
In psql : 

```sql
PREPARE my_statement (int) AS SELECT * FROM users WHERE id = $1;

EXECUTE my_statement (1);

DEALLOCATE my_statement;
```
