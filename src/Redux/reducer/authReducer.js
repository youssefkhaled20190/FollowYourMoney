const token = localStorage.getItem('token');
const role = localStorage.getItem('userRole');
const name = localStorage.getItem('UserName');

const initialState = {
  token: token || null,
  role: role || null,
  name: name || null,
  isAuthenticated: !!token
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_AUTH':
            return {
                ...state,
                token: action.payload.token,
                role: action.payload.role,
                name:action.payload.name,
                isAuthenticated:true
            };
        case 'LOGOUT':
            return {
                token: null,
                role: null,
                name:null,
                isAuthenticated:false
            };
        default:
            return state;
    }
};

export default authReducer;