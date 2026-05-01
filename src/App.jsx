import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import  LoginForm from "./pages/Login";
import {useAuthStore} from "./store/authStore";
import EmployeeList from "./pages/Employees";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";

function App() {
  const { isAuthenticated } = useAuthStore();
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        {/* <Route path="/employees" element={<EmployeesList />} /> */}
        {/* Routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* <Route path="/employees/:id" element={<EmployeeDetail />} /> */}
          </Route>
        </Route>
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
