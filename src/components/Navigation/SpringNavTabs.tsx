import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface SpringTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: string | number;
  highlight?: boolean;
}

interface SpringNavTabsProps {
  tabs: SpringTabItem[];
  activeId: string;
  onChange?: (id: string) => void;
  layoutId?: string;
  variant?: 'dark' | 'light' | 'floating' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SpringNavTabs: React.FC<SpringNavTabsProps> = ({
  tabs,
  activeId,
  onChange,
  layoutId = 'spring-nav-pill',
  variant = 'light',
  size = 'md',
  className = '',
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleClick = (tab: SpringTabItem, e: React.MouseEvent) => {
    if (tab.href && tab.href.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.querySelector(tab.href);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    if (onChange) {
      onChange(tab.id);
    }
  };

  // Sizing classes
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 sm:py-1 gap-1',
    md: 'text-[11.5px] sm:text-xs px-3 sm:px-3.5 py-1 gap-1.5',
    lg: 'text-xs sm:text-[13px] px-4 py-1.5 gap-2',
  }[size];

  // Container styling
  const containerVariants = {
    light: 'bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
    dark: 'bg-black/90 backdrop-blur-md border border-white/10 shadow-md text-white',
    floating: 'bg-white/95 backdrop-blur-xl border border-gray-200/90 shadow-md',
    subtle: 'bg-gray-100/80 backdrop-blur-sm border border-black/[0.04]',
  }[variant];

  // Active pill background style
  const activePillStyle = {
    light: 'bg-black text-white shadow-sm',
    dark: 'bg-white text-black shadow-sm',
    floating: 'bg-black text-white shadow-sm',
    subtle: 'bg-black text-white shadow-sm',
  }[variant];

  return (
    <nav
      className={`relative inline-flex items-center p-1 rounded-full select-none ${containerVariants} ${className}`}
      onMouseLeave={() => setHoveredId(null)}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        const isHovered = hoveredId === tab.id && !isActive;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={(e) => handleClick(tab, e)}
            onMouseEnter={() => setHoveredId(tab.id)}
            className={`relative flex items-center justify-center font-[Poppins] font-medium transition-colors duration-200 rounded-full z-10 cursor-pointer ${sizeClasses} ${
              isActive
                ? variant === 'dark'
                  ? 'text-black font-semibold'
                  : 'text-white font-semibold'
                : variant === 'dark'
                ? 'text-white/70 hover:text-white'
                : 'text-black/70 hover:text-black'
            }`}
          >
            {/* Fluid Spring Active Indicator (The Elastic Blob / Pill) */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={`absolute inset-0 rounded-full -z-10 ${activePillStyle}`}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 28,
                  mass: 0.8,
                }}
              />
            )}

            {/* Subtle Hover Ghost Pill */}
            {isHovered && !isActive && (
              <motion.div
                layoutId={`${layoutId}-hover`}
                className={`absolute inset-0 rounded-full -z-10 ${
                  variant === 'dark' ? 'bg-white/10' : 'bg-black/5'
                }`}
                transition={{
                  type: 'spring',
                  stiffness: 480,
                  damping: 32,
                }}
              />
            )}

            {/* Tab Icon with Elastic Spring Bounce Animation */}
            {tab.icon && (
              <motion.span
                className="flex items-center justify-center"
                animate={
                  isActive
                    ? {
                        scale: [1, 1.28, 0.94, 1.08, 1],
                        rotate: [0, -6, 6, 0],
                      }
                    : {
                        scale: isHovered ? 1.12 : 1,
                        rotate: 0,
                      }
                }
                transition={{
                  duration: 0.45,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                {tab.icon}
              </motion.span>
            )}

            {/* Tab Label */}
            <span>{tab.label}</span>

            {/* Optional Badge */}
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? variant === 'dark'
                      ? 'bg-black/10 text-black'
                      : 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.badge}
              </span>
            )}

            {/* Subtle Glow dot on active item */}
            {isActive && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className={`w-1 h-1 rounded-full ${
                  variant === 'dark' ? 'bg-black' : 'bg-white'
                }`}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
