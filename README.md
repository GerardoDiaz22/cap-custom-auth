## Requirements

- Postgres 14
- CDS
- Node 18

## Commands

- `npm install`
- `npm run deploy:pg:clean`
- `cds serve`

## Setup

- Create a default-env.json file in the root of the project and insert the following content:

```
{
  "VCAP_SERVICES": {
    "postgres": [
      {
        "name": "postgres",
        "label": "postgres",
        "tags": ["postgres", "database", "plain"],
        "credentials": {
          "host": "localhost",
          "port": 5432,
          "database": "cds_db",
          "user": "postgres",
          "password": "{your_password}"
        }
      }
    ]
  }
}
```

- Create a .env file in the root of the project and insert the following content:

```
ACCESS_TOKEN_SECRET=f69fb335ae6244c39b870620765875722ec0574310e5f1757392e03795d164de
REFRESH_TOKEN_SECRET=abdf84a039985de07c5d45030fed97493e18b7721764b590b8eb514aa2ba27fb
ACCESS_TOKEN_EXPIRATION=1h
REFRESH_TOKEN_EXPIRATION=30d
PORT=4004
SAP_URL=http://192.168.110.142:8000/sap/opu/odata/sap/
```
