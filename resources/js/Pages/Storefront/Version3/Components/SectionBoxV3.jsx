import React from 'react';

/**
 * SectionBoxV3 - Signature TechJhuli Container
 * Features:
 * - Rounded container (rounded-[22px])
 * - Light blue subtle border (#8BB1FF / #CAE0FF)
 * - Soft ambient shadow (box-shadow: 0px 0px 15px #CAE0FF)
 * - Centered floating gradient top-pill badge with title
 */
export default function SectionBoxV3({
  title,
  subtitle,
  badgeText,
  children,
  className = '',
  badgeClassName = '',
  action = null,
}) {
  const displayBadge = badgeText || title;

  return (
    <section className={`w-full max-w-[1240px] mx-auto px-3 sm:px-4 lg:px-6 relative my-10 sm:my-14 ${className}`}>
      <div className="relative bg-white border border-[#8BB1FF]/70 rounded-[22px] p-4 sm:p-6 md:p-8 shadow-[0_0_15px_rgba(202,224,255,0.65)]">
        
        {/* Floating Top-Pill Section Header */}
        {displayBadge && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
            <div className={`px-6 sm:px-8 py-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#0153FD] text-white font-black text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center whitespace-nowrap border-2 border-white ${badgeClassName}`}>
              <span>{displayBadge}</span>
            </div>
          </div>
        )}

        {/* Optional Subtitle or Action bar */}
        {(subtitle || action) && (
          <div className="pt-2 sm:pt-3 pb-4 sm:pb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            {subtitle ? (
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto text-center font-normal">
                {subtitle}
              </p>
            ) : <div />}
            {action && (
              <div className="shrink-0">
                {action}
              </div>
            )}
          </div>
        )}

        {/* Section Main Content */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </section>
  );
}
