const initialState = {
  token: null,
  role: null,
  name: null,
  isAuthenticated: false,
  loading: true
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN_REQUEST':
            return {
                ...state,
                loading: true
            };
        case 'SET_AUTH':
            return {
                ...state,
                token: action.payload.token,
                role: action.payload.role,
                name: action.payload.name,
                isAuthenticated: true,
                loading: false
            };
        case 'LOGIN_FAILURE':
        case 'LOGOUT':
            return {
                token: null,
                role: null,
                name: null,
                isAuthenticated: false,
                loading: false
            };
        default:
            return state;
    }
};

export default authReducer;