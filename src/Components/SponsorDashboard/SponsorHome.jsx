import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from "./Navbar";
const SponsorHome = () => {
    const [sponsorDetails, setSponsorDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSponsorDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found. Please log in again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:2020/api/sponsors/details', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setSponsorDetails(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching sponsor details. Please try again.');
                setLoading(false);
            }
        };

        fetchSponsorDetails();
    }, []);


    if (loading) {
        return (
            <div className={`h-screen flex items-center justify-center text-white`}>
                <p className="text-lg font-medium">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`h-screen flex items-center justify-center`}>
                <div className="bg-white p-6 rounded-xl shadow-lg text-red-600 font-semibold">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen text-gray-100`}>
            <Navbar />
            <div className="max-w-3xl mx-20 my-30 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-indigo-600">
                <h2 className="text-4xl font-extrabold mb-8 text-rose-600 drop-shadow-lg text-center">Sponsor Dashboard</h2>

                {sponsorDetails ? (
                    <div className="bg-white bg-opacity-90 rounded-xl p-6 text-gray-800 shadow-md">
                        <h3 className="text-2xl font-semibold mb-4 text-indigo-800">Your Account Details</h3>
                        <div className="mb-2">
                            <strong>Company Name:</strong> {sponsorDetails.companyName}
                        </div>
                        <div className="mb-2">
                            <strong>Industry:</strong> {sponsorDetails.industry}
                        </div>
                        <div className="mb-2">
                            <strong>Budget:</strong> ${sponsorDetails.budget}
                        </div>
                    </div>
                ) : (
                    <div className="text-white">No sponsor details found.</div>
                )}
            </div>
        </div>
    );
};

export default SponsorHome;
