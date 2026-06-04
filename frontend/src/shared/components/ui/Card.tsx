import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`rounded-3xl bg-white shadow-[0_2px_20px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;