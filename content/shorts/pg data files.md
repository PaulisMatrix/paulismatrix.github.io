---
tags:
  - pg
publish: true
date: 2024-07-12
description: where does postgres store the data files
---

Postgres stores all the information of a database cluster in a location commonly referred to as `PGDATA`.
Typical location of `PGDATA` is `/var/lib/pgsql/data`.

This location might vary. Check for your system through this command: 

```
rushiyadwade=# show data_directory;
      data_directory          
---------------------------------
 /opt/homebrew/var/postgresql@14
(1 row)
```

Data directory path is also present in the pg.conf file. Locate config file through this command: 

```
rushiyadwade=# show config_file;
        config_file                   
-------------------------------------------------
 /opt/homebrew/var/postgresql@14/postgresql.conf
(1 row)
```

More here: [Postgres storage format](https://www.postgresql.org/docs/8.1/storage.html)