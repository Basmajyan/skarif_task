# Project setup

## Building docker container

to build the docker container, run the command:

```
   docker compose up -d
```

## DB migrations

run command `docker exec -it annotation_app bash` after starting containers for enter to app container and run command:

```
alembic revision --autogenerate -m "migrations"
alembic upgrade head
```

## Starting the frontend

to start the frontendrun commands:

```
   cd front
   npm install
   npm start
```

## Testing
to start testing run command `docker exec -it annotation_app bash` for enter to app container, after, run command `pytest app/main_test.py`