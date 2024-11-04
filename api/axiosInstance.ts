import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.100.246:3333/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
