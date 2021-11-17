import { BehaviorSubject } from 'rxjs';

// I hate almost everything about this class.  Probably should expose user info, etc.

const userSubject = new BehaviorSubject();

export const authenticationService = {
    logout,
    user: userSubject.asObservable(),
    httpGet,
    httpPost,
    updateToken,
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

function httpPost(sUrl, payload) {
  let postOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      headers: { Authorization: `Bearer ${__token}` }
    },
    body: JSON.stringify(payload)
  };
  return fetch(sUrl, postOptions);
}
