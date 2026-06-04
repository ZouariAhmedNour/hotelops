import type { ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const DashboardSection = ({
  title,
  subtitle,
  children,
}: DashboardSectionProps) => {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-3xl font-semibold text-[#13234b]">{title}</h2>

        {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
      </div>

      {children}
    </section>
  );
};

export default DashboardSection;