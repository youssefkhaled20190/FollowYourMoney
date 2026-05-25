import axiosInstance from "../../Axios/AxiosInstance"; // adjust path as needed
// ✅ GET
export const createGetRequest = ({ endPoint }) => ({
  params = {},
  onSuccess = () => {},
  onFailure = () => {},
}) => {
  axiosInstance
    .get(endPoint, { params })
    .then((response) => onSuccess(response.data))
    .catch((error) => {
      console.error("GET Error:", error);
      onFailure(error);
    });
};
// ✅ POST (Create)
export const createPostRequest = ({ endPoint }) => ({
  body,
  onSuccess = () => {},
  onFailure = () => {},
}) => {
  axiosInstance
    .post(endPoint, body)
    .then((response) => onSuccess(response.data))
    .catch((error) => {
      console.error("POST Error:", error);
      onFailure(error);
    });
};
// ✅ PUT (Update)
export const createUpdateRequest = ({ endPoint }) => ({
  body,
  onSuccess = () => {},
  onFailure = () => {},
}) => {
  axiosInstance
    .put(endPoint, body)
    .then(() => onSuccess())
    .catch((error) => {
      console.error("PUT Error:", error);
      onFailure(error);
    });
};
// ✅ DELETE
export const createDeleteRequest = ({ endPoint }) => ({
  id,
  onSuccess = () => {},
  onFailure = () => {},
}) => {
  axiosInstance
    .delete(`${endPoint}${id}`)
    .then(() => onSuccess())
    .catch((error) => {
      console.error("DELETE Error:", error);
      onFailure(error);
    });
};
