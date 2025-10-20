import React from 'react';

const HerbalifeLogo: React.FC<{ className?: string }> = ({ className = "h-10 w-auto" }) => {
    return (
        <div className={`flex items-center ${className}`}>
            <svg viewBox="0 0 40 40" className="h-full w-auto mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.1111 2.22222C21.1111 2.22222 8.88889 10 8.88889 20C8.88889 30 21.1111 37.7778 21.1111 37.7778C21.1111 37.7778 33.3333 30 33.3333 20C33.3333 10 21.1111 2.22222 21.1111 2.22222Z" stroke="#006D44" strokeWidth="2.5"/>
                <path d="M21.1111 11.1111C21.1111 11.1111 15.5556 15.5556 15.5556 20C15.5556 24.4444 21.1111 28.8889 21.1111 28.8889C21.1111 28.8889 26.6667 24.4444 26.6667 20C26.6667 15.5556 21.1111 11.1111 21.1111 11.1111Z" stroke="#8CC63F" strokeWidth="2.5"/>
                <path d="M21.1111 20H33.3333M8.88889 20H21.1111M21.1111 2.22222V20V37.7778" stroke="#006D44" strokeWidth="2.5"/>
            </svg>
            <div className="text-left leading-tight">
                <span className="text-xs font-semibold text-gray-700 block">Club de Nutrición</span>
                <span className="text-sm font-bold text-green-800 block">Herbalife</span>
            </div>
        </div>
    );
};

export default HerbalifeLogo;
