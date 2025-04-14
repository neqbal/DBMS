import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { AtSign, Lock, Eye, EyeOff, GraduationCap } from "lucide-react";

import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

const AuthForm = () => {
  const [mode, setMode] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [department, setDepartment] = useState("");
  const [userType, setUserType] = useState("student");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = {
      first_name: first_name,
      last_name: last_name,
      username: username,
      password: password,
      type_of_user: userType,
      department_id: department,
    };

    console.log(formData);

    try {
      if (mode === "register") {
        const res = await api.post("/api/user/register/", formData);
        toggleMode();
        console.log(res);
      } else {
        const res = await api.post("/api/token/", { username, password });
        console.log(res);
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/course");
      }
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center mb-8">
        <GraduationCap className="h-8 w-8  mr-2" />
        <h1 className="text-2xl font-bold text-edu-dark">EduLearn</h1>
      </div>

      <h2 className="text-3xl font-bold text-center mb-2">
        {mode === "login" ? "Welcome Back!" : "Create Account"}
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        {mode === "login"
          ? "Enter your credentials to access your account"
          : "Fill out the form to start your learning journey"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "register" && (
          <>
            <div className="space-y-2">
              <TextField
                className="w-95"
                id="outlined-basic"
                label="First Name"
                variant="outlined"
                size="small"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <TextField
                className="w-95"
                id="outlined-basic"
                label="Last Name"
                variant="outlined"
                size="small"
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <TextField
            className="w-95"
            id="outlined-basic"
            label="username"
            variant="outlined"
            size="small"
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <TextField
            className="w-95"
            id="outlined-basic"
            label="password"
            variant="outlined"
            size="small"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {mode === "register" && (
          <FormControl>
            <FormLabel id="demo-controlled-radio-buttons-group">
              I am a:
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <FormControlLabel
                value="student"
                control={<Radio />}
                label="student"
              />
              <FormControlLabel
                value="instructor"
                control={<Radio />}
                label="instructor"
              />
            </RadioGroup>
          </FormControl>
        )}

        {mode === "register" && (
          <div className="space-y-2">
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel id="demo-select-small-label">Departments</InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={department}
                label="Departments"
                onChange={(e) => {
                  setDepartment(e.target.value);
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={"CSE"}>Computer Science</MenuItem>
                <MenuItem value={"EEE"}>Electrical and Electronics</MenuItem>
                <MenuItem value={"ECE"}>Electrical and Communications</MenuItem>
                <MenuItem value={"ME"}>Mechanical Engineering</MenuItem>
                <MenuItem value={"MCT"}>Mechatronics</MenuItem>
                <MenuItem value={"DSAI"}>Data science and AI</MenuItem>
                <MenuItem value={"CE"}>Civil engineering</MenuItem>
                <MenuItem value={"BME"}>Biomedical engineering</MenuItem>
                <MenuItem value={"AS"}>Applied sciences</MenuItem>
                <MenuItem value={"IT"}>Information technology</MenuItem>
              </Select>
            </FormControl>
          </div>
        )}

        <div className="space-y-2">
          <Button variant="contained" type="submit">
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </div>

        <p className="text-center text-sm mt-6">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-cyan-900 font-medium hover:underline"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthForm;
