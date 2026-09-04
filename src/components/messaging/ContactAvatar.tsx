/**
 * Colorful "blob" contact avatar. Each contact gets a distinct hue plus a
 * small abstract mark, derived deterministically from their id/name so it
 * stays consistent across mobile/desktop and re-renders. Falls back to a
 * real photo when one is supplied.
 */

const SQUIGGLES = [
  "M6 16c2-6 6-9 10-9s7 4 6 9-6 6-10 5-8-3-6-5Z",
  "M5 12c0-5 5-8 9-7s7 5 5 9-8 5-11 3-3-3-3-5Z",
  "M7 6c5-2 10 0 11 5s-2 9-7 9-9-3-8-8 1-5 4-6Z",
  "M4 10c1-4 6-6 10-5s6 6 4 10-7 4-10 2-5-4-4-7Z",
  "M8 5c4 0 8 2 8 7s-4 8-9 7-6-5-5-9 2-5 6-5Z",
  "M5 9c2-4 7-5 10-3s5 7 2 10-8 3-10 0-3-4-2-7Z",
];

const hueFromString = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
};

interface Props {
  seed: string;
  photoUrl?: string;
  size?: number;
  ring?: boolean;
  className?: string;
}

const ContactAvatar = ({ seed, photoUrl, size = 44, ring, className = "" }: Props) => {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        style={{ width: size, height: size }}
        className={`rounded-full object-cover flex-shrink-0 ${ring ? "ring-2 ring-primary/20" : ""} ${className}`}
      />
    );
  }

  const hue = hueFromString(seed || "contact");
  const squiggle = SQUIGGLES[hueFromString(`${seed}x`) % SQUIGGLES.length];

  return (
    <div
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, hsl(${hue} 78% 62%), hsl(${hue} 70% 44%))`,
      }}
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${ring ? "ring-2 ring-primary/20" : ""} ${className}`}
    >
      <svg viewBox="0 0 20 20" width={size * 0.5} height={size * 0.5} fill="none" aria-hidden="true">
        <path d={squiggle} fill="white" fillOpacity={0.85} />
      </svg>
    </div>
  );
};

export default ContactAvatar;
