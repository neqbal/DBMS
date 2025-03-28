import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import Course from "./pages/Course"
import Departments from "./pages/Departments"
import Layout from "./components/Layout"
import Modules from "./pages/Modules"
import IndividualCourse from "./pages/IndividualCourse"


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
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="individualCourse" element={<IndividualCourse />}></Route>
            <Route path="course" element={<Course />}></Route>
            <Route path="departments" element={<Departments />}></Route>
            <Route path="mymodules" element={<Modules />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
