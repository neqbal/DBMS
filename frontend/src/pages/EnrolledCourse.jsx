import React from "react";
import { useState, useEffect } from "react";
import { Card } from "flowbite-react";
import { createTheme } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Badge, Clock, FileText } from "lucide-react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionActions from "@mui/material/AccordionActions";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
} from "flowbite-react";
import api from "../api";

function EnrolledCourse() {
  const [details, setDetails] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [personName, setPersonName] = React.useState([]);

  const downloadFile = async (moduleId) => {
    try {
      const response = await api.get(`/api/download/module/${moduleId}/`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${moduleId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("You do not have permission to download this file.");
    }
  };
  const handleSelectChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(typeof value === "string" ? value.split(",") : value);
  };
  const handleAccordianChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleFileUpload = async (course_id, event) => {
    console.log(selectedFile);
    console.log(personName);
    console.log(course_id);

    const formData = new FormData();
    formData.append("file", selectedFile); // Assuming selectedFile contains the chosen file
    formData.append("course_id", course_id); // Send as form data, not a header
    formData.append("module_creators", personName); // Send instructors as JSON string
    console.log(formData.get("module_creators"));

    try {
      const response = await api.post("/api/upload/module/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Upload successful:", response.data);

      window.location.reload();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get("api/course/info/");
      console.log(response.data);
      localStorage.setItem("canUpload", response.data.canUpload);
      setDetails(response.data.details);
    } catch (error) {}
  };

  useEffect(() => {
    fetchUserData();
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
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  const theme = useTheme();
  function getStyles(name, personName, theme) {
    return {
      fontWeight: personName.includes(name)
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
    };
  }
  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              My Courses
            </h1>
          </header>

          {/* My courses Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card
              theme={cardTheme}
              clearTheme={{
                root: {
                  base: true,
                },
              }}
            >
              <h5 className="text-2xl font-bold tracking-tight text-blue-900">
                Total Courses Enrolled
              </h5>
              <p className="text-3xl font-bold text-blue-900">
                {details.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Academic Courses
              </p>
            </Card>
          </div>

          {/* Departments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {details.map((course, index) => (
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
                            {course.course_details.course_name}
                          </h1>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          {course.course_details.teaches.map(
                            (teacher, index) => (
                              <>
                                {teacher.instructor_id}
                                <span className="mx-2">•</span>
                              </>
                            ),
                          )}
                          <div className="mx-2"></div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            Modules {course.course_details.modules.length}
                            <span className="mx-2">•</span>
                            Quizes -
                          </div>
                        </div>
                        <div></div>
                      </div>
                    </Card>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Table hoverable theme={tableTheme} clearTheme={true}>
                      <TableHead>
                        <TableRow>
                          <TableHeadCell>ID</TableHeadCell>
                          <TableHeadCell>Module Name</TableHeadCell>
                          <TableHeadCell>Creators</TableHeadCell>
                          <TableHeadCell>Download</TableHeadCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {course.course_details.modules.map((module, index) => (
                          <TableRow className="bg-white" key={index}>
                            <TableCell className="font-extrabold text-gray-900">
                              {module.module_id}
                            </TableCell>
                            <TableCell className="text-cyan-900 font-bold">
                              {module.name}
                            </TableCell>
                            <TableCell className="text-black">
                              {module.creators.map((creator, index) => (
                                <>{creator.instructor_id}, </>
                              ))}
                            </TableCell>
                            <TableCell>
                              <Button
                                onClick={() => downloadFile(module.module_id)}
                              >
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionDetails>
                {localStorage.getItem("canUpload") === "true" && (
                  <AccordionActions>
                    <FormControl sx={{ m: 1, width: 300 }}>
                      <InputLabel id="demo-multiple-chip-label">
                        Creators
                      </InputLabel>
                      <Select
                        labelId="demo-multiple-chip-label"
                        id="demo-multiple-chip"
                        multiple
                        value={personName}
                        onChange={handleSelectChange}
                        input={
                          <OutlinedInput
                            id="select-multiple-chip"
                            label="Chip"
                          />
                        }
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                        MenuProps={MenuProps}
                      >
                        {course.course_details.teaches.map((teacher) => (
                          <MenuItem
                            key={teacher.instructor_id}
                            value={teacher.instructor_id}
                            style={getStyles(
                              teacher.instructor_id,
                              personName,
                              theme,
                            )}
                          >
                            {teacher.instructor_id}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Input type="file" onChange={handleFileChange} />
                    <Button
                      onClick={() => {
                        handleFileUpload(course.course_details.course_id);
                      }}
                    >
                      Upload
                    </Button>
                  </AccordionActions>
                )}
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default EnrolledCourse;
