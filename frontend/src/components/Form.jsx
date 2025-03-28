import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import Dropdown from "./Dropdown/Dropdown";

import "../styles/Form.css"
import "../styles/Error.css"

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
  const [error, setError] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    let newErrors = {}
    if(username === "") newErrors.username = "value cannot be empty";
    if(password === "") newErrors.password = "value cannot be empty";
    
    return newErrors;
  }

  const handleError = (validate) => {
    setError(validate)

    setTimeout(() => {
      setError({})
    }, 2000)

    return
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    const validate = validateForm();

    if(Object.keys(validate).length > 0) {
      handleError(validate);
      return;
    }
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
      <div className="form-input-container">
        <input
          className={error.username ? "error-form-input" : "form-input"}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        {error.username && <div className="error-box">{error.username}</div>}     
      </div>
      <div className="form-input-container">
        <input
          className={error.password ? "error-form-input" : "form-input"}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {error.password && <div className="error-box">{error.password}</div>}     
      </div>
      <button className="form-button" type="submit">
        Login
      </button>
      <button className="form-button" type="button" onClick={() => {navigate("/register")}} >
        Register
      </button>
    </form>
  )
}


function Register({route}) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("");

  const [department, setDepartment] = useState("")
  const [year, setYear] = useState("0")

  const [error, setError] = useState({});
  const navigate = useNavigate();
  
  const validateForm = () => {
    let newErrors = {}
    if(firstName === "") newErrors.first_name = "value cannot be empty";
    if(lastName === "") newErrors.last_name = "value cannot be empty";
    if(username === "") newErrors.username = "value cannot be empty";
    if(password === "") newErrors.password = "value cannot be empty";
    if(type === ""){
      newErrors.type = "value cannot be empty";
    } else if(type ==="student") {
      if(year === "0") newErrors.year= "value cannot be empty";
      if(department === "") newErrors.department= "value cannot be empty";
    } else {
      if(department === "") newErrors.department= "value cannot be empty";
    }
    
    return newErrors;
  }
  
  const handleError = (validate) => {
    setError(validate)

    setTimeout(() => {
      setError({})
    }, 2000)

    return
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const validate = validateForm();

    if(Object.keys(validate).length > 0) {
      handleError(validate);
      console.log("1")
      return;
    };
    try {
      console.log(route)
      const res = await api.post(route, {
        first_name: firstName,
        last_name: lastName,
        username: username,
        password: password,
        type_of_user: type,
        year: year,
        department_id: department
      })

      navigate("/login")
    } catch(error) {
      alert(error)
    }
  }
  
  const getType = (a) => {
    console.log(a)
    setType(a); 
  }
  const item=["student", "instructor"]

  return(
    <form onSubmit={handleSubmit} className="form-container">
      <h1>Register</h1>

      <div className="form-input-container">
        <input
          className={error.first_name ? "error-form-input" : "form-input"}
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
        />
        {error.first_name && <div className="error-box">{error.first_name}</div>}     
      </div>

      <div className="form-input-container">
        <input
          className={error.last_name  ? "error-form-input" : "form-input"}
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
        />
        {error.last_name  && <div className="error-box">{error.last_name}</div>}     
      </div>

      <div className="form-input-container">
        <input
          className={error.username ? "error-form-input" : "form-input"}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        {error.username && <div className="error-box">{error.username}</div>}     
      </div>

      <div className="form-input-container">
        <input
          className={error.password  ? "error-form-input" : "form-input"}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {error.password && <div className="error-box">{error.password}</div>}     
      </div>
      <div className="form-input-container">
        <Dropdown name="Type" items={item} val={getType}/>
        {error.type && <div className="error-box">{error.type}</div>}     
      </div>

      {type === 'instructor' &&
        <div className="form-input-container">
          <input
            className={error.department ? "error-form-input" : "form-input"}
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Department"
          />
          {error.department && <div className="error-box">{error.department}</div>}     
        </div>
        } 
        {type === 'student' &&
          (<>
            <div className="form-input-container">
              <input
                className={error.department? "error-form-input" : "form-input"}
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="department"
              />
              {error.department && <div className="error-box">{error.department}</div>}     
            </div>
            <div className="form-input-container">
              <input
                className={error.year ? "error-form-input" : "form-input"}
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year"
              />
              {error.year && <div className="error-box">{error.year}</div>}     
            </div>
          </>
          )
        }

      <button className="form-button" type="submit">
        Register
      </button>
    </form>
  )
}

export default Form
