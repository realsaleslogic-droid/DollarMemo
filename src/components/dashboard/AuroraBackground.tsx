/**
 * A subtle, slowly-drifting gradient field rendered behind the dashboard.
 * Pure CSS (compositor-driven transforms) so it's smooth on mobile, and it
 * honors prefers-reduced-motion. Colors follow the active accent + theme.
 */
export default function AuroraBackground() {
  return (
    <div aria-hidden className="aurora">
      <span className="aurora-blob aurora-a" />
      <span className="aurora-blob aurora-b" />
      <span className="aurora-blob aurora-c" />
    </div>
  );
}
