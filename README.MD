# Flight Plan Clock

This project is made of several JS applications working together,
 which can be found in the `/apps` folder.

This is a work-in-progress and not officially supported in any form by AutoRouter AG.

## Quick start

This project is built using `pnpm` which needs to be installed first.

The application requires a Redis Stack DB instance to run (Redis Stack is required by the Autorouter mock since it uses
the Redis JSON module - the backend can run with vanilla Redis).

Environment details are provided using `.env`: when developing locally, you can provide the required parameters
in `.env.local` (see the `.env.local.example` files in each application folder).

To run everything at once for development, you can run `pnpm run devAll` from the top-level folder.

By default:
- the GUI for the AutoRouter mock API runs on port 3001, and lets us change the data served by the API (by 
adding/editing flightplans)
- the frontend runs on port 3002 and displays data served by the mock (via the backend on port 3002)

## Purpose

The Flight Plan Clock is designed for pilots who use the 
Autorouter application to prepare and file their flight plans.

The purpose of the application is to provide a way for such a 
pilot to see what flight plans he has filed and quickly review:
- their status
- the departure times
  - either the *EOBT*, which is the time
at which he should leave the parking position with the plane
  - either the *CTOT*, which is the time at which he should 
take off (only provided in some cases)

## Example

Here is an example of the frontend app's flight plan detail page.

<img src="screenshot.png" width="300" alt="Frontend screenshot"/>

1. Call sign of the flight
2. Airport of departure and destination 
(using each airport's ICAO code)
3. Date and time of departure in UTC (same as the EOBT below)
4. Flight plan status
5. Planned route as submitted in the flight plan
6. EOBT: "estimated off-block time", the time of departure from
the parking position submitted in the flight plan
7. The EOBT in UTC (the 'Z' in the 88:88Z format implies it's UTC)
8. The allowed tolerance, i.e. how early or late can the pilot
actually go
9. Time to the EOBT
10. CTOT: "calculated take-off time", the time at which air traffic
control wants the flight to take-off. Usually this is empty,
a CTOT is sent only when air traffic control is delaying the
flight
11. The current time in UTC format