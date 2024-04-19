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

### Location
|Field name|Type|Description|
|---|---|---|
|uid|`uint`|The integer unique id of the location.|
|address|`string`|The address that the renting location is at.|

### Vehicle
|Field name|Type|Description|
|---|---|---|
|uid|`uint`|The integer unique id of the vehicle.|
|make|`string`| |
|model|`string`| |
|year|`int`| |
|axles|`int`|The number of axles the vehicle has.|
|doors|`int`|The number of doors that the vehicle has|
|bodyType|`string`|The type of the vehicle (i.e., sedan, coupe, truck, etc.)|
|rentCostPerDay|`float`| |
|color|`string`| |
|isRented|`boolean`| |

### UserType
This is an enum, not a structure

|Variant Name|Value|Description|
|---|---|---|
|Customer|`0`|This account belongs to a normal, customer account.|
|Vendor|`1`|This accounts belongs to a vendor user account.|

## User paths
The base location path is `/api/v1/user`

### User login
POST `/user/login`\
Request JSON body:

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

### User register
POST `/user/register`\
Request JSON body:

```json
{
    "email": "john_doe@example.com",
    "password": "password1234",
    "type": 0
}
```

#### Responses

##### 200 OK
A cookie named `connect.sid` will be returned in the `Set-Cookie` header. The value is the session id for the user.

##### 409 CONFLICT
A status code of `409` signifies that there is already a user with the same email created.

## Location paths
The base location path is `/api/v1/location`

### Create Location
POST `/location/`\
Request JSON body:

```json
{
    "address": "123 Sesame Street, Orlando, FL 12345"
}
```

#### 403 FORBIDDEN
You must be logged in as a Vendor to perform this action.

#### 409 CONFLICT
Location with the same address already exists.

### Get vehicles at a location
GET `/:locationId/vehicles`\
Response: 200 OK, with `Vehicles[]` JSON body.\
Requires authentication: `True`

Query parameters:
|Name|Type|Description|
|---|---|---|
|`includeRented`?|`boolean`|Set to true to get vehicles that are currently rented, defaults to false|

> ?: optional parameter, defaults to false

#### 404 NOT_FOUND
The location was not found.

#### 401 UNAUTHORIZED
No authentication was received or the session is invalid

### List locations
GET `/`\
Response: 200 OK, with `Location[]` JSON body.\
Requires authentication: `True`

#### 401 UNAUTHORIZED
No authentication was received or the session is invalid

### Get the address of a location
GET `/:locationId`\
Response: 200 OK, with `Location` JSON body (location struct has the address field).\
Requires authentication: `True`

#### 404 NOT_FOUND
The location was not found.

#### 401 UNAUTHORIZED
No authentication was received or the session is invalid

### Add a vehicle to a location
GET `/:locationId/vehicles`\
Response: 200 OK, with `Vechicle` JSON body (can be used to retrieve its unique id).\
Requires authentication: `True`, requires Vendor user account type

#### 404 NOT FOUND
The location was not found.

#### 401 UNAUTHORIZED
No authentication was received, the session is invalid, or they were not logged into a vendor account.

## Vehicle paths
The base location path is `/api/v1/vehicle`

### Get vehicles from id
GET `/:vehicleId`\
Response: 200 OK, with `Vehicle` JSON body.\
Requires authentication: `False`

#### 404 NOT_FOUND
The vehicle was not found.

### Rent a vehicle
POST `/:vehicleId/rent`\
Request JSON body:

```json
{
    // the amount of days the rent will be for
    "lengthInDays": 10,
}
```

If you are logged in as a vendor account, you can also specify another user to rent this vehicle for.
To do so, you specify the other user's email in the body of the request with the field `forUserEmail`.

Response: 200 OK
Requires authentication: `True`

**Possible responses:**
|Status Code Number|Status Code|Description|
|---|---|---|
|404|`NOT_FOUND`|The vehicle was not found.|
|409|`CONFLICT`|The vehicle is already rented.|
|401|`UNAUTHORIZED`|No authentication was received or the session is invalid.|

### Return a vehicle
DELETE `/:vehicleId/rent`\

Response: 200 OK
Requires authentication: `True`

**Possible responses:**
|Status Code Number|Status Code|Description|
|---|---|---|
|404|`NOT_FOUND`|The vehicle was not found.|
|401|`NOT_MODIFIED`|The vehicle is not rented, so nothing changed.|

### Relocate a vehicle
POST `/:vehicleId/relocate`\
Request JSON body:

```json
{
    // id of the new location of the vehicle
    "location": 1,
}
```

Response: 200 OK
Requires authentication: `True`, Vendor account

**Possible responses:**
|Status Code Number|Status Code|Description|
|---|---|---|
|200|`OK`|The vehicle was relocated to the new location.|
|404|`NOT_FOUND`|The vehicle or new location was not found.|
|409|`NOT_MODIFIED`|The vehicle is already at the location.|
|401|`UNAUTHORIZED`|No authentication was received or the session is invalid.|
|401|`FORBIDDEN`|This endpoint requires a vendor account, which the session does not correspond to.|