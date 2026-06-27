// src/components/SignUpLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Lottie from 'lottie-react';
import signupAnimation from '../signup-animation.json'; // Adjust path as needed
import './check.css';

const SignUpLayout = () => {
    return (
        <div className="flex w-full min-h-screen">

            {/* Left Column with Heading and Animation */}
            <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 flex-col justify-center items-center text-center text-white">
                <h1 className="text-4xl font-bold mb-8 leading-tight drop-shadow-lg">
                    Sign up to get started
                </h1>
                <Lottie
                    animationData={signupAnimation}
                    loop={true}
                    className="w-80 h-80"
                />
            </div>

            {/* Right Column with Routed Form Content */}
            <div className="w-full lg:w-2/3 flex justify-center p-6 md:p-12 py-12 bg-cloud-background overflow-y-auto">
                <div className="w-full max-w-lg">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SignUpLayout;
