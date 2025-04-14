// src/components/accessibility/AccessibilityComponents.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook to trap focus within a component (for modals and dialogs)
 *
 * @param {Object} options
 * @param {boolean} options.isActive - Whether the focus trap is active
 * @param {Array<string>} options.excludedSelectors - Selectors to exclude from the focus trap
 * @returns {Object} - Ref to attach to the container element
 */
export const useFocusTrap = ({
  isActive = true,
  excludedSelectors = [],
} = {}) => {
  const containerRef = useRef(null);

  // Handle trapping focus when tab key is pressed
  const handleKeyDown = useCallback(
    (e) => {
      if (!isActive || !containerRef.current || e.key !== "Tab") return;

      const container = containerRef.current;

      // Get all focusable elements
      const focusableElements = Array.from(
        container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        // Filter out excluded elements
        return !excludedSelectors.some((selector) => el.matches(selector));
      });

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Handle shift+tab (backwards navigation)
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      }
      // Handle tab (forward navigation)
      else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    },
    [isActive, excludedSelectors]
  );

  // Initialize focus trap when component mounts or isActive changes
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Save current active element to restore focus when trap is removed
    const previousActiveElement = document.activeElement;

    // Set up event listeners
    document.addEventListener("keydown", handleKeyDown);

    // Focus the first focusable element in the container
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus when the trap is removed
      if (previousActiveElement && "focus" in previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isActive, handleKeyDown]);

  return containerRef;
};

/**
 * Custom hook to manage keyboard navigation for grid-based components
 *
 * @param {Object} options
 * @param {number} options.rowCount - Number of rows in the grid
 * @param {number} options.columnCount - Number of columns in the grid
 * @param {Function} options.onSelect - Callback when an item is selected
 * @returns {Object} - State and handlers for grid navigation
 */
export const useGridNavigation = ({ rowCount, columnCount, onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState([0, 0]); // [row, column]

  const handleKeyDown = useCallback(
    (e) => {
      const [currentRow, currentCol] = selectedIndex;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex([
            (currentRow - 1 + rowCount) % rowCount,
            currentCol,
          ]);
          break;

        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex([(currentRow + 1) % rowCount, currentCol]);
          break;

        case "ArrowLeft":
          e.preventDefault();
          setSelectedIndex([
            currentRow,
            (currentCol - 1 + columnCount) % columnCount,
          ]);
          break;

        case "ArrowRight":
          e.preventDefault();
          setSelectedIndex([currentRow, (currentCol + 1) % columnCount]);
          break;

        case "Enter":
        case " ": // Space key
          e.preventDefault();
          if (onSelect) {
            onSelect(currentRow, currentCol);
          }
          break;

        default:
          break;
      }
    },
    [selectedIndex, rowCount, columnCount, onSelect]
  );

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  };
};

/**
 * Adds skip link to the main content area
 * Should be used at the top of the application
 *
 * @returns {JSX.Element} Skip link component
 */
export const SkipToMainContent = () => {
  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        borderWidth: "0",
        zIndex: "9999",
      }}
      className="skip-to-main"
      // Only show when focused
      onFocus={(e) => {
        e.target.style.position = "fixed";
        e.target.style.width = "auto";
        e.target.style.height = "auto";
        e.target.style.padding = "0.5rem 1rem";
        e.target.style.margin = "1rem";
        e.target.style.overflow = "visible";
        e.target.style.clip = "auto";
        e.target.style.whiteSpace = "normal";
        e.target.style.backgroundColor = "var(--color-background-panel)";
        e.target.style.color = "var(--color-accent-main)";
        e.target.style.fontWeight = "bold";
        e.target.style.border = "2px solid var(--color-accent-main)";
        e.target.style.borderRadius = "4px";
        e.target.style.fontSize = "1rem";
      }}
      onBlur={(e) => {
        e.target.style.position = "absolute";
        e.target.style.width = "1px";
        e.target.style.height = "1px";
        e.target.style.padding = "0";
        e.target.style.margin = "-1px";
        e.target.style.overflow = "hidden";
        e.target.style.clip = "rect(0, 0, 0, 0)";
        e.target.style.whiteSpace = "nowrap";
        e.target.style.borderWidth = "0";
      }}
    >
      Skip to main content
    </a>
  );
};

/**
 * A hidden text component that's only visible to screen readers
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be read by screen readers
 * @returns {JSX.Element} Screen reader only component
 */
export const ScreenReaderOnly = ({ children, ...props }) => {
  return (
    <span
      className="sr-only"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        borderWidth: 0,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

/**
 * A component that announces content changes to screen readers
 *
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the announcer
 * @param {string} props.politeness - ARIA live politeness setting (polite or assertive)
 * @returns {JSX.Element} Announcer component
 */
export const ScreenReaderAnnouncer = ({ id, politeness = "polite" }) => {
  return (
    <div
      id={id}
      aria-live={politeness}
      className="sr-only"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        borderWidth: 0,
      }}
    ></div>
  );
};

export default {
  useFocusTrap,
  useGridNavigation,
  SkipToMainContent,
  ScreenReaderOnly,
  ScreenReaderAnnouncer,
};
