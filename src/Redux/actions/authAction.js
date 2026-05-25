import {jwtDecode} from "jwt-decode"

export const setAuth = (token) => {
    const decoded = jwtDecode(token);
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const name = 
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        decoded["name"] ||
        decoded["sub"];

    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('UserName' ,name)

    return {
        type: 'SET_AUTH',
        payload: { token, role , name}
    };
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('UserName');
    return { type: 'LOGOUT' };
};