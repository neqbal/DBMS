import React, { useEffect, useState } from 'react'
import { Card } from 'flowbite-react'
import api from '../api'
import placeholderImage from '../../../static/images/Placeholder/totoro.jpeg'
import { useNavigate } from 'react-router-dom'
import "../styles/Card.css"


function Departments() {
  const [departments, setDepartments] = useState([])
  const navigate = useNavigate()

  const fetchUserData = async () => {
    try {
      const response = await api.get("/api/user/departments/")
      console.log("Inside departments")
      console.log(response.data)
      setDepartments(response.data); 
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  return (
    <div className="card-container">
      <div className='grid grid-cols-3 gap-4'>
        {departments.map((department, index) => (
          <Card 
            className="max-w-sm"
            imgAlt="Meaningful alt text for an image that is not purely decorative"
            imgSrc={placeholderImage}
            onClick={() => navigate(`/course?department_id=${department["department_id"]}`)}
            key={index}
          >
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {department["department_id"] + ": " + department["department_name"]}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              {department["department_desc"]}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Departments
