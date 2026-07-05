/** Default axios timeout for JSON CRUD (ms). */
export const API_TIMEOUT_MS = 30_000;

/** Uploads / large exports need longer (ms). */
export const UPLOAD_TIMEOUT_MS = 120_000;

export const uploadRequestConfig = {
  timeout: UPLOAD_TIMEOUT_MS,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
};
