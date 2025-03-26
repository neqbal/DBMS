import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import InstructorHome from "./pages/InstructorHome"
import StudentHome from "./pages/StudentHome"


function Logout() {
    localStorage.clear()
    return <Navigate to="/login"/>
}

function RegisterAndLogout() {
    localStorage.clear()
    return <Register />
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<RegisterAndLogout/>} />
          <Route
            path="/studenthome"
            element={
              <ProtectedRoute>
                <StudentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructorhome"
            element={
              <ProtectedRoute>
                <InstructorHome />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
