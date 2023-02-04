This backend loads and process data from the Autorouter API
([https://www.autorouter.aero/wiki/api/](https://www.autorouter.aero/wiki/api/)).

The backend stores data in a Redis instance.

## Getting Started

First, start your Redis Stack instance, either local, remote or Dockerized (Redis Stack is required instead of
standard Redis as we use the Redis JSON module which is included in Redis Stack).

Provide the address to the Redis instance as the REDIS_URL variable in `.env.local`
(leave empty for the default URL - localhost and port 6379).

Then, run the development server:

```bash
pnpm run dev
```
