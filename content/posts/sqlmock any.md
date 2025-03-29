---
tags:
  - go
publish: true
date: 2025-02-08
description: Any type in sqlmock.
---

[sqlmock](https://github.com/DATA-DOG/go-sqlmock) is a handy library for mocking database queries without needing to use spin up an actual database. 

init : 

```go
mockDB, mock, err := sqlmock.New()
defer mockDB.Close()
sqlxDB = sqlx.NewDb(mockDB,"sqlmock")
```

mock insert query : 
```go
mock.ExpectExec("INSERT INTO baskets").WillReturnResult(sqlmock.NewResult(newID, 1))

// for sqlx query
sqlxDB.Exec("INSERT INTO baskets (user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?)", basket.UserID, basket.Name, timeNow, timeNow)
```

mock select query : 
```go
rows := sqlmock.NewRows([]string{"id", "user_id", "name", "created_at", "updated_at"}).
        AddRow(1, userID, name, timeNow, timeNow)
mock.ExpectPrepare("^SELECT (.+) FROM baskets WHERE").ExpectQuery().WithArgs(userID).WillReturnRows(rows)
```

But sometimes if we are using non-deterministic fields as part of the insert query in the method being called, such as UUID or timestamp then it becomes difficult to mock the query since the UUID being passed as an arg to the mocked query will be different than the one which is actually getting inserted.w

Or we don't know which fields to pass to the mock query.

In such cases, we can define `Any` (not an interface) to match any value being passed as an arg.
This is similar to mockery/gomock's `mock.Anything` constant.

```go
// Define a custom type to match any value to pass as args in Mock methods
type Any struct{}

func (a Any) Match(v driver.Value) bool {
	return true
}
```

Which can be used like this : 
```go
mockDb.ExpectExec("^INSERT INTO sessions").WithArgs(Any{}, title, userId).WillReturnResult(sqlmock.NewResult(1, 1))
```

More [here](https://github.com/DATA-DOG/go-sqlmock/issues/29#issuecomment-180236351)

Pretty handy if you want to pass all your tests, iykyk!