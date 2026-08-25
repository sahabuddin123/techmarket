import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Dynamic Lucide Icon Resolver
 */
export default function AdminIcon({ name, className = 'w-4 h-4', ...props }) {
  if (!name) return <LucideIcons.Circle className={className} {...props} />;
  
  // Directly find in Lucide Icons
  const IconComponent = LucideIcons[name] || LucideIcons.Circle;
  return <IconComponent className={className} {...props} />;
}
