import React, { useEffect, useState } from "react";
import { Card, ThemeProvider } from "flowbite-react";
import { createTheme } from "flowbite-react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { Building } from "lucide-react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
} from "flowbite-react";
import { ChevronLeft } from "lucide-react";
import { BookOpen, GraduationCap, Badge, Clock, FileText } from "lucide-react";
import { Tabs, Tab, Box, Button } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import { TabList, TabPanel } from "@mui/lab";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * */
function DepartmentInfo({ department_id }) {
  const [info, setInfo] = useState({
    courses: [],
    department_name: "",
    department_desc: "",
    faculty_members: [],
    students: [],
  });
  const [activeTab, setActiveTab] = useState("1");
  const navigate = useNavigate();
  const departments = [];

  const [expanded, setExpanded] = useState(false);

  const handleAccordianChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const fetchAllCourses = async () => {
    try {
      const response = await api.get("api/department/course/", {
        params: {
          department_id,
        },
      });
      console.log(response.data);
      setInfo(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const canUploadFile = (course_id) => {};

  const handleEnroll = async (course) => {
    try {
      const response = await api.get("api/enroll/", {
        params: {
          course_id: course["course_id"],
        },
      });

      fetchAllCourses();
    } catch (error) {}
  };

  const handleDeEnroll = async (course) => {
    try {
      const response = await api.get("api/deenroll/", {
        params: {
          course_id: course["course_id"],
        },
      });

      fetchAllCourses();
    } catch (error) {}
  };

  const isEnrolled = (course) => {
    let enroll;
    if (info.type === "instructor" && info.user_details?.instructor_id) {
      if (course.teaches) {
        course.teaches.forEach((element) => {
          if (element.instructor === info.user_details.instructor_id) {
            enroll = true;
          }
        });
      }
    } else if (info.type === "student" && info.user_details?.student_id) {
      if (course.student_course_detail) {
        course.student_course_detail.forEach((element) => {
          if (element.student === info.user_details.student_id) {
            enroll = true;
          }
        });
      }
    }

    if (enroll) return true;
    else return false;
  };

  const cardTheme = createTheme({
    shadow: {
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
    },
    noShadow: {
      root: {
        base: "flex rounded-lg bg-white",
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
          {/* Navigation breadcrumb */}
          <div className="mb-6">
            <Link
              to="/departments"
              className="flex items-center text-sm text-primary hover:underline"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to All Departments
            </Link>
          </div>

          {/* Department Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <Building className="mr-3 h-8 w-8 text-primary" />
              {info.department_name}
            </h1>
            <p className="text-lg text-gray-600">{info.department_desc}</p>
          </header>

          {/* Department Stats Cards */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card
              theme={cardTheme.shadow}
              clearTheme={{
                root: {
                  base: true,
                },
              }}
            >
              <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Total Courses
              </h5>
              <p className="text-3xl font-bold text-blue-900">
                {info.courses.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Academic departments
              </p>
            </Card>

            <Card
              theme={cardTheme.shadow}
              clearTheme={{
                root: {
                  base: true,
                },
              }}
            >
              <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
                <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                Faculty Members
              </h5>
              <p className="text-3xl font-bold text-blue-900">
                {info.faculty_members.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Teaching Staff
              </p>
            </Card>

            <Card
              theme={cardTheme.shadow}
              clearTheme={{
                root: {
                  base: true,
                },
              }}
            >
              <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
                Enrolled Students
              </h5>
              <p className="text-3xl font-bold text-blue-900">
                {info.students.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Active enrollment
              </p>
            </Card>
          </div>

          {/* Department Tabs */}
          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={(event, newValue) => setActiveTab(newValue)}
                aria-label="lab API tabs example"
              >
                <Tab label="overview" value="0" />
                <Tab label="courses" value="1" />
              </TabList>
            </Box>
            <TabPanel value="0">
              <div>
                <Card
                  theme={cardTheme.shadow}
                  clearTheme={{
                    root: {
                      base: true,
                    },
                  }}
                >
                  <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
                    About Department
                  </h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    {info.department_desc}
                  </p>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4 mt-4">Faculty</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {info.faculty_members.map((member, index) => (
                    <Card
                      theme={cardTheme.shadow}
                      clearTheme={{
                        root: {
                          base: true,
                        },
                      }}
                    >
                      <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
                        {member.user.first_name + " " + member.user.last_name}
                      </h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Instructor
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </TabPanel>
            <TabPanel value="1">
              {info.courses.map((course, index) => (
                <Accordion
                  expanded={expanded === `panel${index}`}
                  onChange={handleAccordianChange(`panel${index}`)}
                  key={index}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                  >
                    <div className="w-full">
                      <Card
                        theme={cardTheme.noShadow}
                        clearTheme={{
                          root: {
                            base: true,
                          },
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <BookOpen className="h-5 w-5 text-primary mr-2" />
                            <h1 className="flex font-bold tracking-tight text-blue-900">
                              {course.course_name}
                            </h1>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            {course.teaches.map((teacher, index) => (
                              <>
                                {teacher.instructor}
                                <span className="mx-2">•</span>
                              </>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="p-4 bg-slate-50">
                      <div className="mb-4">
                        <h3 className="font-medium mb-2">Course Description</h3>
                        <p className="text-gray-600">{course.course_desc}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Course Materials
                      </h3>
                      <Table></Table>

                      {canUploadFile(course.course_id) && <div></div>}
                    </div>
                    <div>
                      {course.department === info.user_details.department ? (
                        isEnrolled(course) ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleDeEnroll(course)}
                          >
                            cancel
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleEnroll(course)}
                          >
                            enroll
                          </Button>
                        )
                      ) : (
                        <div>Cannot enroll</div>
                      )}
                    </div>
                  </AccordionDetails>
                </Accordion>
              ))}
            </TabPanel>
          </TabContext>
        </div>
      </div>
    </>
  );
}

export default DepartmentInfo;
