import React from 'react'
import { useState, useEffect } from 'react';
import { Card } from 'flowbite-react';

import api from '../api';
import "../styles/Card.css"
import placeholderImage from '../../../static/images/Placeholder/totoro.jpeg'

function Course() {
  const [courses, setCourses] = useState([]);

  const fetchUserData = async () => {
    const department_id = localStorage.getItem("department_id")
    try {
      const response = await api.get("/api/user/department/course/", {
        params: {
          department_id,
        }
      });
      console.log(response.data)
      setCourses(response.data); 
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  
  return (
    <div className="card-container">
      <div className='grid grid-cols-3 gap-4'>
        {courses.map((course, index) => (
          <Card 
            href="#"
            className="max-w-sm"
            imgAlt="Meaningful alt text for an image that is not purely decorative"
            imgSrc={placeholderImage}
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
