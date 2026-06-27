import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [ongoingCampaigns, setOngoingCampaigns] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Fetch ongoing campaigns
  useEffect(() => {
    if (activeTab === "info") {
      fetch("/api/admin/ongoing-campaigns")
        .then((res) => res.json())
        .then((data) => setOngoingCampaigns(data))
        .catch((err) => console.error("Ongoing campaigns error:", err));

      fetch("/api/admin/flagged-campaigns")
        .then((res) => res.json())
        .then((data) => setFlagged(data))
        .catch((err) => console.error("Flagged campaigns error:", err));
    }
  }, [activeTab]);

  // Search
  const handleSearch = () => {
    fetch(`/api/admin/search?query=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        const results = [
          ...data.users.map(u => ({ type: u.role || "User", name: u.name })),
          ...data.campaigns.map(c => ({ type: "Campaign", name: c.title }))
        ];
        setSearchResults(results);
      })
      .catch((err) => console.error("Search error:", err));
  };

  // Optional: Remove or flag handlers can be added with fetch POST requests

  return (
    <div className="p-6">
      <header className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-semibold">Admin's Dashboard</h2>
        <nav className="space-x-4">
          {["info", "find", "stats", "logout"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 rounded ${activeTab === tab ? "bg-blue-200 font-semibold" : "text-gray-600"
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === "info" && (
        <section>
          <p className="text-lg font-medium mb-4">Welcome Admin</p>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Ongoing Campaigns:</h3>
            {ongoingCampaigns.length > 0 ? (
              ongoingCampaigns.map((c, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2"
                >
                  <span>
                    {c.name} | Progress {c.progress}
                  </span>
                  <button className="bg-yellow-200 hover:bg-yellow-300 px-4 py-1 rounded">
                    View
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No ongoing campaigns</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Flagged Users/Campaigns:</h3>
            {flagged.length > 0 ? (
              flagged.map((f, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2"
                >
                  <span>
                    {f.name} | {f.company}
                  </span>
                  <div className="space-x-2">
                    <button className="bg-yellow-200 hover:bg-yellow-300 px-4 py-1 rounded">
                      View
                    </button>
                    <button className="bg-red-200 hover:bg-red-300 px-4 py-1 rounded">
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No flagged entities</p>
            )}
          </div>
        </section>
      )}

      {activeTab === "find" && (
        <section>
          <div className="mb-4 flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="border px-3 py-1 rounded w-1/2"
            />
            <button
              onClick={handleSearch}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded"
            >
              Filter
            </button>
          </div>

          {searchResults.length > 0 ? (
            searchResults.map((res, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2"
              >
                <span>{res.type} | {res.name}</span>
                <div className="space-x-2">
                  <button className="bg-yellow-200 hover:bg-yellow-300 px-4 py-1 rounded">
                    View
                  </button>
                  <button className="bg-red-200 hover:bg-red-300 px-4 py-1 rounded">
                    Flag
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No search results yet</p>
          )}
        </section>
      )}

      {activeTab === "stats" && (
        <div className="text-center mt-20 text-gray-500 text-xl">
          📊 Stats section coming soon!
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
