import React, { useState, useRef } from "react";
import { Tooltip, useDisclosure } from "@chakra-ui/react";

/**
 * GameTooltip - A performance-optimized tooltip component with delayed appearance
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The element to wrap with the tooltip
 * @param {React.ReactNode} props.label - The tooltip content
 * @param {number} props.delay - Delay in ms before showing the tooltip (default: 1000ms)
 * @param {Object} props.tooltipProps - Additional props to pass to Chakra Tooltip
 */
const GameTooltip = ({
  children,
  label,
  delay = 1000,
  tooltipProps = {},
  ...rest
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const timerRef = useRef(null);

  // Handle mouse enter - start delay timer
  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onOpen();
    }, delay);
  };

  // Handle mouse leave - clear timer and close tooltip
  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    onClose();
  };

  return (
    <Tooltip
      label={label}
      isOpen={isOpen}
      placement="top"
      hasArrow
      bg="#131e2d"
      color="#e1e1e1"
      borderColor="#2a3c53"
      borderWidth="1px"
      borderRadius="4px"
      fontSize="sm"
      {...tooltipProps}
    >
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        {children}
      </span>
    </Tooltip>
  );
};

export default React.memo(GameTooltip);
