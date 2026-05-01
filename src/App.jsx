import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import  LoginForm from "./pages/Login";
import {useAuthStore} from "./store/authStore";
// import EmployeeList from "./pages/Employees";

function App() {
  const { isAuthenticated } = useAuthStore();
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        {/* Routes protégées */}
        {/* <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/employees" />} />
            <Route path="/employees" element={<Employees />} />
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
