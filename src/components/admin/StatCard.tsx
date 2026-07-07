import React from 'react';
// IconProps import removed; using ReactNode for Icon prop

interface StatCardProps {
  title: string;
  value: number | string;
  Icon: React.ReactNode;
  bgColor?: string;
}

export default function StatCard({ title, value, Icon, bgColor = 'bg-indigo-600' }: StatCardProps) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl shadow ${bgColor} text-white`}>
      <div className="p-2 bg-white bg-opacity-20 rounded-full">{Icon}</div>
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
