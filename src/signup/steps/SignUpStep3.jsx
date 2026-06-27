// src/components/SignUpStep3.jsx
import React, { useState, useEffect } from "react";
import { useSignup } from "../SignUpContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../check.css";

const SignUpStep3 = () => {
    const { formData, profileImageFile } = useSignup();
    const [status, setStatus] = useState("");
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let objectUrl = null;
        if (profileImageFile instanceof File) {
            objectUrl = URL.createObjectURL(profileImageFile);
            console.log(objectUrl);
            setImagePreview(objectUrl);
        } else {
            setImagePreview(null);
        }
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [profileImageFile]);

    const canSubmit = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.role) return false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit() || isSubmitting) {
            if (!canSubmit()) {
                setSubmitError("Critical information seems to be missing. Please go back and complete all steps.");
            }
            return;
        }

        setIsSubmitting(true);
        setStatus("Submitting...");
        setSubmitError(null);

        const dataToSend = new FormData();
        for (const key in formData) {
            if (formData.hasOwnProperty(key) && formData[key] != null) {
                dataToSend.append(key, formData[key]);
            }
        }

        if (formData.role === 'influencer' && profileImageFile instanceof File) {
            dataToSend.append('profileImage', profileImageFile);
        }

        try {
            console.log("Data to send:");
            for (let [key, value] of dataToSend.entries()) {
                console.log(`${key}: ${value}`);
            }

            const res = await axios.post("http://localhost:2020/api/auth/register", dataToSend);
            setStatus("✅ Registration successful!");

            setTimeout(() => navigate("/signup-success"),0);
        } catch (err) {
            console.error("Registration Error:", err.response || err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Registration failed. Please check details and try again.";
            setStatus(`❌ Error: ${errorMsg}`);
            setSubmitError(errorMsg);
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (!isSubmitting) navigate("/signup/step2");
    };

    const renderDetail = (label, value, isCurrency = false) => {
        if (value == null || value === '') return null;
        return (
            <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                <dt className="text-sm font-medium text-gray-600 break-words pr-2">{label}:</dt>
                <dd className="text-sm text-gray-800 text-right">{isCurrency ? `₹${value}` : value}</dd>
            </div>
        );
    };

    return (
        <div className="w-full p-8 md:p-10 rounded-xl shadow-lg bg-white bg-opacity-90">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Step 3: Review & Submit</h2>
            <p className="text-gray-500 mb-8">Please confirm your details before completing registration.</p>

            <div className="space-y-6">
                {(status && !submitError) && (
                    <p className={`text-center p-2 rounded text-sm ${status.includes("Error") || status.includes("❌") ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{status}</p>
                )}
                {submitError && (
                    <p className="error-message text-center p-3 bg-red-100 border border-red-300 rounded">{submitError}</p>
                )}

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Account Info</h3>
                    <dl>
                        {renderDetail("Name", formData.name)}
                        {renderDetail("Email", formData.email)}
                        {renderDetail("Role", formData.role?.charAt(0).toUpperCase() + formData.role?.slice(1))}
                    </dl>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        Profile Info ({formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : 'N/A'})
                    </h3>
                    <dl>
                        {formData.role === "influencer" ? (
                            <>
                                {renderDetail("Category", formData.category)}
                                {renderDetail("Niche", formData.niche)}
                                {renderDetail("Reach", formData.reach)}
                                {imagePreview ? (
                                    <div className="flex justify-between items-center py-2">
                                        <dt className="text-sm font-medium text-gray-600">Profile Photo:</dt>
                                        <dd><img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-full object-cover border shadow-sm" /></dd>
                                    </div>
                                ) : renderDetail("Profile Photo", "Not Uploaded")}
                            </>
                        ) : (
                            <>
                                {renderDetail("Company Name", formData.company)}
                                {renderDetail("Industry", formData.industry)}
                                {renderDetail("Campaign Budget", formData.budget, true)}
                            </>
                        )}
                    </dl>
                </div>

                {/* Updated Buttons */}
                <div className="flex justify-between items-center pt-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-50"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !canSubmit()}
                        className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Confirm & Register'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUpStep3;
