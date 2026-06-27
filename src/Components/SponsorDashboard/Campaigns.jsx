import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState(null);
    const [campaignAds, setCampaignAds] = useState({});
    const [newCampaign, setNewCampaign] = useState({
        title: '',
        description: '',
        category: '',
        budget: '',
        isPublic: false,
    });
    const [newAdRequest, setNewAdRequest] = useState({
        message: '',
        proposedTerms: '',
    });
    const [error, setError] = useState('');
    const [selectedAdRequestId, setSelectedAdRequestId] = useState(null);
    const [isEditingCampaign, setIsEditingCampaign] = useState(false);
    const [isEditingAdRequest, setIsEditingAdRequest] = useState(false);

    // Fetch all campaigns from the backend
    const fetchCampaigns = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:2020/api/campaign/my-campaigns', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCampaigns(res.data || []);
            setError('');
        } catch (err) {
            setCampaigns([]);
            setError('No campaigns found.');
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    // Fetch ads for a specific campaign
    const fetchAdsForCampaign = async (campaignId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:2020/api/campaign/campaign/${campaignId}/ad-requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCampaignAds((prevState) => ({
                ...prevState,
                [campaignId]: res.data || [], // Store ads for this campaign
            }));
        } catch (err) {
            setError('Failed to fetch ads for this campaign');
        }
    };

    // Handle submission for creating or editing campaigns
    const handleCampaignSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = isEditingCampaign
                ? await axios.put(`http://localhost:2020/api/campaign/${newCampaign.id}`, newCampaign, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                : await axios.post('http://localhost:2020/api/campaign', newCampaign, {
                    headers: { Authorization: `Bearer ${token}` },
                });

            if (res.status === 200 || res.status === 201) {
                setNewCampaign({
                    title: '',
                    description: '',
                    category: '',
                    budget: '',
                    isPublic: false,
                });
                setIsEditingCampaign(false); // Reset editing state
                fetchCampaigns(); // Refresh campaign list
            }
        } catch (err) {
            setError('Failed to create/update campaign');
        }
    };

    // Handle submission for creating or editing ad requests
    const handleAdRequestSubmit = async (e, campaignId) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = isEditingAdRequest
                ? await axios.put(`http://localhost:2020/api/campaign/ad-request/${selectedAdRequestId}`, newAdRequest, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                : await axios.post(`http://localhost:2020/api/campaign/campaign/${campaignId}/ad-request`, newAdRequest, {
                    headers: { Authorization: `Bearer ${token}` },
                });

            if (res.status === 200 || res.status === 201) {
                setNewAdRequest({
                    message: '',
                    proposedTerms: '',
                });
                setIsEditingAdRequest(false); // Reset editing state for ad request
                fetchAdsForCampaign(campaignId); // Refresh ads for the campaign
            }
        } catch (err) {
            setError('Failed to create/update ad request');
        }
    };

    // Handle deleting campaigns
    const handleDeleteCampaign = async (campaignId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:2020/api/campaign/${campaignId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchCampaigns(); // Refresh campaign list
        } catch (err) {
            setError('Failed to delete campaign');
        }
    };

    // Handle deleting ad requests
    const handleDeleteAdRequest = async (adRequestId, campaignId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:2020/api/campaign/ad-request/${adRequestId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchAdsForCampaign(campaignId); // Refresh ads for the campaign
        } catch (err) {
            setError('Failed to delete ad request');
        }
    };

    // Set the selected campaign for editing
    const handleEditCampaign = (campaign) => {
        setNewCampaign(campaign);
        setIsEditingCampaign(true);
    };

    // Set the selected ad request for editing
    const handleEditAdRequest = (adRequest) => {
        setNewAdRequest(adRequest);
        setSelectedAdRequestId(adRequest.id);
        setIsEditingAdRequest(true);
    };

    return (
        <div className="p-6 space-y-6 h-screen overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 ml-[22%]">Manage Your Campaigns</h2>

            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Campaign Form */}
            <div className="max-w-lg mx-[15%] p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">{isEditingCampaign ? 'Edit Campaign' : 'Create Campaign'}</h3>
                <form onSubmit={handleCampaignSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Title</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Campaign Title"
                            value={newCampaign.title}
                            onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Description</label>
                        <textarea
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Campaign Description"
                            value={newCampaign.description}
                            onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Category</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Campaign Category"
                            value={newCampaign.category}
                            onChange={(e) => setNewCampaign({ ...newCampaign, category: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Budget</label>
                        <input
                            type="number"
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Campaign Budget"
                            value={newCampaign.budget}
                            onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                        />
                    </div>
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            checked={newCampaign.isPublic}
                            onChange={(e) => setNewCampaign({ ...newCampaign, isPublic: e.target.checked })}
                            className="mr-2"
                        />
                        <label className="text-gray-700">Public Campaign</label>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 transition duration-300"
                    >
                        {isEditingCampaign ? 'Update Campaign' : 'Create Campaign'}
                    </button>
                </form>
            </div>

            {/* Display all campaigns */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.length === 0 ? (
                    <p className="text-gray-600">No campaigns found.</p>
                ) : (
                    campaigns.map((campaign) => (
                        <div
                            key={campaign.id}
                            className="border p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
                            onClick={() => {
                                setSelectedCampaignId(campaign.id);
                                fetchAdsForCampaign(campaign.id);
                            }}
                        >
                            <h3 className="text-lg font-semibold text-gray-800">{campaign.title}</h3>
                            <p className="text-gray-600">{campaign.description}</p>
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-sm text-indigo-600">{campaign.category}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCampaign(campaign);
                                    }}
                                    className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCampaign(campaign.id);
                                    }}
                                    className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
                                >
                                    Delete
                                </button>

                                {campaign.acceptedInfluencers && campaign.acceptedInfluencers.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-semibold">Accepted Influencers:</h4>
                                            <ul className="list-disc list-inside">
                                                {campaign.acceptedInfluencers.map((influencer) => (
                                                    <li key={influencer.influencerId}>{influencer.influencerName}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Show Ads for the selected campaign */}
            {selectedCampaignId && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Ad Requests for Campaign</h3>
                    <div className="flex flex-col space-y-4 w-[75%]">
                        {campaignAds[selectedCampaignId] && campaignAds[selectedCampaignId].length > 0 ? (
                            campaignAds[selectedCampaignId].map((adRequest) => (
                                <div
                                    key={adRequest.id}
                                    className="border p-4 rounded-lg shadow-md"
                                >
                                    <p><strong>Message: </strong>{adRequest.message}</p>
                                    <p><strong>Proposed Terms: </strong>{adRequest.proposedTerms}</p>
                                    <div className="mt-2 flex justify-between">
                                        <button
                                            onClick={() => handleEditAdRequest(adRequest)}
                                            className="bg-indigo-600 p-2 text-white rounded-md hover:bg-indigo-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAdRequest(adRequest.id, selectedCampaignId)}
                                            className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No ad requests found for this campaign.</p>
                        )}

                        {/* Ad Request Form */}
                        <div className="max-w-lg mx-[15%] p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">{isEditingAdRequest ? 'Edit Ad Request' : 'Create Ad Request'}</h3>
                            <form onSubmit={(e) => handleAdRequestSubmit(e, selectedCampaignId)}>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Message</label>
                                    <textarea
                                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ad Request Message"
                                        value={newAdRequest.message}
                                        onChange={(e) => setNewAdRequest({ ...newAdRequest, message: e.target.value })}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Proposed Terms</label>
                                    <textarea
                                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Proposed Terms"
                                        value={newAdRequest.proposedTerms}
                                        onChange={(e) => setNewAdRequest({ ...newAdRequest, proposedTerms: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 transition duration-300"
                                >
                                    {isEditingAdRequest ? 'Update Ad Request' : 'Create Ad Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campaigns;
