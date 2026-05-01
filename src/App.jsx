import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import  LoginForm from "./pages/Login";
import {useAuthStore} from "./store/authStore";

function App() {
  const { isAuthenticated } = useAuthStore();
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        {/* Routes protégées */}
        {/* <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/products" element={<Products />} />
          </Route>
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}
 
// Route protégée
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace />;
}

export default App
