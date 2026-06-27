import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './influencer.css';
import { useNavigate } from 'react-router-dom';

const InfluencerDashboard = () => {
    const [profile, setProfile] = useState({});
    const [user, setUser] = useState({});
    const [adRequests, setAdRequests] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [filters, setFilters] = useState({ category: '', minBudget: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchProfile();
                await fetchAdRequests();
                await fetchCampaigns();
                setLoading(false);
            } catch (err) {
                setError("Error fetching data. Please try again.");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('http://localhost:2020/api/influencer/profile', {
                headers: {
                    Authorization: `Bearer ${token}`, // Correctly include the JWT token
                },
            });
            setProfile(res.data.influencer); // The backend should return the influencer profile data
            setUser(res.data.user);
        } catch (err) {
            setError('Failed to fetch profile. Please try again.');
            console.error("Error fetching profile:", err);
            // Optionally handle different error statuses (e.g., 401 for unauthorized)
            if (err.response && err.response.status === 401) {
                setMessage('Your session has expired. Please log in again.');
                // Optionally redirect to the login page
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAdRequests = async () => {
        try {
            const res = await axios.get('http://localhost:2020/api/influencer/ad-requests', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // ✅ Make sure token is stored
                }
            });
            const data = res.data;
            if (Array.isArray(data)) {
                setAdRequests(data);
            } else if (Array.isArray(data.adRequests)) {
                setAdRequests(data.adRequests);
            } else {
                console.error("Unexpected response for ad requests:", data);
                setAdRequests([]);
            }
        } catch (err) {
            //setError('Failed to fetch ad requests. Please try again.');
            console.error("Error fetching ad requests:", err);
        }
    };

    const fetchCampaigns = async () => {
        try {
            setCampaigns("");
            // Prepare the params object conditionally
            const params = {};

            // Add filters if they are present
            if (filters.category) {
                params.category = filters.category;
            }
            if (filters.minBudget) {
                params.minBudget = filters.minBudget;
            }

            // Get the token (assuming you're storing it in localStorage or sessionStorage)
            const token = localStorage.getItem('token');  // Change this according to your implementation

            // If there's no token, handle the error or redirect to login page
            if (!token) {
                console.error('No token found, user is not authenticated');
                return;
            }

            // Adjust the URL to the route that fetches open campaigns
            const response = await axios.get('http://localhost:2020/api/influencer/open-campaigns', {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
                params,
            });
            setCampaigns(response.data);  // Update the state with the filtered campaigns
        } catch (err) {
            console.error('Error fetching campaigns:', err);
        }
    };

    const handleProfileSave = async () => {
        if (!user.name || !profile.category || !profile.niche || !profile.reach) {
            setError('All fields are required!');
            return;
        }

        setError('');
        setSuccessMessage('');
        try {
            const token = localStorage.getItem("token"); // Or sessionStorage.getItem("token") if that’s what you’re using

            await axios.put(
                'http://localhost:2020/api/influencer/profile',
                {
                    name: user.name,
                    category: profile.category,
                    niche: profile.niche,
                    reach: profile.reach,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage('Profile updated successfully!');
            setEditMode(false);
        } catch (err) {
            console.error("Error saving profile:", err);
            setError('Failed to save profile. Please try again.');
        }
    };

    const handleAdAction = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token is missing. Please log in again.');
                return;
            }
    
            const response = await axios.post(
                `http://localhost:2020/api/influencer/ad-requests/${id}/${action}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
    
            console.log(response.data.message); // optional: success log
            fetchAdRequests(); // refresh data
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Error handling ad request.';
            setError(errorMsg);
            console.error("Error handling ad request:", err);
        }
    };

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAcceptCampaign = async (campaignId) => {
        try {
            const token = localStorage.getItem('token'); // Or sessionStorage, depending on where you store it

            const response = await axios.post(
                `http://localhost:2020/api/influencer/campaigns/${campaignId}/accept`,
                {}, // No body needed
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.message === 'Campaign accepted') {
                fetchCampaigns(); // Refresh campaigns
            }
        } catch (err) {
            setError('Error accepting campaign. Please try again.');
            console.error("Error accepting campaign:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <div className="text-center py-20 text-lg font-semibold">Loading...</div>;

    const fullPath = profile.profileImageUrl;
    const pathParts = fullPath.split('\\');
    const fileName = pathParts[pathParts.length - 1];
    const last35Chars = fileName.slice(-35);

    return (
        <div className="h-screen overflow-y-auto bg-gradient-to-tr from-indigo-100 via-purple-100 to-blue-100 text-gray-800">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    {/* Profile Image */}
                    <img
                        src={`http://localhost:2020/uploads/influencer_photos/${last35Chars}`}
                        alt="Profile"
                        className="w-20 h-20 object-fill rounded-full border border-gray-300 shadow"
                    />
                    <span className="font-bold text-lg text-indigo-700">{user.name}</span>
                </div>
                <div className="flex gap-6 items-center">
                    
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="rounded-xl p-8 border border-gray-200">
    <h2 className="text-xl font-bold mb-4 text-indigo-800">🙍‍♂️ Your Profile</h2>
    {editMode ? (
        <div className="space-y-4">
            <input
                type="text"
                className="border border-gray-300 rounded-md p-3 w-full"
                value={user.name || ''}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Name"
            />
            <input
                type="text"
                className="border border-gray-300 rounded-md p-3 w-full"
                value={profile.category || ''}
                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                placeholder="Category"
            />
            <input
                type="text"
                className="border border-gray-300 rounded-md p-3 w-full"
                value={profile.niche || ''}
                onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
                placeholder="Niche"
            />
            <input
                type="number"
                className="border border-gray-300 rounded-md p-3 w-full"
                value={profile.reach || ''}
                onChange={(e) => setProfile({ ...profile, reach: e.target.value })}
                placeholder="Reach"
            />
            <button
                onClick={handleProfileSave}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
                Save
            </button>
        </div>
    ) : (
        <div className="space-y-2">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Category:</strong> {profile.category}</p>
            <p><strong>Niche:</strong> {profile.niche}</p>
            <p><strong>Reach:</strong> {profile.reach}</p>
            <button
                onClick={() => setEditMode(true)}
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
                Edit
            </button>
        </div>
    )}
</div>

            {/* Content */}
            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ad Requests */}
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-indigo-800">📩 Ad Requests</h2>
                    {adRequests.length === 0 ? (
                        <p className="text-gray-500 italic">No ad requests at the moment.</p>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
                            {adRequests.map((req) => (
                                <div key={req.id} className="bg-gray-50 p-4 rounded-md border flex justify-between items-center">
                                    <div>
                                    <p><strong>Brand:</strong> {req.Campaign.Sponsor.companyName}</p>
                                <p><strong>Details:</strong> {req.message}</p>
                                <p><strong>Status:</strong> {req.status}</p> {/* Display current status */}
                                    </div>
                                    <div className="flex gap-2">
                                    {req.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleAdAction(req.id, 'accept')} className="bg-green-500 text-white px-3 py-1 rounded">Accept</button>
                                            <button onClick={() => handleAdAction(req.id, 'reject')} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
                                        </>
                                    )}
                                    {req.status !== 'pending' && (
                                        <p className="text-gray-500">This request has been {req.status}.</p>
                                    )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Open Campaigns */}
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-indigo-800">📢 Open Campaigns</h2>
                    {campaigns.length === 0 ? (
                        <p className="text-gray-500 italic">No campaigns currently available.</p>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
                            {campaigns.map((camp) => (
                                <div key={camp._id} className="bg-gray-50 p-4 rounded-md border flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">Campaign: {camp.title}</p>
                                        <p className="text-sm text-gray-600">Category: {camp.category}</p>
                                        <p className="text-sm text-gray-600">Budget: ₹{camp.budget}</p>
                                    </div>
                                    {camp.isAcceptedByUser ? (
                                        <p className="mt-2 text-green-600 font-semibold">
                                            You have accepted this campaign.
                                        </p>
                                    ) : (
                                        <button
                                            onClick={() => handleAcceptCampaign(camp.id)}
                                            className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                                        >
                                            Accept Campaign
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfluencerDashboard;
