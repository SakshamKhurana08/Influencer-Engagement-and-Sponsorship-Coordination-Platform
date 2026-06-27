import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignUpProvider } from "./SignUpContext";
import SignUpLayout from "./SignUpLayout";
import SignUpStep1 from "./steps/SignUpStep1";
import SignUpStep2 from "./steps/SignUpStep2";
import SignUpStep3 from "./steps/SignUpStep3";
import "./check.css";

const SignUpRouter = () => (
    <SignUpProvider>
        <SignUpLayout>
            <Routes>
                <Route path="/" element={<Navigate to="step1" replace />} />
                <Route path="step1" element={<SignUpStep1 />} />
                <Route path="step2" element={<SignUpStep2 />} />
                <Route path="step3" element={<SignUpStep3 />} />
            </Routes>
        </SignUpLayout>
    </SignUpProvider>
);

export default SignUpRouter;
