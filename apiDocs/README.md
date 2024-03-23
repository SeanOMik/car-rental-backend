# API Documentation

The base path for the api is `/api/v{VERSION}`. Currently there is only `v1`, which would be at the path `/api/v1`.

## User paths

### POST `/user/login`

JSON Payload:

```json
{
    "email": "john_doe@example.com",
    "password": "password1234",
}
```

#### Responses

##### 200 OK
A cookie named `connect.sid` will be returned in the `Set-Cookie` header. The value is the session id for the user.

##### 409 CONFLICT
A status code of `404` signifies that the email and/or password is incorrect.

### POST `/user/register`

JSON Payload:

```json
{
    "email": "john_doe@example.com",
    "password": "password1234",
}
```

#### Responses

##### 200 OK
A cookie named `connect.sid` will be returned in the `Set-Cookie` header. The value is the session id for the user.

##### 409 CONFLICT
A status code of `409` signifies that there is already a user with the same email created.