import styles from './about.module.css';

// Striped placeholder with a monospace caption — ports shared.css `.placeholder`.
// Stand-in for future real photography (process steps + workshop banner).
// TODO: replace with real workshop photo when available.

interface PlaceholderImageProps {
  /** monospace shot-direction caption from the design */
  caption: string;
  className?: string;
  /** inline style hook for full-bleed banner usage */
  style?: React.CSSProperties;
}

export default function PlaceholderImage({
  caption,
  className,
  style,
}: PlaceholderImageProps) {
  return (
    <div
      className={`${styles.placeholder}${className ? ` ${className}` : ''}`}
      style={style}
      role="img"
      aria-label={`Placeholder: ${caption}`}
    >
      <span>{caption}</span>
    </div>
  );
}
