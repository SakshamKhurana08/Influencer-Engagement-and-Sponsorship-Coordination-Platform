/**
 * BrandLogo — renders the Cofluence logo image + optional wordmark.
 * Props:
 *   size      — logo image height in px (default 32)
 *   fontSize  — wordmark font size (default '1.2rem')
 *   color     — wordmark color (default '#6366F1')
 *   showName  — whether to show the text name (default true)
 */
import cofluenceLogo from '../assets/confluence-logo.png';

export default function BrandLogo({
  size = 32,
  fontSize = '1.2rem',
  color = '#6366F1',
  showName = true,
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
      <img
        src={cofluenceLogo}
        alt="Cofluence logo"
        style={{ height: size, width: size, objectFit: 'contain', flexShrink: 0 }}
      />
      {showName && (
        <span
          className="display-brand"
          style={{ fontSize, color, letterSpacing: '-0.01em', lineHeight: 1 }}
        >
          Cofluence
        </span>
      )}
    </div>
  );
}
