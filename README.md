# CRUD-API

Simple Node.js CRUD API using in-memory database underneath
[Task description](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md)

## How to install

To run this application you have to do the following steps:

1.  Clone this repository

```bash
 git clone https://github.com/elian-cheng/CRUD-API.git
```

2.  Move to the cloned repo

```bash
 cd CRUD-API
```

3.  Switch the branch to `develop`

```bash
git checkout develop
```

4.  Install dependencies

```bash
npm install
```

## Commands

To start the application in the development mode

```bash
npm run start:dev
```

To start the application in the production mode

```bash
npm run start:prod
```

To start the application with load balancer and shared in-memory database

```bash
npm run start:multi
```

To run tests

```bash
npm run test
```

### Request methods

- **GET** `/api/users`:

  - **200** - object of users

- **GET** `/api/users/:id`:

  - **200** - user with specified id

  - **400** - id is not valid uuid

  - **404** - user is not found

- **POST** `/api/users`:

  - **201** - created a new user

  - **400** - body request is not valid

Structure of the object to create a new user:

```JSON
  {
    "username": "John",
    "age": 30,
    "hobbies": ["reading", "cooking"]
  }
```

- **PUT** `/api/users/:id`:

  - **200** - updated user object

  - **400** - id is not valid or request body

  - **404** - user is not found

- **DELETE** `/api/users/:id`:

  - **204** - user deleted successfully

  - **400** - id is not valid or request body

  - **404** - user is not found
