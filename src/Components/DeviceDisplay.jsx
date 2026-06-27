import { useState, useEffect } from "react";
import HomePage from "./HomePage";
import Card from "./Card";
import Navbar from "./Navbar";

const DevicesDisplay = () => {
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsHovered(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full min-h-screen overflow-x-hidden">

            <div className="relative z-10 w-full">
                {/* Navbar */}
                <Navbar />

                {/* Top Heading */}
                <div className="new-font text-center text-5xl font-semibold leading-snug mt-25 mb-4 text-rose-700 tracking-wide font-poppins">
                    Connecting Brands with Influencers,<br />
                    Empowering Seamless Campaigns.
                </div>


                {/* Devices Section */}
                <div className="relative flex justify-center items-end mt-16 mb-24">
                    <div
                        className={`relative w-[480px] h-[300px] bg-gray-800 rounded-lg shadow-lg transition-all duration-1000 ease-in-out ${isHovered ? "scale-105" : "scale-50"
                            }`}
                    >
                        <img
                            src="/assets/laptop.png"
                            alt="Laptop Screen"
                            className="w-full h-full object-cover rounded-lg"
                        />

                        {/* Phone Overlay (left) */}
                        <div
                            className={`absolute -bottom-20 -left-28 w-[160px] h-[280px] bg-black rounded-[40px] border-4 border-gray-300 shadow-2xl flex items-center justify-center transition-all duration-1000 ease-in-out ${isHovered ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <img
                                src="/assets/image.png"
                                alt="Phone Screen"
                                className="w-full h-full object-fill rounded-[40px]"
                            />
                        </div>

                        {/* Tab Overlay (right) */}
                        <div
                            className={`absolute -bottom-20 -right-35 w-[320px] h-[260px] bg-white rounded-[30px] shadow-2xl border-4 border-gray-300 flex items-center justify-center transition-all duration-1000 ease-in-out ${isHovered ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <img
                                src="/assets/tab.png"
                                alt="Tab Screen"
                                className="w-full h-full object-fill rounded-[30px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Cards Section */}
                <div className="px-4">
                    <Card />
                </div>
            </div>
        </div>
    );
};

export default DevicesDisplay;
