# API Documentation

The base path for the api is `/api/v{VERSION}`. Currently there is only `v1`, which would be at the path `/api/v1`.

## Structures

### User

|Field name|Type|Description|
|---|---|---|
|uid|`uint`|The integer unique id of the user.|
|email|`string`|The email of the user.|
|password?|`string`|The password of the user used for authentication.|
|uty|[`UserType`](#usertype)*|The type of the user.|

> \* This field is specified as an integer
> ? Optional fields only sent from the client to the user to authenticate. Any other times they are not present

**Example:**

Response from [`/user/login`](#post-userlogin):
```json
{
    "uid": 53,
    "email": "test@example.com",
    "uty": 0
}
```

### UserType
This is an enum, not a structure

|Variant Name|Value|Description|
|---|---|---|
|Customer|`0`|This account belongs to a normal, customer account.|
|Vendor|`1`|This accounts belongs to a vendor user account.|

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