import React, { useRef, useEffect, useState } from 'react';

interface AnimatedLogoProps {
  className?: string;
  onClick?: () => void;
  replayOnHover?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  className = '',
  onClick,
  replayOnHover = true,
  size = 'md',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Trigger auto-playback on mount
    const startPlay = async () => {
      try {
        video.currentTime = 0;
        await video.play();
      } catch {
        // Autoplay fallback if blocked by browser policy
      }
    };

    if (video.readyState >= 2) {
      startPlay();
    } else {
      video.addEventListener('loadeddata', startPlay, { once: true });
    }
  }, []);

  const handleMouseEnter = () => {
    if (!replayOnHover) return;
    const video = videoRef.current;
    if (video && video.paused) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (video) {
      // Freeze precisely on the final frame without looping
      video.pause();
      if (video.duration) {
        video.currentTime = Math.max(0, video.duration - 0.05);
      }
    }
  };

  const sizeClasses = {
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-9 md:h-10',
    lg: 'h-11 sm:h-12 md:h-14',
  }[size];

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={`inline-flex items-center cursor-pointer select-none group relative ${className}`}
      title="Subtitla"
    >
      <video
        ref={videoRef}
        src="/logo-animated.mp4"
        muted
        playsInline
        autoPlay
        preload="auto"
        onLoadedData={() => setIsLoaded(true)}
        onEnded={handleEnded}
        className={`${sizeClasses} w-auto object-contain rounded-md transition-all duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } group-hover:scale-[1.02]`}
        style={{
          // Prevent standard video controls and context menu issues
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
