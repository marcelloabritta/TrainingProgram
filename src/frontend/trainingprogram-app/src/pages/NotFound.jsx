import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
            <div className="relative group max-w-lg w-full">
                {/* Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-[#B2E642] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                <div className="relative bg-[#1f2937]/90 backdrop-blur-2xl border border-gray-700/50 p-10 sm:p-14 rounded-[2rem] shadow-2xl flex flex-col items-center text-center">
                    {/* Error Icon */}
                    <div className="w-24 h-24 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-8 border border-gray-700/50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-[#B2E642] text-5xl animate-pulse" />
                    </div>

                    <h1 className="text-7xl font-black text-white mb-2 tracking-tighter italic">
                        404
                    </h1>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                        Lost in <span className="text-[#B2E642]">Training?</span>
                    </h2>

                    <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
                        The page you are looking for doesn't exist or has been moved to a different workout block.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl border border-gray-700 transition-all active:scale-95"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                            Go Back
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#B2E642] hover:bg-[#a1d13b] text-black font-extrabold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95 transform hover:-translate-y-1"
                        >
                            <FontAwesomeIcon icon={faHome} />
                            Dashboard
                        </button>
                    </div>

                    <div className="mt-12 flex items-center gap-2 text-gray-500 text-xs uppercase tracking-[0.2em] font-black opacity-30">
                        <span>VanGo</span>
                        <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                        <span>Training Program</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
