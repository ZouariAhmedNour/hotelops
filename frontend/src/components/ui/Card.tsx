import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-3xl bg-white shadow-[0_2px_20px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;