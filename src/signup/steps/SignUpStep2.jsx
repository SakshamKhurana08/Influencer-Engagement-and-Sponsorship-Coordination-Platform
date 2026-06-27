// src/components/SignUpStep2.jsx
import React, { useState, useEffect } from "react"; // Added useEffect for preview initialization
import { useSignup } from "../SignUpContext"; // Adjust path if needed
import { useNavigate } from "react-router-dom";
import "../check.css"; // Adjust path if needed

const SignUpStep2 = () => {
    const { formData, updateFormData, profileImageFile, updateProfileImageFile } = useSignup();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);

    // --- Initialize image preview if a file exists in context ---
    useEffect(() => {
        if (profileImageFile instanceof File) { // Check if it's a File object
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(profileImageFile);
        } else {
            setImagePreview(null); // Clear preview if no valid file
        }
    }, [profileImageFile]); // Re-run if the file in context changes
    // -------------------------------------------------------------

    const validateForm = () => {
        const newErrors = {};
        if (formData.role === "influencer") {
            if (!formData.category?.trim()) newErrors.category = "Category is required.";
            if (!formData.niche?.trim()) newErrors.niche = "Niche is required.";
            if (!formData.reach || isNaN(formData.reach) || Number(formData.reach) <= 0) newErrors.reach = "Valid positive reach number is required.";
            // Optional: Add validation for the image if it's mandatory
            // if (!profileImageFile) newErrors.profileImage = "Profile image is required.";
        } else if (formData.role === "sponsor") {
            if (!formData.company?.trim()) newErrors.company = "Company name is required.";
            if (!formData.industry?.trim()) newErrors.industry = "Industry is required.";
            if (!formData.budget || isNaN(formData.budget) || Number(formData.budget) <= 0) newErrors.budget = "Valid positive budget number is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            updateProfileImageFile(file); // Update context state
            // Generate preview URL immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            if (errors.profileImage) {
                setErrors(prev => ({ ...prev, profileImage: undefined }));
            }
        } else {
            // Don't clear the context state if the user cancels file selection
            // updateProfileImageFile(null);
            // setImagePreview(null);
        }
        // Clear the input value to allow re-selecting the same file
        e.target.value = null;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleNext = (e) => {
        e.preventDefault(); // Prevent default form submission
        if (validateForm()) {
            navigate("/signup/step3");
        }
    };

    const handleBack = () => {
        navigate("/signup/step1");
    };

    // Return ONLY the form content for the right column
    return (
        // This div matches the styling of the form card in SignUpStep1
        <div className="w-full p-8 md:p-10 rounded-xl shadow-lg bg-white bg-opacity-90">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Step 2: {formData.role === "influencer" ? "Influencer Details" : "Sponsor Details"}
            </h2>
            <p className="text-gray-500 mb-8">Provide details specific to your role.</p>

            {/* Use a form element for better accessibility and structure */}
            <form onSubmit={handleNext} className="space-y-5">
                {formData.role === "influencer" ? (
                    <>
                        {/* Category Input */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                                id="category"
                                name="category"
                                type="text"
                                placeholder="e.g., Fashion, Tech, Food"
                                value={formData.category || ''}
                                onChange={handleInputChange}
                                className={`input ${errors.category ? 'input-error' : ''}`}
                            />
                            {errors.category && <p className="error-message">{errors.category}</p>}
                        </div>

                        {/* Niche Input */}
                        <div>
                            <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
                            <input
                                id="niche"
                                name="niche"
                                type="text"
                                placeholder="e.g., Streetwear, AI Tools, Vegan Recipes"
                                value={formData.niche || ''}
                                onChange={handleInputChange}
                                className={`input ${errors.niche ? 'input-error' : ''}`}
                            />
                            {errors.niche && <p className="error-message">{errors.niche}</p>}
                        </div>

                        {/* Reach Input */}
                        <div>
                            <label htmlFor="reach" className="block text-sm font-medium text-gray-700 mb-1">Reach (Followers/Subscribers)</label>
                            <input
                                id="reach"
                                name="reach"
                                type="number"
                                placeholder="e.g., 10000"
                                value={formData.reach || ''}
                                onChange={handleInputChange}
                                className={`input ${errors.reach ? 'input-error' : ''}`}
                                min="1" // Basic HTML5 validation
                            />
                            {errors.reach && <p className="error-message">{errors.reach}</p>}
                        </div>

                        {/* Profile Image Input */}
                        <div>
                            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (Optional)</label>
                            <input
                                id="profileImage"
                                name="profileImage"
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleFileChange}
                                className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer ${errors.profileImage ? 'border-red-500 ring-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} border rounded-md shadow-sm`} // Improved styling
                            />
                            {errors.profileImage && <p className="error-message">{errors.profileImage}</p>}
                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="mt-4">
                                    <span className="block text-xs font-medium text-gray-500 mb-1">Preview:</span>
                                    <img src={imagePreview} alt="Profile Preview" className="h-20 w-20 rounded-full object-cover border shadow-sm" />
                                </div>
                            )}
                        </div>
                    </>
                ) : ( // Sponsor Fields
                    <>
                        {/* Company Name Input */}
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input
                                id="company"
                                name="company"
                                type="text"
                                placeholder="Your Company Inc."
                                value={formData.company || ''}
                                onChange={handleInputChange}
                                className={`input ${errors.company ? 'input-error' : ''}`}
                            />
                            {errors.company && <p className="error-message">{errors.company}</p>}
                        </div>

                        {/* Industry Input */}
                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                            <input
                                id="industry"
                                name="industry"
                                type="text"
                                placeholder="e.g., Marketing, Software, Retail"
                                value={formData.industry || ''}
                                onChange={handleInputChange}
                                className={`input ${errors.industry ? 'input-error' : ''}`}
                            />
                            {errors.industry && <p className="error-message">{errors.industry}</p>}
                        </div>

                        {/* Budget Input */}
                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Typical Campaign Budget ($)</label>
                            <input
                                id="budget"
                                name="budget"
                                type="number"
                                placeholder="e.g., 5000"
                                value={formData.budget || ''}
                                onChange={handleInputChange}
                                className={`input ${errors.budget ? 'input-error' : ''}`}
                                min="1" // Basic HTML5 validation
                            />
                            {errors.budget && <p className="error-message">{errors.budget}</p>}
                        </div>
                    </>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-end pt-6 gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 transition"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 transition"
                    >
                        Next: Review
                    </button>
                </div>

            </form>
        </div>
    );
};

export default SignUpStep2;