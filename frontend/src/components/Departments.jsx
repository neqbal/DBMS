import React from 'react'
import { useLocation } from 'react-router-dom'
import AllDepartments from '../pages/AllDepartments'
import DepartmentInfo from '../pages/DepartmentInfo'

function Departments() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const department_id = queryParams.get("department_id")

  if (department_id) {
    return (
      <DepartmentInfo department_id={department_id} />
    )
  } else {
    return (
      <AllDepartments />
    )
  }
}

export default Departments
