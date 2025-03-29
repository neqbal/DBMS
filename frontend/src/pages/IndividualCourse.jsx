import React, { useEffect, useState } from 'react'
import { Table, TableRow, TableBody, TableCell, FileInput } from 'flowbite-react'
import { Button } from 'flowbite-react';
import Select, { NonceProvider } from 'react-select'
import makeAnimated from 'react-select/animated';
import api from '../api'
import { useLocation } from 'react-router-dom'
import placeholderImage from '../../../static/images/Placeholder/totoro.jpeg'
import '../styles/IndividualCourse.css'

function IndividualCourse() {
  const [course, setCourse] = useState([])
  const [selectedOption, setSelectedOptions] = useState([])
  const [selectedFile, setSelectedFile] = useState(null);
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const course_id = queryParams.get("course_id")
  const animatedComponents = makeAnimated()

  const handleChange = (options) => {
    setSelectedOptions(options)
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

const handleUpload = async () => {
  if (!selectedFile) {
    console.error("No file selected");
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile); // Assuming selectedFile contains the chosen file
  formData.append('course_id', course_id); // Send as form data, not a header
  formData.append('module_creators', JSON.stringify(selectedOption)); // Send instructors as JSON string

  try {
    const response = await api.post('/api/upload/module/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    console.log('Upload successful:', response.data);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

  const fetchCourseData = async () => {
    try {
      if(course_id) {
        const response = await api.get("/api/user/course/", {
          params: {
            course_id
          }
        })
        setCourse(response.data)
      }
    } catch(error) {
      console.log("Error fetching course data: ", error) 
    }
  }
  
  useEffect(() => {
    fetchCourseData()
  }, [])

  let options = []
  if(course[1]) {
    options = course[1].map(instructor => ({
      value: `${instructor.user.first_name} ${instructor.user.last_name}`,
      label: instructor.instructor_id
    }));
  }

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#112561",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#112561",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#0e4227" : "#112531",
      color: "white",
    }),
  };

  return (
    <>
      <div className="course-info flex flex-col md:flex-row items-center justify-between p-4">
        {course[0] ? (
          <>
            <div className="flex flex-col space-y-4 md:space-y-4">
              <div className="course-id text-2xl transition transform duration-200 hover:scale-105">
                {course[0]["course_id"]}
              </div>
              <div className="course-name transition transform duration-200 hover:scale-105">
                {course[0]["course_name"]}
              </div>
              <div className="course-description w-150 transition transform duration-200 hover:scale-105">
                {course[0]["course_desc"]}
              </div>
              <div className="course-start-date-time transition transform duration-200 hover:scale-105">
                Start Date &amp; Time
              </div>
              <div className="course-end-date-time transition transform duration-200 hover:scale-105">
                End Date &amp; Time
              </div>
            </div>
            <div className="course-image mt-4 md:mt-0 transition transform duration-200 hover:scale-105">
              <img
                src={placeholderImage}
                alt="Course"
                className="w-100 h-100 object-cover rounded-lg shadow-md"
              />
            </div>
          </>
        ) : (
          <p>Loading course data</p>
        )}
      </div>
      <div className="instructors">
        {course[1] ? (
          <div className="overflow-x-auto">
            <Table>
              <TableBody className="divide-y">
                {course[1].map((instructor, index) => (
                  <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800" key={index}>
                    <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {instructor.user["first_name"] + " " + instructor.user["last_name"]}
                    </TableCell>
                    <TableCell>{instructor["instructor_id"]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p>Loading instructors</p>
        )}
      </div>
      <div className="upload-module">
        <div className="space-y-5">
          <div>
            {course[0] && course[0]["department_id"] === localStorage.getItem("department_id") ? (
              <>
                <FileInput id="default-file-upload" onChange={handleFileChange} />
                <Select
                  closeMenuOnSelect={false}
                  components={animatedComponents}   
                  isMulti
                  options={options}
                  onChange={handleChange}
                  styles={customStyles}
                />
                <Button onClick={handleUpload} className="upload-button" color="alternative">
                  Upload File
                </Button>
              </>
            ) : (
              <p>Cannot upload file</p>
            ) }
          </div>
        </div>
      </div>
    </>
  )
}

export default IndividualCourse;
