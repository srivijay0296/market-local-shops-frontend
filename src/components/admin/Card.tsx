import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string; // Tailwind color suffix, e.g., 'blue-600'
}

export default function Card({ title, value, icon: Icon, color = 'blue-600' }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center space-x-4">
      <div className={`p-3 rounded-full bg-${color} bg-opacity-10 text-${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
