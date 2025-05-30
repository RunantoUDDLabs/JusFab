import axios from "axios";
import { refreshToken } from "@api/auth";
import { store } from "@store";
import { router } from "@plugins/1.router";
import { cookies } from "@/plugins/useCookies";

const authStore = useAuthStore(store);

const $apiAuth = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_URL,
  headers: {
    "ngrok-skip-browser-warning": import.meta.env.VITE_NGROK_SKIP_BROWSER,
  },
});

const $apiGame = axios.create({
  baseURL: import.meta.env.VITE_API_GAME_URL,
  headers: {
    "ngrok-skip-browser-warning": import.meta.env.VITE_NGROK_SKIP_BROWSER,
  },
});

// ℹ️ Add request interceptor to send the authorization header on each subsequent request after login
const requestInterceptor = async function (config) {
  if (config.useAuthToken === false) {
    delete config.headers.Authorization;
  } else {
    const timeLeft = authStore.jwtExpiration
      ? authStore.jwtExpiration - Date.now()
      : null;

    // if (authStore.token && timeLeft > 0) {
    config.headers["Authorization"] = "Bearer " + authStore.token;
    // }

    // if (timeLeft !== null && timeLeft < 5 * 60 * 1000) {
    //   await refreshToken();
    //   config.headers["Authorization"] = "Bearer " + authStore.token;
    // }
  }

  delete config.useAuthToken;
  return config;
};

const requestInterceptorError = function (error) {
  return Promise.reject(error);
};

$apiAuth.interceptors.request.use(requestInterceptor, requestInterceptorError);
$apiGame.interceptors.request.use(requestInterceptor, requestInterceptorError);

// ℹ️ Add response interceptor to handle 401 response
let refreshingToken = false;
let requestsQueue = [];

const responseInterceptor = async function (response) {
  refreshingToken = false;
  return response;
};

const responseInterceptorError = async function (error) {
  const originalRequest = error.config;

  if (error.response.status === 401) {
    if (refreshingToken && originalRequest.url === "/user/refreshToken") {
      console.error("🚨 Refresh token failed, logging out...");
      refreshingToken = false;
      authStore.setToken(null);
      cookies.remove("role");
      await router.push("/");
      return Promise.reject(error);
    }

    if (!refreshingToken) {
      refreshingToken = true;
      try {
        await refreshToken();
        const updatedTokenData = authStore.token;
        if (!updatedTokenData) {
          throw new Error("Token refresh failed");
        }

        originalRequest.headers["Authorization"] = "Bearer " + updatedTokenData;

        // Retry the original request
        const response = await this.request(originalRequest);

        // Process the queued requests
        requestsQueue.forEach((callback) => callback());
        requestsQueue = [];

        return response;
      } catch (refreshError) {
        refreshingToken = false;
        // Handle refresh token failure here (e.g., redirect to login)
        // cookies.remove("token");
        authStore.setToken(null);
        cookies.remove("role");

        // Redirect to login page
        await router.push("/");
        return Promise.reject(refreshError);
      }
    }

    // Queue the request
    return new Promise((resolve, reject) => {
      requestsQueue.push(() => {
        originalRequest.headers["Authorization"] = "Bearer " + authStore.token;
        this.request(originalRequest).then(resolve).catch(reject);
      });
    });
  }

  return Promise.reject(error);
};

$apiAuth.interceptors.response.use(
  responseInterceptor,
  responseInterceptorError
);
$apiGame.interceptors.response.use(
  responseInterceptor,
  responseInterceptorError
);

const FPapi = axios.create({
  baseURL: import.meta.env.VITE_FP_IDENTITY_PROVIDER_URL,
  headers: {
    "content-type": "application/x-www-form-urlencoded",
  },
});

FPapi.interceptors.request.use(
  function (config) {
    if (config.useAuthToken === false) {
      delete config.headers.Authorization;
    } else {
      if (authStore.token) {
        config.headers["Authorization"] = "Bearer " + authStore.token;
      }
    }

    delete config.useAuthToken;

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export { $apiAuth, $apiGame, FPapi };
