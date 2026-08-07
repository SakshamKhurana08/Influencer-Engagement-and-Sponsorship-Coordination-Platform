/**
 * BrandLogo — renders the Cofluence logo image + optional wordmark.
 * Props:
 *   height    — logo image height in px (default 36). Width is auto so
 *               rectangular logos are never cropped.
 *   fontSize  — wordmark font size (default '1.2rem')
 *   color     — wordmark color (default '#6366F1')
 *   showName  — whether to show the text name (default true)
 */
import cofluenceLogo from '../assets/cofluence-logo-trimmed.png';

export default function BrandLogo({
  height = 36,
  fontSize = '1.2rem',
  color = '#6366F1',
  showName = true,
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
      <img
        src={cofluenceLogo}
        alt="Cofluence"
        style={{
          height: height,
          width: 'auto',
          objectFit: 'contain',
          flexShrink: 0,
          display: 'block',
        }}
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
