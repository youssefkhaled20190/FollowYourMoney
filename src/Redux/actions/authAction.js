import { createPostRequest } from "../../Hooks/Services/Requests";
import axiosInstance from "../../Axios/AxiosInstance";

export const setAuth = (role, name) => {
    return {
        type: 'SET_AUTH',
        payload: { token: "cookie", role, name }
    };
};

export const logout = () => async (dispatch) => {
  try {
    await axiosInstance.post("/Auth/Logout");
  } catch (error) {
    console.error("❌ Logout error:", error);
  }
  
  // Clean up any legacy localStorage data
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('UserName');

  dispatch({ type: 'LOGOUT' });
};

export const loginUser = (userName, password) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });

    const response = await createPostRequest("/Auth/Login", { userName, password });
    const data = response.data || response;

    if (!data?.result) throw new Error("Invalid response from server");

    const { userName: resolvedName, userRole: resolvedRole, defaultPage } = data;

    // Clean up any legacy localStorage data
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('UserName');

    dispatch({
      type: "SET_AUTH",
      payload: { token: "cookie", role: resolvedRole, name: resolvedName, defaultPage },
    });

    return { success: true, defaultPage };
  } catch (error) {
    console.error("❌ Login error:", error);
    dispatch({ type: "LOGIN_FAILURE", payload: error.message });
    return { success: false };
  }
};

export const checkLoginStatus = () => async (dispatch) => {
  try {
    // Clean up legacy storage values on check
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('UserName');

    const response = await axiosInstance.get("/Auth/CheckLogins");
    const data = response.data || response;
    
    if (data?.result) {
      const { userName, userRole } = data;
      
      dispatch({
        type: "SET_AUTH",
        payload: { token: "cookie", role: userRole, name: userName },
      });
      return { success: true };
    }
  } catch (error) {
    console.info("Session check failed (not logged in):", error.message);
  }
  
  dispatch({ type: "LOGOUT" });
  return { success: false };
};