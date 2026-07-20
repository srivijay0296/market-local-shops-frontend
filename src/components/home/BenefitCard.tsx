import React from "react";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}

export const BenefitCard = React.memo(function BenefitCard({ icon, title, desc, color }: BenefitCardProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 group">
      <div className={`w-16 h-16 bg-background border border-border shadow-sm rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${color}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-display font-black text-foreground text-lg mb-1">{title}</h4>
        <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">{desc}</p>
      </div>
    </div>
  );
});
