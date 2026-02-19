let currentToken: string | null = null;

export function getToken(): string | null {
  return currentToken;
}

export function setToken(t: string | null) {
  currentToken = t;
}

export function clearToken() {
  currentToken = null;
}

export default { getToken, setToken, clearToken };
