import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, hoverEffect = false, ...props }) => {
    return (
        <div
            className={twMerge(
                clsx(
                    "bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6",
                    hoverEffect && "transition-transform hover:scale-[1.02] hover:shadow-xl",
                    className
                )
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
