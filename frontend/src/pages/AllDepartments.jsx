import React, { useEffect, useState } from "react";
import { Card, ThemeProvider } from "flowbite-react";
import { createTheme } from "flowbite-react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Building } from "lucide-react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
} from "flowbite-react";
import "../styles/Card.css";

function AllDepartments() {
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  const fetchAllDepartment = async () => {
    try {
      const response = await api.get("/api/alldepartments/");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchAllDepartment();
  }, []);

  const cardTheme = createTheme({
    root: {
      base: "flex rounded-lg border border-gray-200 bg-white shadow-md",
      children: "flex h-full flex-col justify-center gap-4 p-6",
      horizontal: {
        off: "flex-col",
        on: "flex-col md:max-w-xl md:flex-row",
      },
    },
    img: {
      base: "",
      horizontal: {
        off: "rounded-t-lg",
        on: "h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg",
      },
    },
  });

  const tableTheme = createTheme({
    root: {
      base: "w-full text-left text-sm text-gray-500",
      shadow:
        "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white drop-shadow-md",
      wrapper: "relative",
    },
    body: {
      base: "group/body",
      cell: {
        base: "px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
      },
    },
    head: {
      base: "group/head text-xs uppercase text-gray-700",
      cell: {
        base: "bg-white px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg",
      },
    },
    row: {
      base: "group/row",
      hovered: "hover:bg-gray-50",
      striped: "odd:bg-white even:bg-black",
    },
  });

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Academic Departments
            </h1>
            <p className="text-lg text-gray-600">
              Explore our academic departments and their specialized programs
            </p>
          </header>

          {/* Departments Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card
              theme={cardTheme}
              clearTheme={{
                root: {
                  base: true,
                },
              }}
            >
              <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
                Total Departments
              </h5>
              <p className="text-3xl font-bold text-blue-900">
                {departments.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Academic departments
              </p>
            </Card>

            <Card
              theme={cardTheme}
              clearTheme={{
                root: {
                  base: true,
                },
              }}
            >
              <h5 className="text-2xl font-bold tracking-tight text-blue-900">
                Total Courses
              </h5>
              <p className="text-3xl font-bold text-blue-900">
                {departments.reduce(
                  (total, dept) => total + dept.number_of_courses,
                  0,
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Academic departments
              </p>
            </Card>
          </div>

          {/* Departments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Table hoverable theme={tableTheme} clearTheme={true}>
              <TableHead>
                <TableRow>
                  <TableHeadCell>ID</TableHeadCell>
                  <TableHeadCell>Department</TableHeadCell>
                  <TableHeadCell>Description</TableHeadCell>
                  <TableHeadCell>Courses</TableHeadCell>
                  <TableHeadCell>Students</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((dep, index) => (
                  <TableRow className="bg-white" key={index}>
                    <TableCell
                      className="font-extrabold text-gray-900"
                      onClick={() =>
                        navigate(
                          `/departments?department_id=${dep["department_id"]}`,
                        )
                      }
                    >
                      {dep["department_id"]}
                    </TableCell>
                    <TableCell className="text-cyan-900 font-bold">
                      {dep["department_name"]}
                    </TableCell>
                    <TableCell className="text-black">
                      {dep["department_desc"]}
                    </TableCell>
                    <TableCell>{dep["number_of_courses"]}</TableCell>
                    <TableCell>{dep["number_of_students"]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}

export default AllDepartments;
