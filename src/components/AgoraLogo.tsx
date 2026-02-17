export function AgoraLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        points="16,2 28,10 28,22 16,30 4,22 4,10"
        stroke="#5aaca7"
        strokeWidth="2"
        fill="none"
      />
      <polygon
        points="16,8 22,12 22,20 16,24 10,20 10,12"
        fill="#5aaca7"
        opacity="0.6"
      />
      <circle cx="16" cy="16" r="3" fill="#218380" />
    </svg>
  );
}
