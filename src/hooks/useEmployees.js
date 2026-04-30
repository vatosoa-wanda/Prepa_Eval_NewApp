import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios.config";
 
export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
 
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { fetchAll(); }, [fetchAll]);
 
  const filtered = useMemo(() =>
    employees.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
    ), [employees, search]
  );
 
  const create = async (data) => {
    await api.post("/employees", data);
    await fetchAll();
  };
 
  const remove = async (id) => {
    await api.delete(`/employees/${id}`);
    setEmployees(prev => prev.filter(e => e.id !== id));
  };
 
  return { employees: filtered, loading, error, search, setSearch, create, remove, refetch: fetchAll };
}
