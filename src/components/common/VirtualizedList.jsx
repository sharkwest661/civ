// src/components/common/VirtualizedList.jsx
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Box, Flex } from "@chakra-ui/react";

/**
 * VirtualizedList - A high-performance list component that only renders visible items
 *
 * This component significantly improves performance when rendering large lists by
 * only mounting DOM nodes for items that are currently visible in the viewport.
 *
 * Key benefits:
 * - Much faster initial render time for large lists
 * - Reduced memory usage
 * - Smooth scrolling even with thousands of items
 *
 * @param {Object} props
 * @param {Array} props.items - Array of items to render
 * @param {Function} props.renderItem - Function to render an individual item
 * @param {number} props.itemHeight - Height of each item in pixels
 * @param {number} props.overscan - Number of items to render above/below viewport
 * @param {string} props.height - Container height (CSS value)
 * @param {Object} props.containerProps - Additional props for the container
 */
const VirtualizedList = ({
  items = [],
  renderItem,
  itemHeight = 50,
  overscan = 3,
  height = "400px",
  containerProps = {},
}) => {
  // Ref for the scrolling container
  const containerRef = useRef(null);

  // State to track scroll position
  const [scrollTop, setScrollTop] = useState(0);

  // State to track container height (for dynamic sizing)
  const [containerHeight, setContainerHeight] = useState(0);

  // Total height of all items - used for scroll area sizing
  const totalHeight = items.length * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback((e) => {
    // Use requestAnimationFrame to avoid excessive updates during fast scrolling
    requestAnimationFrame(() => {
      setScrollTop(e.target.scrollTop);
    });
  }, []);

  // Calculate which items to render based on current scroll position
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    // Check for edge cases
    if (!items.length || !containerHeight) {
      return { startIndex: 0, endIndex: 0, offsetY: 0 };
    }

    // Calculate visible range
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);

    // Apply overscan to prevent visible gaps during scrolling
    const startWithOverscan = Math.max(0, start - overscan);
    const endWithOverscan = Math.min(
      items.length - 1,
      start + visibleCount + overscan
    );

    // Calculate offset for positioning visible items
    const offset = startWithOverscan * itemHeight;

    return {
      startIndex: startWithOverscan,
      endIndex: endWithOverscan,
      offsetY: offset,
    };
  }, [items.length, scrollTop, containerHeight, itemHeight, overscan]);

  // Listen for container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateContainerHeight = () => {
      const { height } = containerRef.current.getBoundingClientRect();
      setContainerHeight(height);
    };

    // Initial measurement
    updateContainerHeight();

    // Set up resize observer for responsive sizing
    const resizeObserver = new ResizeObserver(updateContainerHeight);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Debug information
  const debugInfo = useMemo(() => {
    if (process.env.NODE_ENV !== "development") return null;

    const totalItems = items.length;
    const renderedItems = endIndex - startIndex + 1;
    const percentRendered = totalItems
      ? ((renderedItems / totalItems) * 100).toFixed(1)
      : 0;

    return (
      <Box
        position="absolute"
        top="0"
        right="0"
        bg="rgba(0,0,0,0.7)"
        color="white"
        fontSize="xs"
        p={1}
        m={1}
        borderRadius="md"
        zIndex={10}
        opacity={0.7}
        pointerEvents="none"
      >
        Rendering: {renderedItems} / {totalItems} items ({percentRendered}%)
      </Box>
    );
  }, [items.length, startIndex, endIndex]);

  // Slice only the visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  return (
    <Box
      ref={containerRef}
      height={height}
      overflow="auto"
      position="relative"
      onScroll={handleScroll}
      {...containerProps}
    >
      {/* Total height spacer */}
      <Box height={`${totalHeight}px`} position="relative">
        {/* Positioned container for visible items */}
        <Box position="absolute" top={`${offsetY}px`} left="0" width="100%">
          {/* Render only the visible slice of items */}
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <Box
                key={`item-${actualIndex}`}
                height={`${itemHeight}px`}
                width="100%"
              >
                {renderItem(item, actualIndex)}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Debug information for development */}
      {debugInfo}
    </Box>
  );
};

export default React.memo(VirtualizedList);
