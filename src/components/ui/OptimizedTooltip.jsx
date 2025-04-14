// src/components/ui/OptimizedTooltip.jsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Box } from "@chakra-ui/react";

/**
 * OptimizedTooltip - A highly performant tooltip system
 *
 * This component replaces the standard Chakra tooltip with a more efficient implementation
 * that avoids unnecessary re-renders and DOM operations. Key optimizations:
 *
 * 1. Uses a global tooltip portal to avoid recreating tooltips
 * 2. Implements debounced show/hide to prevent flicker
 * 3. Batches position updates for better performance
 * 4. Custom positioning logic that avoids expensive layout calculations
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The element that triggers the tooltip
 * @param {React.ReactNode} props.label - Content to show in the tooltip
 * @param {number} props.delay - Delay before showing tooltip (ms)
 * @param {string} props.placement - Tooltip placement (top, bottom, left, right)
 * @param {Object} props.style - Custom style for the tooltip
 */
const OptimizedTooltip = ({
  children,
  label,
  delay = 500,
  placement = "top",
  style = {},
}) => {
  // Create a singleton portal container for all tooltips
  const getOrCreatePortalContainer = () => {
    let container = document.getElementById("tooltip-portal-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "tooltip-portal-container";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "0";
      container.style.height = "0";
      container.style.zIndex = "10000";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);
    }
    return container;
  };

  // State to control tooltip visibility
  const [isVisible, setIsVisible] = useState(false);

  // State to store tooltip position
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Refs for elements and timers
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const positionUpdateRef = useRef(null);

  // Calculate tooltip position based on trigger element and placement
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Default offset from trigger
    const offset = 10;

    let x = 0;
    let y = 0;

    switch (placement) {
      case "top":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - offset;
        break;
      case "bottom":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + offset;
        break;
      case "left":
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case "right":
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      default:
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - offset;
    }

    // Ensure tooltip stays within viewport
    const padding = 5;
    x = Math.max(
      padding,
      Math.min(x, window.innerWidth - tooltipRect.width - padding)
    );
    y = Math.max(
      padding,
      Math.min(y, window.innerHeight - tooltipRect.height - padding)
    );

    setPosition({ x, y });
  }, [placement]);

  // Start monitoring position if tooltip is visible
  useEffect(() => {
    if (isVisible) {
      // Initial position calculation
      calculatePosition();

      // Update position on scroll and resize
      const handlePositionUpdate = () => {
        // Use requestAnimationFrame to batch position updates
        if (!positionUpdateRef.current) {
          positionUpdateRef.current = requestAnimationFrame(() => {
            calculatePosition();
            positionUpdateRef.current = null;
          });
        }
      };

      window.addEventListener("scroll", handlePositionUpdate, {
        passive: true,
      });
      window.addEventListener("resize", handlePositionUpdate, {
        passive: true,
      });

      return () => {
        window.removeEventListener("scroll", handlePositionUpdate);
        window.removeEventListener("resize", handlePositionUpdate);
        if (positionUpdateRef.current) {
          cancelAnimationFrame(positionUpdateRef.current);
          positionUpdateRef.current = null;
        }
      };
    }
  }, [isVisible, calculatePosition]);

  // Handle showing the tooltip
  const handleMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (!showTimeoutRef.current) {
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        showTimeoutRef.current = null;
      }, delay);
    }
  }, [delay]);

  // Handle hiding the tooltip
  const handleMouseLeave = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (!hideTimeoutRef.current) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        hideTimeoutRef.current = null;
      }, 100); // Short delay to prevent flickering
    }
  }, []);

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (positionUpdateRef.current) {
        cancelAnimationFrame(positionUpdateRef.current);
      }
    };
  }, []);

  // Define default tooltip styles
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
    ...style,
  };

  // Render the tooltip portal
  const renderTooltip = () => {
    if (!isVisible || !label) return null;

    return createPortal(
      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 10000,
          pointerEvents: "none",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 150ms ease-in-out",
          ...defaultStyle,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {label}
      </div>,
      getOrCreatePortalContainer()
    );
  };

  // Wrap children with mouse event handlers and refs
  return (
    <>
      <Box
        as="span"
        ref={triggerRef}
        display="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {children}
      </Box>
      {renderTooltip()}
    </>
  );
};

export default React.memo(OptimizedTooltip);
