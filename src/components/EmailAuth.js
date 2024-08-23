import React, { useState } from 'react';
import { Box, VStack, Input, Button, FormControl, FormLabel, FormErrorMessage, useToast, Text } from '@chakra-ui/react';

const EmailAuth = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (isSignUp) {
        onSignUp(email, password);
      } else {
        onLogin(email, password);
      }
    } else {
      toast({
        title: 'Error',
        description: 'Please correct the errors in the form.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="lg" boxShadow="md">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Text fontSize="xl" fontWeight="bold" textAlign="center">
            {isSignUp ? 'Create an Account' : 'Login to Your Account'}
          </Text>
          <FormControl isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          <Button type="submit" colorScheme="blue" size="lg">
            {isSignUp ? 'Sign Up' : 'Login'}
          </Button>
        </VStack>
      </form>
      <Text mt={4} textAlign="center">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} ml={2}>
          {isSignUp ? 'Login' : 'Sign Up'}
        </Button>
      </Text>
    </Box>
  );
};

export default EmailAuth;
