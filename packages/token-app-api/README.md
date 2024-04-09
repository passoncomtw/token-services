# 錢包後台

## Tutorial

```
  $ git clone ${repo}
  $ cd ${repo}
  $ git clone ${database repo} database
  $ echo 'SOCKETCLUSTER_PORT=8889\nAUTH_SECRET=test123\nSALT_SECRET=test456' > .env
```

### Database Setting

`database/config/config.js`

預設是 `127.0.0.1`

## 使用

```
  $ yarn install
  # yarn start:watch
```

[demo](http://localhost:8889/api-docs/)
