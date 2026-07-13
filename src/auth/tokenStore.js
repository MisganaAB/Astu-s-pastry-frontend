// Pure in-memory token holder. Nothing here ever touches localStorage,
// sessionStorage, or cookies — it's just a JS variable that lives as long
// as the tab does. A page refresh clears it, which is intentional.
let currentToken = null;

export function setToken(token) {
  currentToken = token || null;
}

export function getToken() {
  return currentToken;
}

export function clearToken() {
  currentToken = null;
}