---
tags:
  - go
publish: true
date: 2025-03-20
description: Custom Converter for unsupported types in std sql pkg.
---

If you have been using [sqlmock](https://github.com/DATA-DOG/go-sqlmock) to mock database queries then, you might have or will encounter errors such as `sql error unsupported []string, a slice of string` if one of the args in the query is a byte slice. 

This is cause the go std/sql driver doesn't understand or support types other than the std ones.
Below are the types supported by the `driver.Value` interface.
```
// Value is a value that drivers must be able to handle.
// It is either nil, a type handled by a database driver's [NamedValueChecker]
// interface, or an instance of one of these types:

int64
float64
bool
[]byte
string
time.Time
```

So for user or driver defined types such as `sql.NullString`, `pq.StringArray`, we need to implement the `ValueConverter` interface. [Source here.](https://cs.opensource.google/go/go/+/refs/tags/go1.24.1:src/database/sql/driver/types.go;l=30)

The workaround for the above issue is to pass our own Custom Converter to the sqlmock which handles all the data types.

```go title="converter.go"
type CustomConverter struct{}

func (s CustomConverter) ConvertValue(v interface{}) (driver.Value, error) {
	switch v.(type) {
	case string:
		return v.(string), nil
	case []string:
		return v.([]string), nil
	case int:
		return v.(int), nil
	case bool:
		return v.(bool), nil
	case uint64:
		return v.(uint64), nil
	case pq.StringArray:
		var result []string
		for _, val := range v.(pq.StringArray) {
			result = append(result, val)
		}
		return result, nil
	case MessageAuthor:
		return string(v.(MessageAuthor)), nil
	case sql.NullString:
		if v.(sql.NullString).Valid {
			return v.(sql.NullString).String, nil
		}
		return nil, nil
	case MessageStatus:
		return string(v.(MessageStatus)), nil
	default:
		return nil, fmt.Errorf("cannot convert %T with value %v", v, v)
	}
}

// init
func GetMockDB() (*sql.DB, sqlmock.Sqlmock, error) {
	return sqlmock.New(sqlmock.ValueConverterOption(CustomConverter{}))
}

```

This will hopefully pass all your test cases and you can have a sound sleep. 

