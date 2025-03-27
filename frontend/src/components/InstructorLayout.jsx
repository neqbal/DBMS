import { Outlet } from "react-router-dom";
import Instructor from "../pages/Instructor";

function InstructorLayout() {
  return (
    <div>
      <Instructor />
      <div className="p-1">
        <Outlet /> {/* This will render the current route's component below the navbar */}
      </div>
    </div>
  );
}

export default InstructorLayout;
