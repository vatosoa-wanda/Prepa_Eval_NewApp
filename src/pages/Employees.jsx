import { useState, useEffect, useMemo } from "react";
import EmployeeForm from "../components/EmployeeForm";
import { employeesApi } from "../api/employees.api";
import "../styles/employees.css";
import Button from "../components/ui/Button";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all"); // 'all', 'name', 'role', 'email'
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
 
  // Fonction pour charger les employés
  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/employees");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des employés");
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Chargement des employés au montage du composant
  useEffect(() => {
    loadEmployees();
  }, []);

  // Gérer le succès de l'ajout
  const handleAddSuccess = (newEmployee) => {
    setEmployees(prev => [...prev, newEmployee]);
    setSuccessMessage(`Employé "${newEmployee.name}" ajouté avec succès!`);
    setShowForm(false);

    // Masquer le message après 3 secondes
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Gérer le succès de la modification
  const handleEditSuccess = (updatedEmployee) => {
    setEmployees(prev =>
      prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
    );
    setSuccessMessage(`Employé "${updatedEmployee.name}" modifié avec succès!`);
    setEditingEmployee(null);

    // Masquer le message après 3 secondes
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Ouvrir le formulaire d'édition
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
  };

  // Fermer le formulaire d'édition
  const handleCancelEdit = () => {
    setEditingEmployee(null);
  };

  // Supprimer un employé
  const handleDelete = async (employee) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${employee.name} ?`)) {
      return;
    }

    try {
      setDeleteError(null);
      await employeesApi.remove(employee.id);
      setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
      setSuccessMessage(`Employé "${employee.name}" supprimé avec succès!`);

      // Masquer le message après 3 secondes
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setDeleteError(`Erreur lors de la suppression : ${err.message}`);
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  // Filtrer les employés selon le terme de recherche
  // const filteredEmployees = employees.filter(employee => {
  //   const searchLower = searchTerm.toLowerCase();
  //   return (
  //     employee.name?.toLowerCase().includes(searchLower) ||
  //     employee.position?.toLowerCase().includes(searchLower) ||
  //     employee.email?.toLowerCase().includes(searchLower) ||
  //     employee.id?.toString().includes(searchLower)
  //   );
  // });

  // Filtrage optimisé avec useMemo
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;

    const searchLower = searchTerm.toLowerCase();
    
    return employees.filter(employee => {
      switch (searchField) {
        case "name":
          return employee.name?.toLowerCase().includes(searchLower);
        case "role":
          return employee.role?.toLowerCase().includes(searchLower);
        case "email":
          return employee.email?.toLowerCase().includes(searchLower);
        default:
          return (
            employee.name?.toLowerCase().includes(searchLower) ||
            employee.role?.toLowerCase().includes(searchLower) ||
            employee.email?.toLowerCase().includes(searchLower) ||
            employee.id?.toString().includes(searchLower)
          );
      }
    });
  }, [employees, searchTerm, searchField]);

  // Affichage pendant le chargement
  if (loading) {
    return <div>Chargement des employés...</div>;
  }

  // Affichage en cas d'erreur
  if (error) {
    return <div>Erreur : {error}</div>;
  }

  // Affichage du tableau des employés
  return (
    <div className="employees-container">
      {successMessage && (
        <div className="success-message">
          ✓ {successMessage}
        </div>
      )}
      {deleteError && (
        <div className="error-message">
          ✗ {deleteError}
        </div>
      )}

      <div className="employees-header">
        <h1>Liste des employés</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-add-employee"
        >
          {showForm ? "Masquer le formulaire" : "+ Ajouter un employé"}
        </button>
      </div>

      {showForm && (
        <div className="form-section">
          <EmployeeForm
            onSuccess={handleAddSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingEmployee && (
        <div className="form-section">
          <EmployeeForm
            employee={editingEmployee}
            onSuccess={handleEditSuccess}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher un employé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <span style={{ marginLeft: "10px", color: "#666" }}>
            {filteredEmployees.length} résultat(s) trouvé(s)
          </span>
        )}
      </div>

      <table border="1" className="employees-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Département</th>
            <th>Poste</th>
            <th>Salaire</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ padding: "20px", textAlign: "center" }}>
                Aucun employé ne correspond à votre recherche
              </td>
            </tr>
          ) :(
            filteredEmployees.map(employee => (
              <tr key={employee.id}>
                <td style={{ padding: "8px" }}>{employee.id}</td>
                <td style={{ padding: "8px" }}>{employee.name}</td>
                <td style={{ padding: "8px" }}>{employee.email}</td>
                <td style={{ padding: "8px" }}>{employee.department}</td>
                <td style={{ padding: "8px" }}>{employee.role}</td>
                <td style={{ padding: "8px" }}>{employee.salary?.toLocaleString()} €</td>
                <td style={{ padding: "8px" }}>
                  <span className={`status-${employee.status}`}>
                    {employee.status === "active" ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td style={{ padding: "8px", textAlign: "center", display: "flex", gap: "8px", justifyContent: "center" }}>
                  <Button
                    variant="primary"
                    onClick={() => handleEdit(employee)}
                  >
                    ✏️ Modifier
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(employee)}
                  >
                    🗑️ Supprimer
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;