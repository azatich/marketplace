import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    iconColor: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative p-6 rounded-xl bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all overflow-hidden group"
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 rounded-xl bg-linear-to-br from-[#8B7FFF]/20 to-[#6DD5ED]/20 blur-xl" />
      </div>
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#A0AEC0] mb-2">{title}</p>
            <p className="text-[2rem] tabular-nums">{value}</p>
          </div>
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: iconColor }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
