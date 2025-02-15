import axios from "axios";
import { APIServer } from "./apiServer";

const axiosInstance = axios.create({
   baseURL: APIServer,
});

// Where you would set stuff like your 'Authorization' header, etc ...
// if (localStorage.getItem(ELocalStorageKey.ACCESS_TOKEN)) {
//   const accessToken = localStorage.getItem(ELocalStorageKey.ACCESS_TOKEN);
//   axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
// }

axiosInstance.defaults.headers.post["Content-Type"] = "application/json";

axiosInstance.interceptors.response.use(
   (response) => {
      return Promise.resolve(response);
   },
   (error) => {
      if (error.response && error.response.status === 401) {
         window.location.href = "/logout";
      }
      //   return error;
      console.error("error.response.data", error.response.data);
      return Promise.reject(error?.response?.data || error);
   }
);

export default axiosInstance;
