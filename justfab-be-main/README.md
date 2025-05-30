# Slot Machine Kapybara Backend

A Node.js backend for the Slot Machine Kapybara game, providing RESTful APIs for user management, slot machine logic, rewards, inventory, and more. Built with Express and MongoDB.

## Getting Started

### Prerequisites

- Node.js (v22.12.0 recommended)
- npm or yarn
- MongoDB instance (local or remote)

### Installation

1. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

### Configuration

- Copy the example environment file:
  ```sh
  cp .env.example .env
  ```
- Then edit `.env` to fit your local or production environment.
- MongoDB configuration is in `config/mongodb.config.js`.
- Other configs: `config/telegram.config.js`, `config/multer.config.js`.

### Running the Application

- Start the server:
  ```sh
  npm start
  # or
  node index.js
  ```
- For clustered mode:
  ```sh
  node server-cluster.js
  ```

### API Documentation

- Swagger UI available at `/swagger` (see `swagger.js` and `swagger.yml`).

### Deployment

- PM2 config: `ecosystem.config.js`.

## Project Structure

A simplified view of the key folders and files:

```
.
├── config/               # Configuration files (MongoDB, Telegram, etc.)
├── envents/              # Custom event handlers
├── middlewares/          # Express middlewares
├── models/               # Mongoose schemas
├── mongo-init/           # MongoDB initialization scripts
├── routes/               # API route definitions
├── services/             # Business logic layer
├── utils/                # Utility/helper functions
├── index.js              # Application entry point
├── server-cluster.js     # Clustered server entry point
├── swagger.js            # Swagger UI setup
├── swagger.yml           # OpenAPI spec
└── ecosystem.config.js   # PM2 process manager config
```

## Contact

- Repo owner/admin: gm.business@uddlabs.com
- For issues, open a GitHub issue or contact the team.

## Notes

- Ensure MongoDB is running before starting the app.
- Default port is `3000` unless overridden in `.env`.
- Telegram Bot must be authorized with the correct webhook before use.

## Known Issues

---

_UDDLabs maintains this project._
