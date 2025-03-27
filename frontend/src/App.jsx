import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import StudentHome from "./pages/StudentHome"
import Course from "./pages/Course"
import InstructorLayout from "./components/InstructorLayout"
import Departments from "./pages/Departments"

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
            path="/student"
            element={
              <ProtectedRoute>
                <StudentHome />
              </ProtectedRoute>
            }
          >
          </Route>
          <Route
            path="/instructor"
            element={
              <ProtectedRoute>
                <InstructorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="course" element={<Course/>}></Route>
            <Route path="departments" element={<Departments />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
