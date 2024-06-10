# sample-oauth4webapi

## aliases

### install

```
docker compose up -d
```

### uninstall

```
docker compose down
```

## coredns

### install

```
docker network create frontend --subnet=172.19.0.0/16
docker compose up -d
```

### uninstall

```
docker compose down
docker network rm frontend
```
