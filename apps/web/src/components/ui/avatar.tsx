"use client";

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { HTMLAttributes, ImgHTMLAttributes, SyntheticEvent } from "react";
import { cn } from "@web/lib/utils";

type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
};

type AvatarImageProps = ImgHTMLAttributes<HTMLImageElement>;
type AvatarFallbackProps = HTMLAttributes<HTMLSpanElement>;

type AvatarContextValue = {
  imageStatus: "idle" | "loaded" | "error";
  hasImage: boolean;
  setHasImage: (_value: boolean) => void;
  setImageStatus: (_status: "idle" | "loaded" | "error") => void;
};

const AvatarContext = createContext<AvatarContextValue | null>(null);

const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoad, onError, alt = "", ...props }, ref) => {
    const ctx = useContext(AvatarContext);

    useEffect(() => {
      ctx?.setHasImage(true);
    }, [ctx]);

    const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
      ctx?.setImageStatus("loaded");
      onLoad?.(event);
    };

    const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
      ctx?.setImageStatus("error");
      onError?.(event);
    };

    const hidden = ctx?.imageStatus === "error";

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        className={cn("h-full w-full object-cover", hidden && "hidden", className)}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useContext(AvatarContext);
    if (ctx?.hasImage && ctx.imageStatus !== "error") return null;
    return (
      <span ref={ref} className={cn("flex h-full w-full items-center justify-center", className)} {...props}>
        {children}
      </span>
    );
  }
);
AvatarFallback.displayName = "AvatarFallback";



const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
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
    console.log("src", src);
    const hasImageChild = Children.toArray(children).some(
      (child) => isValidElement(child) && child.type === AvatarImage
    );

    const [hasImage, setHasImage] = useState(Boolean(src) || hasImageChild);
    const [imageStatus, setImageStatus] = useState<"idle" | "loaded" | "error">(
      src || hasImageChild ? "idle" : "error"
    );

    useEffect(() => {
      if (src || hasImageChild) {
        setHasImage(true);
        setImageStatus((previous) => (previous === "error" ? "idle" : previous));
        return;
      }
      setHasImage(false);
      setImageStatus("error");
    }, [src, hasImageChild]);

    const value = useMemo<AvatarContextValue>(
      () => ({ imageStatus, hasImage, setHasImage, setImageStatus }),
      [imageStatus, hasImage]
    );
    console.log("Avatar component - src:", src, "hasImage:", hasImage, "imageStatus:", imageStatus);
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
