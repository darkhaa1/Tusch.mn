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

type AvatarContextValue = {
  imageStatus: "idle" | "loaded" | "error";
  hasImage: boolean;
  setHasImage: (value: boolean) => void;
  setImageStatus: (status: "idle" | "loaded" | "error") => void;
};

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoad, onError, ...props }, ref) => {
    const ctx = React.useContext(AvatarContext);

    React.useEffect(() => {
      ctx?.setHasImage(true);
    }, [ctx]);

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      ctx?.setImageStatus("loaded");
      onLoad?.(event);
    };

    const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      ctx?.setImageStatus("error");
      onError?.(event);
    };

    const hidden = ctx?.imageStatus === "error";

    return (
      <img
        ref={ref}
        className={cn("h-full w-full object-cover", hidden && "hidden", className)}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(AvatarContext);
    if (ctx?.hasImage && ctx.imageStatus !== "error") return null;
    return (
      <span ref={ref} className={cn("flex h-full w-full items-center justify-center", className)} {...props}>
        {children}
      </span>
    );
  }
);
AvatarFallback.displayName = "AvatarFallback";

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

    const hasImageChild = React.Children.toArray(children).some(
      (child) => React.isValidElement(child) && child.type === AvatarImage
    );

    const [hasImage, setHasImage] = React.useState(Boolean(src) || hasImageChild);
    const [imageStatus, setImageStatus] = React.useState<"idle" | "loaded" | "error">(
      src || hasImageChild ? "idle" : "error"
    );

    const value = React.useMemo<AvatarContextValue>(
      () => ({ imageStatus, hasImage, setHasImage, setImageStatus }),
      [imageStatus, hasImage]
    );

    return (
      <AvatarContext.Provider value={value}>
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
              <>
                <AvatarImage src={src} alt={alt} />
                <AvatarFallback>{initials}</AvatarFallback>
              </>
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )
          ) : (
            children
          )}
        </div>
      </AvatarContext.Provider>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar, AvatarImage, AvatarFallback };
export default Avatar;
