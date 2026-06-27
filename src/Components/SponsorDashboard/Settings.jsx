import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get('http://localhost:2020/api/sponsors/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setProfile(res.data.sponsor);
                setUser(res.data.user);
                setFormData({
                    name: res.data.user.name,
                    companyName: res.data.sponsor.companyName,
                    industry: res.data.sponsor.industry,
                    budget: res.data.sponsor.budget,
                });
            } catch (err) {
                setError('Failed to fetch profile. Please try again.');
                if (err.response?.status === 401) {
                    setMessage('Your session has expired. Please log in again.');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            return;
        }

        try {
            const res = await axios.put('http://localhost:2020/api/sponsors/profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage('Profile updated successfully!');
            setUser(res.data.user);
            setProfile(res.data.sponsor);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        }
    };

    if (loading) return <div className="text-center mt-10 text-gray-500">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div className="page-container min-h-screen flex flex-col p-6 overflow-y-auto text-gray-800">
            <div className="w-full max-w-3xl mx-15 bg-white bg-opacity-90 rounded-2xl shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>

                {message && <div className="text-green-600 mb-4">{message}</div>}
                {error && <div className="text-red-600 mb-4">{error}</div>}

                {user && profile ? (
                    isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-medium mb-1" htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1" htmlFor="companyName">Company Name</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1" htmlFor="industry">Industry</label>
                                <input
                                    type="text"
                                    id="industry"
                                    name="industry"
                                    value={formData.industry || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1" htmlFor="budget">Budget</label>
                                <input
                                    type="text"
                                    id="budget"
                                    name="budget"
                                    value={formData.budget || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>

                            <div className="flex justify-between mt-6">
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Update Profile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Company Name:</strong> {profile.companyName}</p>
                            <p><strong>Industry:</strong> {profile.industry}</p>
                            <p><strong>Budget:</strong> {profile.budget}</p>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                                Edit Profile
                            </button>
                        </div>
                    )
                ) : (
                    <p>No profile data available.</p>
                )}
            </div>
        </div>
    );
};

export default Settings;
