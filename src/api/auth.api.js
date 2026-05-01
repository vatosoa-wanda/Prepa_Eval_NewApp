import api from "./axios.config";

const authApi = {
  login: (email, password) => {
    return api.get(`/users?email=${email}&password=${password}`);
  },
};

export default authApi;