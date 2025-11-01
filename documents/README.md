# 錢包後台

## Tutorial

```commandline
  $ git clone ${repo}
  $ cd ${repo}
  $ git clone ${database repo} database
  $ echo 'SOCKETCLUSTER_PORT=8888\nAUTH_SECRET=test123\nSALT_SECRET=test456' > .env
```

### ENV Settings

```
SOCKETCLUSTER_PORT=8888
AUTH_SECRET=456
SALT_SECRET=123
DB_USERNAME=postgres
DB_DATABASE=demo
DB_PASSWORD=
DB_PORT=
DB_HOST=127.0.0.1
DB_DIALECT=postgres
```

## 使用

```commandline
  $ yarn install
  $ yarn start:watch
```

[demo](http://localhost:8888/api-docs/)

# 參考資訊

[Mac Postgres app](https://postgresapp.com/)

[docker postgres image](https://github.com/sameersbn/docker-postgresql#quickstart)

[sequelize](https://sequelize.org/docs/v6/getting-started/)
