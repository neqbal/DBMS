import {
  Avatar,
  createTheme,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  ThemeProvider,
} from "flowbite-react";
import { GraduationCap } from "lucide-react";
import api from "../api";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function NavigationBar() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserData = async () => {
    try {
      const response = await api.get("/api/user/info/");
      console.log(response.data);
      localStorage.setItem("department_id", response.data.department_id);
      localStorage.setItem("lms_id", response.data.lms_id);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("type_of_user", response.data.type_of_user);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const isActive = (path) => location.pathname === path;

  const navTheme = createTheme({
    navbar: {
      root: {
        base: "bg-sky-200 px-2 py-2.5 sm:px-4 border-gray-700 rounded-lg shadow-lg",
      },
      collapse: {
        base: "w-full md:block md:w-auto",
        list: "mt-4 flex flex-col md:mt-0 md:flex-row md:space-x-8",
      },
      link: {
        base: "block px-3 py-2",
        active: {
          on: "text-blue-600",
          off: "text-gray-900",
        },
      },
    },
  });
  return (
    <>
      <ThemeProvider theme={navTheme}>
        <Navbar
          fluid
          rounded
          clearTheme={{
            root: {
              base: true,
            },
            link: true,
          }}
        >
          <NavbarBrand href="/">
            <GraduationCap className="h-8 w-8 mr-2 text-blue-900 " />
            <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-blue-900">
              EduLearn
            </span>
          </NavbarBrand>
          <div className="flex md:order-2">
            <Dropdown
              arrowIcon={false}
              inline
              label={<Avatar alt="User settings" rounded />}
            >
              <DropdownHeader>
                <div className="p-4 bg-gray-300 rounded-lg shadow-md w-full max-w-sm">
                  <div className="flex flex-col items-start space-y-1 text-gray-800">
                    <span className="block text-lg font-semibold">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="block text-sm text-gray-500">
                      @{user.username}
                    </span>
                    <span className="block text-sm text-gray-600">
                      Dept: {user.department_id}
                    </span>
                    <span className="block truncate text-sm font-medium text-gray-700">
                      LMS ID: {user.lms_id}
                    </span>
                  </div>
                </div>
              </DropdownHeader>
              <DropdownItem>Settings</DropdownItem>
              <DropdownDivider />
              <DropdownItem
                onClick={() => {
                  navigate("/logout");
                }}
              >
                Sign out
              </DropdownItem>
            </Dropdown>
            <NavbarToggle />
          </div>
          <NavbarCollapse>
            <>
              <NavbarLink
                onClick={() => navigate("/course")}
                active={isActive("/course")}
              >
                My Course
              </NavbarLink>
              <NavbarLink
                onClick={() => {
                  navigate("/quizzes");
                }}
              >
                Quizes
              </NavbarLink>
            </>
            <NavbarLink
              onClick={() => {
                navigate("/departments");
              }}
              active={isActive("/departments")}
            >
              Departments
            </NavbarLink>
          </NavbarCollapse>
        </Navbar>
      </ThemeProvider>
    </>
  );
}

export default NavigationBar;
