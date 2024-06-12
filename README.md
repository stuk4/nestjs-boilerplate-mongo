<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Running in Development

1. Clone the repository
2. Run

```
pnpm install
```

3. Ensure Nest CLI is installed

```
npm i -g @nestjs/cli
```

4. Start the database

```
docker-compose up -d
```

5. Clone the `.env.template` file and rename the copy to `.env`

6. Fill in the environment variables defined in the `.env`

7. Run the application in dev:

```
pnpm start:dev
```

8. Rebuild the database with the seed

```
http://localhost:3000/api/v2/seed
```

## Stack used

- MongoDB
- Nest
