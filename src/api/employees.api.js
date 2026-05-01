import api from "./axios.config";
 
export const employeesApi = {
  getAll: (params) => api.get("/employees", { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post("/employees", data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  remove: (id) => api.delete(`/employees/${id}`),
  import: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/employees/import", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};
