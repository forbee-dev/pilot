import React from 'react';

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function HeroBanner({
  title,
  subtitle,
  imageUrl,
  buttonText = 'Learn More',
  backgroundColor = '#0070f3',
  textColor = '#ffffff',
}: HeroBannerProps) {
  return (
    <div className="hero-banner" style={{ backgroundColor }}>
      <div className="hero-image-container">
        <img src={imageUrl} alt={title} className="hero-image" />
      </div>
      <div className="hero-content" style={{ color: textColor }}>
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {buttonText && (
          <button className="hero-button" style={{ color: textColor }}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}


