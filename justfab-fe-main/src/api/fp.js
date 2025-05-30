import { FPapi } from "@/plugins/axios";

const FPClientId = import.meta.env.VITE_FP_CLIENT_ID;
const FBRedirectURL = import.meta.env.VITE_FP_REDIRECT_URL;

export const fetchFPToken = async () => {
  try {
    const fpCode = localStorage.getItem('fp_code');
    const fpVerifier = localStorage.getItem('fp_code_verifier')

    const body = {
      grant_type: 'authorization_code',
      code: fpCode,
      redirect_uri: FBRedirectURL,
      client_id: FPClientId,
      code_verifier: fpVerifier,
    }

    const res = await FPapi.post("token", body, {
      useAuthToken: false
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response.data || error;
  }
}

export const refreshFBToken = async () => {
  const refreshToken = localStorage.setItem("fp_refresh_token", data.refresh_token);
  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: FFPClientId,
      refresh_token: refreshToken,
    })

    const res = await FPapi.post('token', body, {
      useAuthToken: false
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(
        errorData.error_description ||
        errorData.error ||
        'Failed to refresh tokens',
      )
    }

    const tokens = await res.json()
    return tokens
  } catch (error) {

  }
}