---
tags:
  - db
publish: true
date: 2024-10-19
description: virtual wal interface in libSQL
---

[Recommended learning path from a turso engg] 

We don't have a blog post on it unfortunately. Personally I believe its one of the most impactful contributions by libsql in SQLite eco system because it opens up so many possibilities

But I can tell you my learning path: 

[Documentation](https://github.com/tursodatabase/libsql/blob/main/libsql-sqlite3/doc/libsql_extensions.md#virtual-wal)

Its an interface, so same methods would be already implemented in sqlite, you could read those implementation

Here is the [PR](https://github.com/tursodatabase/libsql/pull/53) which added it and offers more details.

You can check [bottomless code](https://github.com/tursodatabase/libsql/blob/e1583dd/bottomless/src/bottomless_wal.rs#L35) which implements WAL interface to have streaming replication to S3, like litestream.

