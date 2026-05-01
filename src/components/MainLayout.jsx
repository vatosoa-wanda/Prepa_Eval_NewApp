// components/MainLayout.jsx
import { Outlet, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function MainLayout() {
  const { logout, user } = useAuthStore();

  return (
    <div>
      {/* Barre de navigation */}
      <nav style={{ 
        padding: "10px", 
        backgroundColor: "#f0f0f0",
        display: "flex",
        gap: "20px",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/employees">Employés</Link>
          <Link to="/dashboard">Tableau de Bord</Link>
        </div>
        <div>
          <span style={{ marginRight: "10px" }}>Bienvenue, {user?.email || "Utilisateur"}</span>
          <button onClick={logout}>Déconnexion</button>
        </div>
      </nav>
      
      {/* Contenu principal */}
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;