import React from 'react';

const HerbalifeLogo: React.FC<{ className?: string }> = ({ className = "h-8 w-auto" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 160 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Herbalife Logo"
        >
            {/* Generic Leaf Icon */}
            <path
                d="M20 5C10 5 5 15 5 20s5 15 15 15c10 0 15-10 15-15S30 5 20 5zM12.5 20c0-5 2.5-7.5 7.5-7.5s7.5 2.5 7.5 7.5c0 3-1 6-4 8l-3.5-3.5-3.5 3.5c-3-2-4-5-4-8z"
                fill="#006D44"
            />
            <path
                d="M20 12.5c-2.5 0-5 2-5 7.5 0 2 1 4 2.5 5.5l2.5-2.5 2.5 2.5c1.5-1.5 2.5-3.5 2.5-5.5 0-5.5-2.5-7.5-5-7.5z"
                fill="#8CC63F"
            />
            {/* Text Part */}
            <text
                x="45"
                y="28"
                fontFamily="Arial, sans-serif"
                fontSize="24"
                fontWeight="bold"
                fill="#333"
            >
                HERBALIFE
            </text>
        </svg>
    );
};

export default HerbalifeLogo;
