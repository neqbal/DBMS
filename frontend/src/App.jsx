import react from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Departments from "./components/Departments";
import Layout from "./components/Layout";
import Modules from "./pages/Modules";
import IndividualCourse from "./pages/IndividualCourse";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import EnrolledCourse from "./pages/EnrolledCourse";

function Logout() {
  localStorage.clear();
  return <Navigate to="/auth" />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/index" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="individualCourse"
              element={<IndividualCourse />}
            ></Route>
            <Route path="course" element={<EnrolledCourse />}></Route>
            <Route path="departments" element={<Departments />}></Route>
            <Route path="mymodules" element={<Modules />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
