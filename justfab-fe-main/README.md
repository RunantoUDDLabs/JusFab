# Slot Machine Kapybara Frontend

A modern slot machine game frontend built with **Vue 3** and **Vite**.

## Tech Stack

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Vuetify](https://vuetifyjs.com/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) **v22.12.0**
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

Install dependencies:

```bash
# Choose one:
npm install
# or
yarn install
```

## 📜 Available Scripts

- `dev`: Start the development server with hot reload
- `build:staging`: Build the app using staging config
- `preview:staging`: Preview the staging build
- `build`: Build the app for production
- `preview`: Preview the production build
- `build:icons`: Generate icon assets using Iconify

## 📂 Project Structure

```
├── public/               # Static assets
├── src/
│   ├── api/              # API request functions
│   ├── assets/           # Static/media assets
│   ├── components/       # Reusable Vue components
│   ├── layouts/          # Layout components
│   ├── navigations/      # Navigation definitions
│   ├── pages/            # Route-specific page components
│   ├── plugins/          # Vue plugins setup
│   ├── utilities/        # Business logic utilities
│   ├── utils/            # General helper functions
│   └── views/            # Route views
├── .env.*                # Environment configuration files
├── App.vue               # Root Vue component
├── main.js               # App entry point
├── style.css             # Global styles
├── index.html            # App HTML shell
└── vite.config.js        # Vite configuration
```

## 🔧 Vite Configuration

The `vite.config.js` file configures the development and build behavior of the project. Key settings include:

- Custom `base` path for deploying under a subdirectory (if applicable)
- Aliases defined using `@` for cleaner imports
- Integration with Vuetify plugin and automatic components resolution
- Environment variables are loaded from `.env.*` files based on the mode

Adjust these settings as needed when deploying to different environments or customizing the build.

## ⚠️ Notes

- Run `npm run build:icons` before building if custom icons are missing.
- If Vuetify styles do not load properly, ensure the Vuetify plugin is correctly configured in `vite.config.js`.
- When deploying under a subdirectory, update the `base` option in `vite.config.js` accordingly.
