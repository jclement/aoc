import { BehaviorSubject } from 'rxjs';

// I hate almost everything about this class.  Probably should expose user info, etc.

const tokenSubject = new BehaviorSubject(localStorage.getItem('token'));

export const authenticationService = {
    login,
    logout,
    authHeader,
    token: tokenSubject.asObservable(),
};

function authHeader() {
    // return authorization header with jwt token
    const token = tokenSubject.value;
    if (token) {
        return { Authorization: `Bearer ${token}` };
    } else {
        return {};
    }
}

function login() {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Hardcoded for science.  Not the real login flow anyways.
        body: JSON.stringify({"username": "admin", password:"admin" })
    };

    return fetch('/api/fakelogin', requestOptions)
        .then(response => response.json())
        .then(data => {
            let token = data['access_token'];
            localStorage.setItem('token', token);
            tokenSubject.next(token);
            return token;
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('token');
    tokenSubject.next(null);
}