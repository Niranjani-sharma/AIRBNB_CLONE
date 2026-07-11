// Single shared page container: centered, capped width, with responsive gutters
// (24px mobile · 40px md · 80px lg+). Every page, the navbar, and the footer use
// this so their content aligns vertically. `narrow` is used by the listing detail.
export default function Container({
  children,
  className = "",
  narrow = false,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full px-6 md:px-10 lg:px-20 ${
        narrow ? "max-w-[1120px]" : "max-w-[1280px]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
