// src/components/ui/SharedModal.jsx
import React from "react";
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Flex,
} from "@chakra-ui/react";

/**
 * Standardized modal component for consistent dialogs across the application
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {Array} props.actions - Action buttons configuration
 * @param {boolean} props.showCloseButton - Whether to show the close button in the footer
 * @param {string} props.size - Modal size (sm, md, lg, xl, full)
 * @param {Object} props.rest - Additional props passed to Chakra Modal
 */
const SharedModal = ({
  isOpen,
  onClose,
  title,
  children,
  actions = [],
  showCloseButton = true,
  size = "md",
  ...rest
}) => {
  // This prevents the modal from closing when clicking inside it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <ChakraModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      motionPreset="scale"
      isCentered
      {...rest}
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.75)" />
      <ModalContent
        bg="background.panel"
        color="text.primary"
        borderRadius="md"
        borderWidth="1px"
        borderColor="background.highlight"
        onClick={handleContentClick}
        mx={4}
      >
        <ModalHeader
          bg="background.ui"
          borderBottomWidth="1px"
          borderColor="background.highlight"
          color="accent.main"
          fontSize="lg"
          py={3}
        >
          {title}
          <ModalCloseButton size="lg" color="text.secondary" />
        </ModalHeader>

        <ModalBody py={4}>{children}</ModalBody>

        {(actions.length > 0 || showCloseButton) && (
          <ModalFooter
            borderTopWidth="1px"
            borderColor="background.highlight"
            py={3}
          >
            <Flex justify="flex-end" gap={3}>
              {showCloseButton && (
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              )}

              {actions.map((action, index) => (
                <Button
                  key={index}
                  colorScheme={action.colorScheme}
                  onClick={action.onClick}
                  isDisabled={action.isDisabled}
                >
                  {action.label}
                </Button>
              ))}
            </Flex>
          </ModalFooter>
        )}
      </ModalContent>
    </ChakraModal>
  );
};

export default React.memo(SharedModal);
