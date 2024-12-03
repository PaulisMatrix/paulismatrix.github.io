---
tags:
  - db
publish: true
date: 2024-10-19
description: virtual wal interface in libSQL
---

we don't have a blog post on it unfortunately. Personally I believe its one of the most impactful contributions by libsql in SQLite eco system because it opens up so many possibilities

but I can tell you my learning path: 

docs: https://github.com/tursodatabase/libsql/blob/main/libsql-sqlite3/doc/libsql_extensions.md#virtual-wal

its an interface, so same methods would be already implemented in sqlite, you could read those implementation

here is the PR which added it and offers more details: https://github.com/tursodatabase/libsql/pull/53

you can check bottomless code which implements WAL interface to have streaming replication to S3, like litestream - https://github.com/tursodatabase/libsql/blob/e1583dd/bottomless/src/bottomless_wal.rs#L35

