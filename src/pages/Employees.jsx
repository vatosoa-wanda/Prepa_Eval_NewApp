import { useState, useEffect } from "react";
 
function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
 
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

  // Filtrer les employés selon le terme de recherche
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.name?.toLowerCase().includes(searchLower) ||
      employee.position?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.id?.toString().includes(searchLower)
    );
  });

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
          {filteredEmployees.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>
                Aucun employé ne correspond à votre recherche
              </td>
            </tr>
          ) :(
            filteredEmployees.map(employee => (
              <tr key={employee.id}>
                <td style={{ padding: "8px" }}>{employee.id}</td>
                <td style={{ padding: "8px" }}>{employee.name}</td>
                <td style={{ padding: "8px" }}>{employee.position}</td>
                <td style={{ padding: "8px" }}>{employee.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;