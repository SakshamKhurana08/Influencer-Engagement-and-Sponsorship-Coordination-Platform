// SignUpContext.js (Example structure)
import React, { createContext, useState, useContext } from 'react';

const SignUpContext = createContext();

export const useSignup = () => useContext(SignUpContext);

export const SignUpProvider = ({ children }) => {
    const [formData, setFormData] = useState({});
    // --- Add state for the profile image file ---
    const [profileImageFile, setProfileImageFile] = useState(null);
    // --------------------------------------------

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    // --- Function to update the image file ---
    const updateProfileImageFile = (file) => {
        setProfileImageFile(file);
    };
    // ------------------------------------------

    // --- Pass the new state and function in the value ---
    const value = {
        formData,
        updateFormData,
        profileImageFile,         // Pass the file state
        updateProfileImageFile,   // Pass the update function
    };
    // ------------------------------------------------------

    return (
        <SignUpContext.Provider value={value}>
            {children}
        </SignUpContext.Provider>
    );
};