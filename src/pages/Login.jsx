import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password); // appel API
      console.log("Connexion réussie, redirection...");
      navigate("/employees");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <button disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
    </form>
  );
}

export default LoginForm;
