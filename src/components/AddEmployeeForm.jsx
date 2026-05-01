import { useState } from "react";
import api from "../api/axios.config";

function AddEmployeeForm({ onSuccess, onCancel }) {
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

  const validate = () => {
    const newErrors = {};

    // Validation du nom
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation du département
    if (!formData.department.trim()) {
      newErrors.department = "Le département est requis";
    }

    // Validation du poste
    if (!formData.role.trim()) {
      newErrors.role = "Le poste est requis";
    }

    // Validation du salaire
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
    // Effacer l'erreur du champ quand l'utilisateur modifie
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
      // Convertir salary en nombre
      const employeeData = {
        ...formData,
        salary: parseInt(formData.salary, 10)
      };

      const response = await api.post("/employees", employeeData);
      
      // Réinitialiser le formulaire
      setFormData({
        name: "",
        email: "",
        department: "",
        role: "",
        salary: "",
        status: "active"
      });
      setErrors({});
      
      onSuccess?.(response.data);
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Erreur lors de l'ajout de l'employé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="employee-form">
      <h2>Ajouter un nouvel employé</h2>

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
          {loading ? "Ajout en cours..." : "Ajouter l'employé"}
        </button>
        <button type="button" onClick={onCancel} className="btn-cancel">
          Annuler
        </button>
      </div>
    </form>
  );
}

export default AddEmployeeForm;