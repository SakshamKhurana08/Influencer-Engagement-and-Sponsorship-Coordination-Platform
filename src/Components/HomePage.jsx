// HomePage.jsx
import React from "react";
const HomePage = ({ children }) => {
    return (
        <div className="relative w-screen h-screen overflow-x-hidden">
            {/* Main content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default HomePage;
