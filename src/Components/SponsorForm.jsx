/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import axios from "axios";

const SponsorForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("sponsor");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false); // To track message type

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      email,
      password,
      role,
      company,
      industry,
      budget,
    };

    try {
      const response = await axios.post(
        "http://localhost:2020/api/auth/register",
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Registration successful:", response.data);
      setMessage("Registration successful! Welcome aboard.");
      setIsError(false);
    } catch (error) {
      console.error("Error registering sponsor:", error.response?.data || error.message);
      setMessage("Error registering sponsor. Please try again.");
      setIsError(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
        Sponsor Registration
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block font-semibold mb-2 text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block font-semibold mb-2 text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block font-semibold mb-2 text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Company */}
        <div className="mb-4">
          <label htmlFor="company" className="block font-semibold mb-2 text-gray-700">Company</label>
          <input
            type="text"
            id="company"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>

        {/* Industry */}
        <div className="mb-4">
          <label htmlFor="industry" className="block font-semibold mb-2 text-gray-700">Industry</label>
          <input
            type="text"
            id="industry"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            required
          />
        </div>

        {/* Budget */}
        <div className="mb-6">
          <label htmlFor="budget" className="block font-semibold mb-2 text-gray-700">Budget</label>
          <input
            type="number"
            id="budget"
            min="0"
            max="1000000000"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
        >
          Register
        </button>
      </form>

      {/* Feedback Message */}
      {message && (
        <p
          className={`mt-5 p-3 rounded-md text-center text-sm font-medium ${isError
            ? "bg-red-100 text-red-700 border border-red-300"
            : "bg-green-100 text-green-700 border border-green-300"
            }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default SponsorForm;
