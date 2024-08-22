import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box textAlign="center" py={10} px={6}>
          <Heading as="h2" size="xl" mt={6} mb={2}>
            Oops! Something went wrong.
          </Heading>
          <Text color={'gray.500'}>
            We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </Text>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
