import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export default function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-xl border backdrop-blur-sm ${colorClasses[color as keyof typeof colorClasses]} hover:scale-105 transition-transform`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className="text-4xl opacity-80">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}