// src/components/common/ErrorBoundary.jsx
import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Code,
  VStack,
  Divider,
  Flex,
} from "@chakra-ui/react";

/**
 * ErrorBoundary component to catch and display errors gracefully
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // If a reset callback was provided, call it
    if (this.props.onReset) {
      this.props.onReset();
    }

    // If no callback was provided, just refresh the page
    else {
      window.location.reload();
    }
  };

  render() {
    // If no error occurred, render children normally
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Error fallback UI
    return (
      <Box
        p={10}
        bg="background.main"
        color="text.primary"
        h="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <VStack spacing={6} maxW="800px" w="100%" align="flex-start">
          <Heading size="lg" color="status.danger">
            Something went wrong
          </Heading>

          <Text>
            An error occurred in the application. This has been logged and you
            can try resetting the application.
          </Text>

          <Divider />

          <Box w="100%">
            <Heading size="md" mb={2} color="text.primary">
              Error Details:
            </Heading>
            <Code
              p={4}
              bg="background.panel"
              color="status.danger"
              borderRadius="md"
              w="100%"
              display="block"
              whiteSpace="pre-wrap"
              overflowX="auto"
            >
              {this.state.error && this.state.error.toString()}
            </Code>
          </Box>

          {this.state.errorInfo && (
            <Box w="100%">
              <Heading size="md" mb={2} color="text.primary">
                Component Stack:
              </Heading>
              <Code
                p={4}
                bg="background.panel"
                color="text.secondary"
                borderRadius="md"
                w="100%"
                display="block"
                whiteSpace="pre-wrap"
                overflowX="auto"
                fontSize="sm"
                maxH="300px"
                overflowY="auto"
              >
                {this.state.errorInfo.componentStack}
              </Code>
            </Box>
          )}

          <Flex justify="center" w="100%" mt={4}>
            <Button onClick={this.handleReset} variant="primary" size="lg">
              Reset Application
            </Button>
          </Flex>
        </VStack>
      </Box>
    );
  }
}

export default ErrorBoundary;
