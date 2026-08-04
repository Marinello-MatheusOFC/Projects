import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  linkTo?: string;
}

export function Logo({ size = 'md', showText = true, linkTo }: LogoProps) {
  const dims = { sm: 48, md: 72, lg: 96 };
  const imgHeights = { sm: 60, md: 84, lg: 108 };
  const imgRatio = 300 / 248;

  if (showText) {
    const imgHeight = imgHeights[size];
    const content = (
      <span className={`logo logo--${size} logo--img`}>
        <img
          src="/logo.png"
          alt="SOS Focinho Carente"
          className="logo-img"
          width={Math.round(imgHeight * imgRatio)}
          height={imgHeight}
        />
      </span>
    );

    if (linkTo !== undefined) {
      return <Link to={linkTo} className="logo-link" aria-label="SOS Focinho Carente — Início">{content}</Link>;
    }

    return content;
  }

  const content = (
    <span className={`logo logo--${size}`}>
      <span className="logo-mark">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          width={dims[size]}
          height={dims[size]}
          aria-hidden="true"
          className="logo-svg"
        >
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EF3E36" />
              <stop offset="100%" stopColor="#C7222A" />
            </linearGradient>
          </defs>

          <ellipse cx="32" cy="34" rx="29" ry="27" fill="#FFC928" opacity="0.28" />

          <path d="M18 24 L10 6 L27 15 Z" fill="#FFC928" className="logo-ear logo-ear--left" />
          <path d="M46 24 L54 6 L37 15 Z" fill="#14866D" className="logo-ear logo-ear--right" />

          <rect x="11" y="13" width="42" height="42" rx="16" fill="url(#logoGrad)" className="logo-head" />

          <circle cx="23" cy="30" r="4.5" fill="white" className="logo-eye logo-eye--left" />
          <circle cx="41" cy="30" r="4.5" fill="white" className="logo-eye logo-eye--right" />
          <circle cx="23" cy="30" r="2" fill="#202720" className="logo-pupil" />
          <circle cx="41" cy="30" r="2" fill="#202720" className="logo-pupil" />

          <path
            d="M32 47c-4.8-2.9-7.4-5.5-7.4-8.5a3.9 3.9 0 0 1 7.4-2 3.9 3.9 0 0 1 7.4 2c0 3-2.6 5.6-7.4 8.5Z"
            fill="#A51D23"
            className="logo-nose"
          />
          <path
            d="M32 44.5c-2.8-1.7-4.3-3.2-4.3-5a2.3 2.3 0 0 1 4.3-1.2 2.3 2.3 0 0 1 4.3 1.2c0 1.8-1.5 3.3-4.3 5Z"
            fill="#FF6B5F"
            className="logo-nose-shine"
          />

          <path d="M26.5 51 Q32 55.5 37.5 51" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" className="logo-mouth" />

          <line x1="18" y1="36" x2="6" y2="33" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" className="logo-whisker" />
          <line x1="18" y1="40" x2="6" y2="41" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" className="logo-whisker" />
          <line x1="46" y1="36" x2="58" y2="33" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" className="logo-whisker" />
          <line x1="46" y1="40" x2="58" y2="41" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" className="logo-whisker" />

          <circle cx="53" cy="30" r="1.6" fill="#FFC928" />

          <g fill="#0F6E58" className="logo-paw">
            <ellipse cx="50" cy="53" rx="4.2" ry="3.2" />
            <circle cx="45.5" cy="47.5" r="1.7" />
            <circle cx="49.8" cy="45.8" r="1.7" />
            <circle cx="54" cy="47.5" r="1.7" />
          </g>
        </svg>
      </span>
      {showText && (
        <span className="logo-text">
          <span className="logo-text-main">SOS Focinho Carente</span>
          <span className="logo-text-sub">Adoção responsável e cuidado</span>
        </span>
      )}
    </span>
  );

  if (linkTo !== undefined) {
    return <Link to={linkTo} className="logo-link" aria-label="SOS Focinho Carente — Início">{content}</Link>;
  }

  return content;
}
