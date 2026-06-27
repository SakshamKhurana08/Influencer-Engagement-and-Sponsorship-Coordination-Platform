// src/components/SignUpStep1.jsx (or similar path)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../SignUpContext"; // Adjust path
import "../check.css"; // Adjust path

// Removed PlaceholderIcon - it's now in SignUpLayout

const SignUpStep1 = () => {
    const { formData, updateFormData } = useSignup();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = "Name is required.";
        if (!formData.email?.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Valid email is required.";
        }
        if (!formData.password) newErrors.password = "Password is required.";
        if (!formData.role) newErrors.role = "Role (Influencer or Sponsor) is required.";
        if (!agreedToTerms) newErrors.terms = "You must agree to the Terms and Conditions.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setAgreedToTerms(checked);
            if (errors.terms) {
                setErrors(prev => ({ ...prev, terms: undefined }));
            }
        } else {
            updateFormData({ [name]: value });
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: undefined }));
            }
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Navigate to the next step within the nested route structure
            navigate("/signup/step2");
        }
    };

    // Return ONLY the form part for the right column
    return (
        // This div will be placed inside the motion.div in SignUpLayout
        // Added bg-white, rounded, shadow etc. here as it's the form 'card'
        <div className="w-full h-[90%] p-8 md:p-10 rounded-xl shadow-lg bg-white bg-opacity-90">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Create Your Account</h2>
            <p className="text-gray-500 mb-8">Fill in the details below to get started.</p>

            <form onSubmit={handleNext} className="space-y-3">
                {/* Name Input */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className={`input ${errors.name ? 'input-error' : ''}`}
                    />
                    {errors.name && <p className="error-message">{errors.name}</p>}
                </div>

                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className={`input ${errors.email ? 'input-error' : ''}`}
                    />
                    {errors.email && <p className="error-message">{errors.email}</p>}
                </div>

                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter a secure password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        className={`input ${errors.password ? 'input-error' : ''}`}
                    />
                    {errors.password && <p className="error-message">{errors.password}</p>}
                </div>

                {/* Role Selection */}
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Select Your Role</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role || ''}
                        onChange={handleInputChange}
                        className={`input ${errors.role ? 'input-error' : ''} ${!formData.role ? 'text-gray-500' : ''}`}
                    >
                        <option value="" disabled>Choose Role</option>
                        <option value="influencer">Influencer</option>
                        <option value="sponsor">Sponsor</option>
                    </select>
                    {errors.role && <p className="error-message">{errors.role}</p>}
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="flex items-center">
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        I agree with all <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-500">Terms and Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-500">Privacy Policies</a>.
                    </label>
                </div>
                {errors.terms && <p className="error-message -mt-3">{errors.terms}</p>}

                {/* Submit Button */}
                <div className="pt-4">
                    <button type="submit" className="btn-submit w-full">
                        Next: Step 2
                    </button>
                </div>

                {/* Optional: Link to Login */}
                <p className="text-center text-sm text-gray-600 mt-2">
                    Already have an account?{' '}
                    <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </a>
                </p>
            </form>
        </div>
    );
};

export default SignUpStep1;