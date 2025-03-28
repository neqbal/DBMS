import React from 'react'
import { useState, useEffect } from 'react';
import { Card } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import "../styles/Card.css"
import placeholderImage from '../../../static/images/Placeholder/totoro.jpeg'
import { useLocation } from 'react-router-dom';

function Course() {
  const [courses, setCourses] = useState([]);
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const department_id = queryParams.get("department_id")
  const navigate = useNavigate()

  const fetchUserData = async () => {
    try {
      let response;
      if (department_id) {
        response = await api.get("api/user/department/course/", {
          params: {
            department_id
          }
        })
      } else {
        response = await api.get("api/user/involvedCourses/")
      }
      console.log(response.data)
      setCourses(response.data); 
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [location.search]);

  
  return (
    <div className="card-container">
      <div className='grid grid-cols-3 gap-4'>
        {courses.map((course, index) => (
          <Card 
            onClick={() => {navigate(`/individualCourse?course_id=${course["course_id"]}`)}}
            className="max-w-sm"
            imgAlt="Meaningful alt text for an image that is not purely decorative"
            imgSrc={placeholderImage}
            key={index}
          >
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {course["course_id"] + ": " + course["course_name"]}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              {course["course_desc"]}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Course
