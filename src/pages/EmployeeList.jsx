import { useState, useEffect } from "react";
 
function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
 
  // Déclenché UNE FOIS au montage (tableau vide [])
  useEffect(() => {
    fetch("http://localhost:3001/employees")
      .then(res => res.json())
      .then(data => {
        setEmployees(data);
        setLoading(false);
      });
  }, []);  // ← dépendances vides = exécution au montage seulement
 
  // Déclenché quand searchTerm change
  useEffect(() => {
    console.log("Recherche:", searchTerm);
  }, [searchTerm]);
 
  // Cleanup : exécuté au démontage
  useEffect(() => {
    const timer = setInterval(() => fetchData(), 5000);
    return () => clearInterval(timer); // nettoyage !
  }, []);
}
