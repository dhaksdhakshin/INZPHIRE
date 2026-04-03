interface LogoMarkProps {
  className?: string;
}

export default function LogoMark({ className }: LogoMarkProps) {
  const classes = className
    ? className.includes("logo-mark")
      ? className
      : `logo-mark ${className}`
    : "logo-mark";

  return (
    <span className={classes} aria-label="INZPHIRE">
      INZPHIRE
    </span>
  );
}
