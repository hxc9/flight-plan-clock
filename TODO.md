* EET and window for closing once departed

## Frontend
### 1. Error handling for backend calls

There is currently no error handling for the fetch calls 
from the frontend to the backend.

### 2. Implement an "in-flight mode"

Once the status of a flight plan moves to "departed",
information about the EOBT and CTOT isn't as relevant.

One could instead display the estimated arrival time.

## Backend

### 1. Clean and refactor on top of Express

The backend app doesn't need a GUI anymore, this can be fully
removed (`/app`, `/components`), so only the API 
routes (`/pages/api`) are kept. This should also be refactored 
on top of ExpressJS (NextJS doesn't make sense for a pure backend 
app, and it will be easier to implement authorization with Express).

### 2. Support user separation

The backend should ensure that only information about a user's
own flight plans is delivered.

## Mock

### 1. Split the code

Split the mock code into:
* an app implementing *only* the AutoRouter API (i.e. the 
API routes defined in `/pages/api` except the `mock` routes).
This can be implemented with ExpressJS (NextJS makes little sense
for a pure backend solution).
* a "Mock admin" app implementing the current mock GUI and the backend code it needs.
Here we can re-use the existing `autorouter-mock` app, just trimming out
the Autorouter API implementation
* a library packaging the common code between both new apps.

### 2. Implement simple authentication for the admin GUI

For the Mock Admin GUI app, implement a simple authentication
(username/password is fine with just an "admin" user and 
the password in the .env file is enough) to limit access.

### 2. Implement user separation

Currently, the mock doesn't implement any concept of user, so
when querying using `/api/flightPlan/file`, all flight plans
stored are returned.

The actual API only shows to a user his own flight plans, this
should be implemented as such.

(implementing the un-documented `GET https://www.autorouter.aero/api/user/0`
endpoint may be necessary to obtain the logged-in user uid)

## Common

### 1. Implement OAuth 2.0 authentication

Implement OAuth 2.0 authentication through all 3 apps using
the "authorization code" method described in 
[https://www.autorouter.aero/wiki/api/authentication/]()

This would allow the backend to obtain an access token that is
then used in the header of every request to the Autorouter API
(or the mock).

## Other

* iOS/Android app frontend (with notifications)