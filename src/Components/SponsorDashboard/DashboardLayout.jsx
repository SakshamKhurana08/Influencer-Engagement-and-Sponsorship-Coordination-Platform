// Components/SponsorDashboard/DashboardLayout.jsx
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-64 p-6 w-full min-h-screen bg-gray-50">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
