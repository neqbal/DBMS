import React, { useEffect, useState } from 'react'
import { Table, TableRow, TableBody, TableCell, FileInput, TableHead, TableHeadCell } from 'flowbite-react'
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


  const downloadFile = async (moduleId) => {
    try {
      const response = await api.get(`/api/download/module/${moduleId}/`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${moduleId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("You do not have permission to download this file.");
    }
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

      window.location.reload() 
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
        console.log(response.data)
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
      value: `${instructor.user.first_name}+ " " + ${instructor.user.last_name}`,
      label: instructor.instructor_id
    }));
    console.log(options)
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
    <div className='container'>
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
        <div className="space-y-5 flex flex-col justify-center">
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
      <div className='available-module'>
        <div className='overflow-x-auto'>
          {course[2] ? (
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Module_id</TableHeadCell>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Creators</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
              <TableBody className="divide-y">
                {course[2].map((m, index) => (
                  <TableRow key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {m["module_id"]}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {m["name"]}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {course[3] ? (
                        course[3].map((ins, index) =>
                          ins["module_id"] === m["module_id"] ? (
                            <span key={index}>{ins["instructor_id"] + ", "}</span>
                          ) : null
                        )
                      ) : (
                       <p>No Instructor</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => downloadFile(m["module_id"])} className="btn-download">
                        Download
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ):(
            <p>Loading</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default IndividualCourse;
