import { useState, useEffect } from "react";
 
function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Chargement des employés au montage du composant
  useEffect(() => {
    fetch("http://localhost:3001/employees")
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des employés");
        }
        return response.json();
      })
      .then(data => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

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
    <div>
      <h1>Liste des employés</h1>
      
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Poste</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.position}</td>
              <td>{employee.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;