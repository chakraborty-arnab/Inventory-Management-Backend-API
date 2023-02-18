# :spider_web: Restful API for Managing Inventory

Reference: [Swaggerhub](https://app.swaggerhub.com/apis-docs/csye6225-webapp/cloud-native-webapp/spring2023-a2)

## :package: Prerequisites

To run the app locally, install:

- `git` (configured with ssh) [[link](https://git-scm.com/downloads)]
- `node` [[link](https://nodejs.org/en/download/)]
- `PostgreSQL` [[link](https://www.postgresql.org/)]
- `Postman` to demo hit the APIs [[link](https://www.postman.com/downloads/)]

## :arrow_heading_down: Installation

> *Prerequisite:* ssh configured on your local system to clone this project using ssh.

Clone the server side API service using the following command:

```shell
git@github.com:arnab-org/webapp.git
```

> To clone the forked repository, use the following command:

```shell
git clone git@github.com:chakraborty-arnab-neu/webapp.git
```

> Install the dependencies:

```shell
  #for npm users
  npm i
```

## :hammer_and_wrench: Development

> Please configure .env file

To run the server in `dev` mode, run the following command:

```shell
  #for npm users
  npm run start:dev
```


## :test_tube: Testing

> To run the test suite, use the following commands:

```shell
  #for npm users
  npm run test
```
> To run interactive tests:

```shell
  #for npm users
  npm run test:dev
```

# :rocket: Production

> To run the app in production mode, use the following command:

```shell
  #for npm users
  npm run start
```

## :arrows_clockwise: CI/CD pipelines

### Unit tests

The tests must run before changes are merged via a PR to the upstream master branch.

## :ninja: Author

[Arnab Chakraborty](mailto:chakraborty.arn@northeastern.edu)

## :scroll: License

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
