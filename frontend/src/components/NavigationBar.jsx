import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import reactLogo from "../assets/react.svg"
import api from "../api";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function NavigationBar() {
    const [user, setUser] = useState({});
    const navigate = useNavigate()
    const location = useLocation()

    const fetchUserData = async () => {
        try {
            const response = await api.get("/api/user/info/");
            console.log(response.data)
            localStorage.setItem("department_id", response.data.department_id)
            localStorage.setItem("lms_id", response.data.lms_id)
            localStorage.setItem("username", response.data.username)
            localStorage.setItem("type_of_user", response.data.type_of_user)
            setUser(response.data); 
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);
 
  const isActive = (path) => location.pathname === path

  return (
    <div className="navbar">
      <Navbar fluid rounded>
        <NavbarBrand href="https://flowbite-react.com">
          <img src={reactLogo} className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">LMS Portal</span>
        </NavbarBrand>
        <div className="flex md:order-2">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt="User settings" img="https://flowbite.com/docs/images/people/profile-picture-5.jpg" rounded />
            }
          >
            <DropdownHeader>
              <div className="p-4 bg-gray-300 rounded-lg shadow-md w-full max-w-sm">
                <div className="flex flex-col items-start space-y-1 text-gray-800">
                  <span className="block text-lg font-semibold">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="block text-sm text-gray-500">@{user.username}</span>
                  <span className="block text-sm text-gray-600">Dept: {user.department_id}</span>
                  <span className="block truncate text-sm font-medium text-gray-700">
                    LMS ID: {user.lms_id}
                  </span>
                </div>
              </div>
            </DropdownHeader>
            <DropdownItem>Settings</DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={() => {navigate("/logout")}} >Sign out</DropdownItem>
          </Dropdown>
          <NavbarToggle />
        </div>
        <NavbarCollapse>
          <NavbarLink href="#">Home</NavbarLink>
            <>
              <NavbarLink 
                onClick={() => navigate("/course")}
                active={isActive("/course")}
              >
                Course
              </NavbarLink>
              {user.type_of_user == "instructor" && (
                <NavbarLink
                  onClick={() => navigate("/mymodules")}
                  active={isActive("/mymodules")}
                > 
                  My modules
                </NavbarLink>
              )}
              <NavbarLink href="#">Quizes</NavbarLink>
            </>
          <NavbarLink onClick={() => {navigate("/departments")}} active={isActive("/departments")}>Departments</NavbarLink>
        </NavbarCollapse>
      </Navbar>
    </div>
  );
}

export default NavigationBar
