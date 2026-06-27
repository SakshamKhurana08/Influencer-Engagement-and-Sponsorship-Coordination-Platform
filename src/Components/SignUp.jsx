import { useState } from 'react';
import SponsorForm from './SponsorForm';
import InfluencerForm from './InfluencerForm';

function SignUp() {
    const [role, setRole] = useState('sponsor');

    const buttonBaseStyle = "flex-1 py-3 mx-1 rounded-md font-semibold transition-all duration-300";

    return (
        <div className="w-full max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between mb-6">
                <button
                    className={`${buttonBaseStyle} ${role === 'sponsor' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setRole('sponsor')}
                >
                    Sponsor
                </button>
                <button
                    className={`${buttonBaseStyle} ${role === 'influencer' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setRole('influencer')}
                >
                    Influencer
                </button>
            </div>

            {role === 'sponsor' ? <SponsorForm /> : <InfluencerForm />}
        </div>
    );
}

export default SignUp;
