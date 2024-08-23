import axios from 'axios';

// Simulated user database (replace with actual backend integration)
const users = [
  { email: 'testuser@example.com', password: 'password123', role: 'customer' }
];

export const authenticateUser = async (email, password) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      // Generate a mock token (replace with actual token generation)
      const token = btoa(`${email}:${Date.now()}`);
      return { ...user, token };
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export const createUser = async (email, password) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (users.some(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = { email, password, role: 'customer' };
    users.push(newUser);

    // Generate a mock token (replace with actual token generation)
    const token = btoa(`${email}:${Date.now()}`);
    return { ...newUser, token };
  } catch (error) {
    console.error('User creation error:', error);
    throw error;
  }
};
