import React from "react";
import { Link } from "react-router-dom";
import Lottie from "react-lottie";
import successAnimationData from "../../success-animation.json"; // Adjust the path accordingly

const SignupSuccess = () => {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: successAnimationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-8">
            <div className="w-full max-w-4xl flex items-center justify-between p-8 rounded-xl shadow-lg bg-white bg-opacity-90">
                {/* Lottie Animation - Left Half */}
                <div className="w-1/2 flex justify-center">
                    <Lottie options={defaultOptions} height={400} width={400} />
                </div>

                {/* Success Message and Buttons - Right Half */}
                <div className="w-1/2 text-center">
                    <h1 className="text-4xl font-bold text-green-600 mb-6">Signup Successful🎉</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Welcome to the platform! You can now log in or go back to the homepage.
                    </p>
                    <div className="flex justify-center space-x-6">
                        <Link
                            to="/"
                            className="px-8 py-3 text-sm font-medium rounded-lg  bg-indigo-600 text-white shadow-md  hover:bg-indigo-700 transition duration-200"
                        >
                            Go to Home
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-3 text-sm font-medium rounded-lg bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition duration-200"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupSuccess;
