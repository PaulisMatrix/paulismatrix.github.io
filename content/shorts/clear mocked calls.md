---
tags:
  - go
publish: true
date: 2025-07-20
description: clear previous mocked calls in golang in test methods.
---

The testify mock library provides a way to clear or unset the previously mocked calls in case you want to 
make sure the mocked function is called everytime for a new test case and to avoid any uintended effects
for edge cases.

Especially useful wherein the many tests share identical mocked functions and the assertions 
are met as expected. 

There are two ways to enforce this : 

Suppose you have a mock implemention of kafka : 

```go
mockKafkaProducer := kafka.NewMockProducer(t)
```

1. You can set expected calls to nil before calling the method.
```go
mockKafkaProducer.ExpectedCalls = nil
mockKafkaProducer.Calls = nil
mockKafkaProducer.On("ProduceMessage", mock.Anything, mock.Anything, mock.Anything).Times(1).Once()
```

2. Use the unset method which basically removes the calls from the call chain and you can register a 
new mock.
```go
mockKafkaProducer.On("ProduceMessage", mock.Anything, mock.Anything, mock.Anything).Unset()
mockKafkaProducer.On("ProduceMessage", mock.Anything, mock.Anything, mock.Anything).Times(1).Once()
```

[Reference issue](https://github.com/stretchr/testify/issues/558) to find out more!