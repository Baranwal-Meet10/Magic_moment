import * as React from "react";
import { cn } from "@/lib/utils";

type MobileButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function MobileButton({ className, style, onClick, onPointerDown, disabled, ...props }: MobileButtonProps) {
  const pointerHandled = React.useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch" && onClick && !disabled) {
      pointerHandled.current = true;
      onClick(event as unknown as React.MouseEvent<HTMLButtonElement>);
    }
    onPointerDown?.(event);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (pointerHandled.current) {
      pointerHandled.current = false;
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...props}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      disabled={disabled}
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", ...style }}
      className={cn(className)}
    />
  );
}
