# Project Aileron - Alpha version

This is the very first version of a family-dedicated social app, project name "aileron".

## Backend

This web server's latest stable version is running on AWS EC2 instances. Contact Dinovico to get the server's address.
Use the following instructions to test locally during development.

### Project setup

```
npm install
pip install -r requirements.txt
```

### Start and auto-reload for development

```
npm run dev
```


### Lint and fix files

```
npm run lint
```

### Generate and execute new database migration from typeorm schema

First generate

```
npm run migration:generate --name=MyMigrationName
```

Then execute

```
npm run migration:run
```
