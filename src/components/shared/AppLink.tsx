"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { usePageLoadingTrigger } from "@/context/PageLoadingContext";

/**
 * Enhanced Link that triggers the branded page loader immediately on route change.
 * Preserves Next's modifier keys, prefetching and standard accessibility attributes.
 */
export default function AppLink({
  href,
  onClick,
  children,
  ...props
}: ComponentProps<typeof NextLink>) {
  const currentPathname = usePathname();
  const startNavigation = usePageLoadingTrigger();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    // Ignore modifier clicks (cmd/ctrl click to open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const targetHref =
      typeof href === "string"
        ? href
        : typeof href === "object" && href !== null
          ? href.pathname || ""
          : "";

    if (
      targetHref &&
      !targetHref.startsWith("http") &&
      !targetHref.startsWith("#") &&
      !targetHref.startsWith("mailto:")
    ) {
      const targetPath = targetHref.split("?")[0].split("#")[0];
      if (targetPath && targetPath !== currentPathname) {
        startNavigation();
      }
    }
  };

  return (
    <NextLink href={href} onClick={handleClick} {...props}>
      {children}
    </NextLink>
  );
}
