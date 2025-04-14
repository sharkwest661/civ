// src/components/ui/ImprovedTooltip.jsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Box } from "@chakra-ui/react";

/**
 * ImprovedTooltip - A highly performant tooltip system that correctly follows mouse movement
 *
 * This version addresses the issues with the previous implementation by:
 * 1. Properly tracking mouse position for accurate cursor following
 * 2. Using mouse position for tooltip placement rather than element position
 * 3. Implementing a more responsive show/hide mechanism
 * 4. Better handling rapid mouse movements across different elements
 */
const ImprovedTooltip = ({
  children,
  label,
  delay = 300,
  offset = 10,
  followCursor = false,
  style = {},
}) => {
  // States
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Refs
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Create or get portal container
  const getPortalContainer = () => {
    let container = document.getElementById("tooltip-portal");
    if (!container) {
      container = document.createElement("div");
      container.id = "tooltip-portal";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "0";
      container.style.height = "0";
      container.style.overflow = "visible";
      container.style.zIndex = "10000";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);
    }
    return container;
  };

  // Update tooltip position based on trigger element or mouse position
  const updatePosition = useCallback(() => {
    if (!isVisible || !triggerRef.current) return;

    let x, y;

    if (followCursor) {
      // Position near cursor
      x = mousePositionRef.current.x + 15;
      y = mousePositionRef.current.y + 15;
    } else {
      // Position based on element
      const rect = triggerRef.current.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top - offset;
    }

    // Get tooltip dimensions (if available)
    if (tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Center horizontally if not following cursor
      if (!followCursor) {
        x -= tooltipRect.width / 2;
      }

      // Position above element if not following cursor
      if (!followCursor) {
        y -= tooltipRect.height;
      }

      // Keep tooltip within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust horizontal position to stay in viewport
      if (x < 10) x = 10;
      if (x + tooltipRect.width > viewportWidth - 10) {
        x = viewportWidth - tooltipRect.width - 10;
      }

      // Adjust vertical position to stay in viewport
      if (y < 10) {
        // If tooltip would appear above the viewport, show it below the element/cursor instead
        if (followCursor) {
          y = mousePositionRef.current.y + offset;
        } else {
          y = rect.bottom + offset;
        }
      }
      if (y + tooltipRect.height > viewportHeight - 10) {
        y = viewportHeight - tooltipRect.height - 10;
      }
    }

    setPosition({ x, y });
  }, [isVisible, offset, followCursor]);

  // Track mouse position
  const handleMouseMove = useCallback(
    (e) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };

      if (isVisible && followCursor) {
        // Update tooltip position immediately if following cursor
        requestAnimationFrame(updatePosition);
      }
    },
    [isVisible, followCursor, updatePosition]
  );

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout for showing tooltip
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      timeoutRef.current = null;
      // Update position immediately after becoming visible
      requestAnimationFrame(updatePosition);
    }, delay);
  }, [delay, updatePosition]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    // Clear show timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Hide tooltip immediately
    setIsVisible(false);
  }, []);

  // Add window-level mouse tracking when tooltip is visible
  useEffect(() => {
    if (isVisible) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isVisible, handleMouseMove]);

  // Update position when tooltip becomes visible or window is resized
  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      };
    }
  }, [isVisible, updatePosition]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Default tooltip style
  const defaultStyle = {
    backgroundColor: "#131e2d",
    color: "#e1e1e1",
    border: "1px solid #2a3c53",
    borderRadius: "4px",
    padding: "8px 12px",
    fontSize: "14px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    maxWidth: "300px",
    wordWrap: "break-word",
    pointerEvents: "none",
    ...style,
  };

  return (
    <>
      <Box
        as="span"
        ref={triggerRef}
        display="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Box>

      {isVisible &&
        label &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: "fixed",
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 10000,
              opacity: 1,
              transition: "opacity 100ms ease-in-out",
              ...defaultStyle,
            }}
          >
            {label}
          </div>,
          getPortalContainer()
        )}
    </>
  );
};

export default React.memo(ImprovedTooltip);
