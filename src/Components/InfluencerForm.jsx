/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import axios from "axios";

const InfluencerForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [category, setCategory] = useState("");
    const [niche, setNiche] = useState("");
    const [reach, setReach] = useState("");
    const [role, setRole] = useState("influencer"); // Default role as 'influencer'
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const maxReach = 1000000000;

        if (!Number.isInteger(Number(reach)) || Number(reach) < 0 || Number(reach) > maxReach) {
            setMessage(`Reach must be a number between 0 and ${maxReach.toLocaleString()}`);
            return;
        }

        const data = {
            name,
            email,
            password,
            role,
            category,
            niche,
            reach,
        };

        try {
            const response = await axios.post(
                "http://localhost:2020/api/auth/register",
                data,
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("Registration successful:", response.data);
            setMessage("Registration successful! Welcome aboard as an Influencer.");
        } catch (error) {
            console.error("Error registering influencer:", error.response?.data || error.message);
            setMessage("Error registering influencer. Please try again.");
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Influencer Registration</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block font-semibold mb-1">Name</label>
                    <input
                        type="text"
                        id="name"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block font-semibold mb-1">Email</label>
                    <input
                        type="email"
                        id="email"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block font-semibold mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="category" className="block font-semibold mb-1">Category</label>
                    <input
                        type="text"
                        id="category"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="niche" className="block font-semibold mb-1">Niche</label>
                    <input
                        type="text"
                        id="niche"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="reach" className="block font-semibold mb-1">Reach</label>
                    <input
                        type="number"
                        id="reach"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={reach}
                        onChange={(e) => setReach(e.target.value)}
                        required
                        min="0"
                        max="1000000000"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-200"
                >
                    Register
                </button>
            </form>

            {message && (
                <p
                    className={`mt-4 text-center p-3 rounded-md text-sm font-medium ${message.toLowerCase().includes("success")
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {message}
                </p>
            )}
        </div>
    );
};

export default InfluencerForm;
