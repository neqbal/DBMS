import React, { useEffect, useState } from 'react'
import api from '../api'
import { useLocation } from 'react-router-dom'

import placeholderImage from '../../../static/images/Placeholder/totoro.jpeg'
import '../styles/IndividualCourse.css'

function IndividualCourse() {
  const [course, setCourse] = useState([])
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const course_id = queryParams.get("course_id")

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
        ): (
          <p>Loading course data</p>
        )}
      </div>
      <div className="instructors">
      </div>
      <div className="modules">
      </div>
    </>
  )
}

export default IndividualCourse
