import * as React from "react";
import { cn } from "@/lib/utils";

type MobileButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function MobileButton({ className, style, onClick, onTouchStart, ...props }: MobileButtonProps) {
  const touchStarted = React.useRef(false);

  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    touchStarted.current = true;
    onTouchStart?.(event);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (touchStarted.current) {
      touchStarted.current = false;
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...props}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", ...style }}
      className={cn(className)}
    />
  );
}
