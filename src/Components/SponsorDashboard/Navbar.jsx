import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";

const Navbar = () => {
    const [sponsorName, setSponsorName] = useState("");
    
    useEffect(() => {
        const fetchSponsorDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    return;
                }

                const response = await axios.get('http://localhost:2020/api/sponsors/details', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setSponsorName(response.data.companyName); // assuming companyName is the sponsor's name
            } catch (error) {
                console.error('Error fetching sponsor details:', error);
            }
        };

        fetchSponsorDetails();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token"); // Clear token from localStorage
        window.location.href = "/login";  // Redirect to the login page
    };

    return (
        <header className="w-[75%] py-9 px-6 text-indigo-600 fixed top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold">{sponsorName || "Sponsor Panel"}</span>
                </div>

                <div className="flex items-center space-x-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1 hover:text-indigo-700 transition"
                    >
                        <FaSignOutAlt size={20} /> <span>Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
