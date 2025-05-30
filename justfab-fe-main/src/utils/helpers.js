// 👉 IsEmpty
export const isEmpty = (value) => {
  if (value === null || value === undefined || value === "") return true;

  return Array.isArray(value) && value.length === 0;
};

// 👉 IsNullOrUndefined
export const isNullOrUndefined = (value) => {
  return value === null || value === undefined;
};

// 👉 IsEmptyArray
export const isEmptyArray = (arr) => {
  return Array.isArray(arr) && arr.length === 0;
};

// 👉 IsObject
export const isObject = (obj) => {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj);
};

// 👉 IsToday
export const isToday = (date) => {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// 👉 IsHtml
export const isHtml = (str) => {
  if (typeof str !== "string") return false;
  const pattern = /<[^>]+>/;
  return pattern.test(str);
};

/**
 * Generate a random string.
 * @see https://dev.to/roblevintennis/comment/10148
 */
export const randomString = () => {
  return String(Date.now().toString(32) + Math.random().toString(16)).replace(
    /\./g,
    ""
  );
};

export const playSound = (audioUrl) => {
  const audio = new Audio(audioUrl);
  audio.play().catch((error) => {
    console.error("Error playing sound:", error);
  });
};

export const getApiPath = (path, params) => {
  return path.replace(/:([a-zA-Z]+)/g, (_, key) => params[key]);
};

export const truncateString = (str, maxLength = 9, suffix = "...") => {
  if (typeof str !== "string") return "";
  return str.length > maxLength ? `${str.slice(0, maxLength)}${suffix}` : str;
};

export function animateCounter(start, end, duration, callback) {
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(
      start + (end - start) * easeOutCubic(progress)
    );

    callback(currentValue);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
export const base64UrlDecode = (str) => {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = str + padding;
  return atob(base64);
};

export const parseJwt = (token) => {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload) {
    throw new Error("Invalid JWT token");
  }

  const decodedHeader = JSON.parse(base64UrlDecode(header));
  const decodedPayload = JSON.parse(base64UrlDecode(payload));

  return {
    header: decodedHeader,
    payload: decodedPayload,
    signature,
  };
};

export const parseJwtLifetime = (lifetime) => {
  const match = lifetime.match(/^(\d+)([smhd])$/);
  if (!match) return 60 * 1000;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60 * 1000;
  }
};

export const stringToSlug = (str) => {
  return str
    .normalize("NFD") // Normalize to decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase() // Convert to lowercase
    .trim() // Trim whitespace from both sides
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, ""); // Remove all non-word chars
};

export const copyToClipboard = async (value) => {
  if (!navigator.clipboard) {
    console.error("Clipboard API not supported");
    return Promise.reject(new Error("Clipboard API not supported"));
  }

  try {
    await navigator.clipboard.writeText(value);
    return Promise.resolve("Copied successfully");
  } catch (err) {
    console.error("Error in copying text:", err);
    return Promise.reject(err);
  }
};

export const toggleClass = (event, classes, ms = null) => {
  const element = event.currentTarget;
  const classList = classes.split(" ");

  const allClassesExist = classList.every((cls) =>
    element.classList.contains(cls)
  );
  if (allClassesExist) return;

  classList.forEach((cls) => element.classList.toggle(cls));

  if (ms) {
    setTimeout(() => {
      classList.forEach((cls) => element.classList.remove(cls));
    }, ms);
  }
};

export const handleNormalClickAnimation = (event) => {
  toggleClass(event, "heartbeat", 1500);
};

/**
 * Promise based setTimeout
 *
 * @param {*} ms
 * @returns
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 *
 * Select all text in a input
 *
 * @param {*} target
 */
export const selectAllText = (target) => {
  nextTick(() => {
    const textareaElement = target;
    if (textareaElement) {
      textareaElement.focus();
      textareaElement.select();
    }
  });
};

export const srcAsset = (asset) => {
  return asset
    ? import.meta.env.VITE_ASSET_URL + "/" + asset
    : "https://via.placeholder.com/150";
};

export const formatNumber = (n) => {
  n = Number(n);
  n = Math.round(n);
  const abs = Math.abs(n);
  const sign = Math.sign(n);

  if (abs >= 1e12) return `${(sign * abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(sign * abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(sign * abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(sign * abs / 1e3).toFixed(1)}K`;
  return sign * abs;
};
