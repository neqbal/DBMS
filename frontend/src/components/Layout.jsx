import { Outlet } from "react-router-dom";
import NavigationBar from "./NavigationBar";


function Layout() {
  return (
    <div>
      <NavigationBar />
      <div className="p-1">
        <Outlet /> {/* This will render the current route's component below the navbar */}
      </div>
    </div>
  );
}

export default Layout;
