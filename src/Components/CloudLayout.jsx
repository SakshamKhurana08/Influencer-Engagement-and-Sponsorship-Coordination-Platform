import React from "react";
import "../Components/clouds.css";

const CloudLayout = ({ children }) => {
    return (
        <div className="relative w-screen min-h-screen overflow-x-hidden">
            {/* Background Clouds */}
            <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
                <div className="clouds-container">
                    <div className="cloud cloud-1"></div>
                    <div className="cloud cloud-2"></div>
                    <div className="cloud cloud-3"></div>
                    <div className="cloud cloud-4"></div>
                    <div className="cloud cloud-5"></div>
                </div>
            </div>

            {/* Scrollable Content on Top */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default CloudLayout;