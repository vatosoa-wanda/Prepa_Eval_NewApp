import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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
      <Input
        label="Email"
        type="email"
        placeholder="Entrez votre email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <Input
        label="Mot de passe"
        type="password"
        placeholder="Entrez votre mot de passe"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        loading={loading}
      >
        Se connecter
      </Button>
    </form>
  );
}

export default LoginForm;
