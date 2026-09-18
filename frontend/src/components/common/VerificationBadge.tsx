import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { VerificationReport } from '../../types';

interface VerificationBadgeProps {
  verification?: VerificationReport;
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ verification, className = '' }) => {
  if (!verification || verification.status !== 'completed') {
    return (
      <div className={`flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit ${className}`}>
        <Shield className="w-3 h-3" />
        <span>Unverified</span>
      </div>
    );
  }

  const { level, trustScore, visualGrade } = verification;
  
  let colorClass = 'bg-green-100 text-green-700 border-green-200';
  let Icon = ShieldCheck;
  
  if (trustScore < 50) {
    colorClass = 'bg-red-100 text-red-700 border-red-200';
    Icon = ShieldAlert;
  } else if (trustScore < 75) {
    colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs border px-2 py-1 rounded-full w-fit font-medium ${colorClass} ${className}`} title={`Trust Score: ${trustScore}/100`}>
      <Icon className="w-3.5 h-3.5" />
      <span>Lvl {level} Verified</span>
      <span className="opacity-50">|</span>
      <span>Grade {visualGrade}</span>
    </div>
  );
};

export default VerificationBadge;
