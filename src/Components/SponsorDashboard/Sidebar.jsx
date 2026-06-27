import { NavLink } from "react-router-dom";
import { FaHome, FaBullhorn, FaEnvelope, FaCog } from "react-icons/fa";

const Sidebar = () => {
    const gradientBackground = "bg-gradient-to-br from-blue-600 via-teal-500 to-green-500";

    return (
        <div className={`w-64 h-screen bg-white bg-opacity-90 rounded-xl shadow-lg p-5 fixed z-10`}>
            <h2 className="text-xl font-bold mb-6 text-center text-black">Sponsor Panel</h2>
            <nav className="flex flex-col space-y-4">
                <NavLink to="/sponsor-dashboard/home" className="flex items-center space-x-2 hover:text-indigo-600 transition">
                    <FaHome /> <span>Home</span>
                </NavLink>
                <NavLink to="/sponsor-dashboard/campaign" className="flex items-center space-x-2 hover:text-indigo-600 transition">
                    <FaBullhorn /> <span>Campaigns</span>
                </NavLink>
                <NavLink to="/sponsor-dashboard/settings" className="flex items-center space-x-2 hover:text-indigo-600 transition">
                    <FaCog /> <span>Settings</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
