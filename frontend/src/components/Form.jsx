import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import Dropdown from "./Dropdown/Dropdown";

import "../styles/Form.css"

function Form({route, method}) {
  if(method === 'login') {
    return <Login route={route} />
  } else {
    return <Register route={route} />
  }
} 

function Login({route}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const res = await api.post(route, {username, password})
      localStorage.setItem(ACCESS_TOKEN, res.data.access)
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
      navigate("/")
    } catch(error) {
      alert(error)
    }
  }

  return(
    <form onSubmit={handleSubmit} className="form-container">
      <h1>Login</h1>
      <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button className="form-button" type="submit">
                Login
            </button>
    </form>
  )
}


function Register({route}) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("")
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      console.log(route)
      const res = await api.post(route, {first_name: firstName, last_name: lastName, username, password, typeOfUser: type})
      navigate("/login")
    } catch(error) {
      alert(error)
    }
  }
  
  const getType = (a) => {
    console.log(a)
    setType(a); 
  }
  const item=["Student", "Teacher"]

  return(
    <form onSubmit={handleSubmit} className="form-container">
      <h1>Register</h1>
      <input
        className="form-input"
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
      />
      <input
        className="form-input"
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
      />
      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Dropdown name="Type" items={item} val={getType}/>
      <button className="form-button" type="submit">
        Register
      </button>
    </form>
  )
}

export default Form
