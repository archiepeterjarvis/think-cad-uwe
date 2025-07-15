export function GeometricShapes() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Top right circle */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 animate-float"></div>

      {/* Bottom left triangle */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple/10 rotate-45 animate-float"></div>

      {/* Middle right square */}
      <div className="absolute top-1/3 -right-12 w-32 h-32 bg-orange/10 rotate-12 animate-pulse"></div>

      {/* Middle left hexagon - using clip-path */}
      <div
        className="absolute top-2/3 -left-12 w-40 h-40 bg-teal/10 animate-float"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          animationDelay: "2s",
        }}
      ></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-50"></div>
    </div>
  );
}
