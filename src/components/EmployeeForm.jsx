import { useState, useEffect } from "react";
import { employeesApi } from "../api/employees.api";

function EmployeeForm({ employee, onSuccess, onCancel }) {
  const isEditing = !!employee;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    salary: "",
    status: "active"
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Initialiser avec les données de l'employé si édition
  useEffect(() => {
    if (isEditing && employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        department: employee.department || "",
        role: employee.role || "",
        salary: employee.salary?.toString() || "",
        status: employee.status || "active"
      });
    }
  }, [employee, isEditing]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Le département est requis";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Le poste est requis";
    }

    if (!formData.salary) {
      newErrors.salary = "Le salaire est requis";
    } else if (parseFloat(formData.salary) < 0) {
      newErrors.salary = "Le salaire doit être positif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const employeeData = {
        ...formData,
        salary: parseInt(formData.salary, 10)
      };

      let response;
      if (isEditing) {
        response = await employeesApi.update(employee.id, employeeData);
      } else {
        response = await employeesApi.create(employeeData);
      }

      if (!isEditing) {
        setFormData({
          name: "",
          email: "",
          department: "",
          role: "",
          salary: "",
          status: "active"
        });
      }
      setErrors({});

      onSuccess?.(response.data);
    } catch (error) {
      const message = isEditing
        ? "Erreur lors de la modification de l'employé"
        : "Erreur lors de l'ajout de l'employé";
      setSubmitError(error.response?.data?.message || message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="employee-form">
      <h2>{isEditing ? "Modifier l'employé" : "Ajouter un nouvel employé"}</h2>

      {submitError && (
        <div className="form-error">
          {submitError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Nom *</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Nom complet"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? "error" : ""}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="exemple@erp.com"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "error" : ""}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="department">Département *</label>
          <input
            id="department"
            name="department"
            type="text"
            placeholder="Ex: IT, RH, Finance"
            value={formData.department}
            onChange={handleChange}
            className={errors.department ? "error" : ""}
          />
          {errors.department && <span className="error-message">{errors.department}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="role">Poste *</label>
          <input
            id="role"
            name="role"
            type="text"
            placeholder="Ex: Developer, Manager"
            value={formData.role}
            onChange={handleChange}
            className={errors.role ? "error" : ""}
          />
          {errors.role && <span className="error-message">{errors.role}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="salary">Salaire *</label>
          <input
            id="salary"
            name="salary"
            type="number"
            placeholder="50000"
            value={formData.salary}
            onChange={handleChange}
            className={errors.salary ? "error" : ""}
          />
          {errors.salary && <span className="error-message">{errors.salary}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Statut</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-submit">
          {loading
            ? (isEditing ? "Modification en cours..." : "Ajout en cours...")
            : (isEditing ? "Modifier l'employé" : "Ajouter l'employé")
          }
        </button>
        <button type="button" onClick={onCancel} className="btn-cancel">
          Annuler
        </button>
      </div>
    </form>
  );
}

export default EmployeeForm;
