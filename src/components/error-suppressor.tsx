"use client";

import { useEffect } from "react";

/**
 * Suppresses harmless React cleanup errors caused by browser extensions
 * that modify the DOM during React's cleanup phase.
 * 
 * This is a development-only issue and doesn't affect production.
 */
export function ErrorSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const originalError = console.error;
    const originalWarn = console.warn;

    // Helper function to check if error should be suppressed
    const shouldSuppress = (message: string): boolean => {
      return (
        message.includes("Failed to execute 'removeChild'") ||
        message.includes("removeChildFromContainer") ||
        message.includes("The node to be removed is not a child") ||
        message.includes("NotFoundError") ||
        (message.includes("removeChild") && message.includes("not a child"))
      );
    };

    // Suppress specific React cleanup errors in console
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      if (shouldSuppress(message)) {
        // Suppress this specific error
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      if (shouldSuppress(message)) {
        // Suppress this specific warning
        return;
      }
      originalWarn.apply(console, args);
    };

    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || "";
      if (shouldSuppress(message)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason) || "";
      if (shouldSuppress(message)) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  return null;
}
