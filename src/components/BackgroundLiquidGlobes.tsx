import React from 'react';

export const BackgroundLiquidGlobes: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
      {/* Voicecheap Signature Dot Matrix Background Texture */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(229, 231, 235) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
