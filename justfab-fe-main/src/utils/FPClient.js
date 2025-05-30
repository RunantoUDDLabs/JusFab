// authClient.ts

const FPLoginUrl = import.meta.env.VITE_FP_IDENTITY_PROVIDER_URL + '/auth';
const FPClientId = import.meta.env.VITE_FP_CLIENT_ID;
const FPToken = import.meta.env.VITE_FP_CLIENT_ACCESS_TOKEN;
const FBCodeChallenge = import.meta.env.VITE_FP_CODE_CHALLENGE;
const FBRedirectURL = import.meta.env.VITE_FP_REDIRECT_URL;
export const getLoginURL = async () => {

  const PKCE = await generatePKCE();

  const params = {
    response_type: 'code',
    client_id: FPClientId,
    redirect_uri: FBRedirectURL,
    scope: 'openid profile email',
    code_challenge: PKCE.codeChallenge,
    code_challenge_method: 'S256',
    hint: '',
    state: (new Date()),
    nonce: (new Date()),
  }

  const queryString = new URLSearchParams(params).toString()
  const url = `${FPLoginUrl}?${queryString}`;
  return url;
}

export const generateCodeVerifier = () => {
  const array = new Uint8Array(48); // 32 bytes = 256 bits
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const generateCodeChallenge = async (codeVerifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64String = btoa(String.fromCharCode(...hashArray));
  return base64String
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const generatePKCE = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  localStorage.setItem('fp_code_verifier', codeVerifier);

  return { codeVerifier, codeChallenge };
}