import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  linkTo?: string;
}

export function Logo({ size = 'md', showText = true, linkTo }: LogoProps) {
  const dims = { sm: 32, md: 44, lg: 56 };

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
              <stop offset="0%" stopColor="#E64A35" />
              <stop offset="100%" stopColor="#F2AB37" />
            </linearGradient>
          </defs>

          <ellipse cx="32" cy="38" rx="24" ry="21" fill="url(#logoGrad)" className="logo-head" />

          <path d="M14 24 L8 6 L24 16 Z" fill="#E64A35" className="logo-ear logo-ear--left" />
          <path d="M50 24 L56 6 L40 16 Z" fill="#F2AB37" className="logo-ear logo-ear--right" />

          <circle cx="21" cy="32" r="3.5" fill="white" className="logo-eye logo-eye--left" />
          <circle cx="43" cy="32" r="3.5" fill="white" className="logo-eye logo-eye--right" />

          <circle cx="21" cy="32" r="1.5" fill="#1C1917" className="logo-pupil" />
          <circle cx="43" cy="32" r="1.5" fill="#1C1917" className="logo-pupil" />

          <ellipse cx="32" cy="42" rx="7" ry="5" fill="#AE3322" className="logo-nose" />
          <ellipse cx="32" cy="40" rx="3" ry="2" fill="#F2A090" className="logo-nose-shine" />

          <path d="M26 47 Q32 52 38 47" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" className="logo-mouth" />

          <line x1="17" y1="40" x2="6" y2="37" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" className="logo-whisker" />
          <line x1="17" y1="44" x2="6" y2="44" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" className="logo-whisker" />
          <line x1="47" y1="40" x2="58" y2="37" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" className="logo-whisker" />
          <line x1="47" y1="44" x2="58" y2="44" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" className="logo-whisker" />

          <circle cx="32" cy="48" r="1.2" fill="white" className="logo-nose-dot" />
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
