"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
};

type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;
type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>;

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "Avatar", children, fallbackText, ...props }, ref) => {
    const showDefault = !children;
    const initials =
      fallbackText ||
      (alt || "")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      "U";

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-muted-foreground",
          className
        )}
        {...props}
      >
        {showDefault ? (
          src ? (
            <AvatarImage src={src} alt={alt} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )
        ) : (
          children
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(({ className, ...props }, ref) => (
  <img ref={ref} className={cn("h-full w-full object-cover", className)} {...props} />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(({ className, children, ...props }, ref) => (
  <span ref={ref} className={cn("flex h-full w-full items-center justify-center", className)} {...props}>
    {children}
  </span>
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
export default Avatar;
