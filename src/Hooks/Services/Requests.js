// src/Hooks/Services/Requests.js
import axiosInstance from '../../Axios/AxiosInstance';

/**
 * ============================================
 * GENERIC API REQUESTS
 * ============================================
 */

/**
 * ============================================
 * GET REQUEST
 * ============================================
 */
export const createGetRequest = async (endPoint, params = {}) => {
  try {
    // Clean params - remove null, undefined, empty strings
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    console.log(`🌐 Fetching from API: ${endPoint}`);
    console.log(`📦 Params:`, cleanParams);

    const response = await axiosInstance.get(endPoint, { params: cleanParams });

    console.log(`✅ Full Response:`, response);
    console.log(`✅ Response.data:`, response.data);

    // ✅ FIX: Return response.data directly (not response.data.data)
    return response.data;

  } catch (error) {
    console.error('❌ GET Error:', error);
    console.error('❌ Error Response:', error.response?.data);
    throw error;
  }
};

/**
 * ============================================
 * POST REQUEST
 * ============================================
 */
export const createPostRequest = async (endPoint, body) => {
  try {
    console.log(`🌐 Posting to API: ${endPoint}`);
    const response = await axiosInstance.post(endPoint, body);
    return response.data;
  } catch (error) {
    console.error('POST Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * ============================================
 * PUT REQUEST
 * ============================================
 */
export const createUpdateRequest = async (endPoint, body) => {
  try {
    console.log(`🌐 Updating via API: ${endPoint}`);
    const response = await axiosInstance.put(endPoint, body);
    return response.data;
  } catch (error) {
    console.error('PUT Error:', error);
    throw error;
  }
};

/**
 * ============================================
 * DELETE REQUEST
 * ============================================
 */
export const createDeleteRequest = async (endPoint, id) => {
  try {
    // Handle case where id is undefined or endpoint already contains the id
    const hasIdInEndpoint = endPoint.includes('?') || endPoint.includes('=');
    const idToAppend = id !== undefined && id !== null && !hasIdInEndpoint ? id : '';
    const finalUrl = `${endPoint}${idToAppend}`;

    console.log(`🌐 Deleting via API: ${finalUrl}`);
    const response = await axiosInstance.delete(finalUrl);
    return response.data;
  } catch (error) {
    console.error('DELETE Error:', error);
    throw error;
  }
};
