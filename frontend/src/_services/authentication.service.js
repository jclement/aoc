import { BehaviorSubject } from 'rxjs';

// I hate almost everything about this class.  Probably should expose user info, etc.

const userSubject = new BehaviorSubject();

export const authenticationService = {
    logout,
    user: userSubject.asObservable(),
    httpGet,
    httpPost,
    httpPut,
    updateToken,
    refreshUser,
};


var __token = null;
function updateToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
  __token = token;
  if (token) {
    httpGet('/api/me')
        .then(response => response.json())
        .then(data => {
          userSubject.next(data);
        });
  } else {
    userSubject.next(null);
  }
}
updateToken(localStorage.getItem('token'));

function refreshUser() {
  if (__token) {
    httpGet('/api/me')
        .then(response => response.json())
        .then(data => {
          userSubject.next(data);
        });
  }
}


function logout() {
    // remove user from local storage to log user out
    updateToken(null);
}

function httpGet(sUrl) {
  return fetch(
    sUrl,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${__token}` }
    }
  );
}

const httpOpts = (method, payload) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${__token}`,
  },
  body: JSON.stringify(payload)
})

function httpPost(sUrl, payload) {
  return fetch(sUrl, httpOpts('POST', payload));
}

function httpPut(sUrl, payload) {
  return fetch(sUrl, httpOpts('PUT', payload));
}
