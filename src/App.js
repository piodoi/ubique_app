import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, VStack, HStack, Heading, Text, Button, Input, List, ListItem, Grid, useToast, Badge, Flex, FormControl, FormLabel, RadioGroup, Radio, Progress, Switch, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select, Tabs, TabList, TabPanels, TabPanel, Tab } from '@chakra-ui/react';
import { QrReader } from 'react-qr-reader';
import { useTranslation } from 'react-i18next';
import './i18n';
import LanguageSwitcher from './components/LanguageSwitcher';
import AdminView from './AdminView';
import ErrorBoundary from './components/ErrorBoundary';
import EmailAuth from './components/EmailAuth';
import { authenticateUser, createUser } from './services/authService';

function App() {
  const { t } = useTranslation();
  const [data, setData] = useState('No result');
  const [scanning, setScanning] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Burger', price: 10, inStock: true },
    { id: 2, name: 'Fries', price: 5, inStock: true },
    { id: 3, name: 'Pizza', price: 15, inStock: true },
    { id: 4, name: 'Salad', price: 8, inStock: true },
  ]);
  const [currentMenu, setCurrentMenu] = useState([menuItems[0]]);
  const [orders, setOrders] = useState([
    { id: 1, table: 1, items: [1, 2], status: 'pending', progress: 0 },
    { id: 2, table: 2, items: [3, 4], status: 'pending', progress: 0 },
  ]);
  const [waiterNotifications, setWaiterNotifications] = useState([]);
  const [tableCalls, setTableCalls] = useState([]);
  const toast = useToast();

  const [authenticationConnected, setAuthenticationConnected] = useState(false);
  const [authenticationError, setAuthenticationError] = useState(null);

  const clearNotification = (type, index) => {
    if (type === 'order') {
      setWaiterNotifications(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'table') {
      setTableCalls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ username: '', password: '', role: 'waiter' });
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // Payment and voucher system
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('my usual');
  const [voucherBalance, setVoucherBalance] = useState(0);
  const [currentOrderAmount, setCurrentOrderAmount] = useState(0);

  // Restaurant info for AdminView
  const [restaurantInfo, setRestaurantInfo] = useState({
    id: '12345',
    name: 'Sample Restaurant',
    tables: 'unlimited',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    logo: null,
    customText: '',
  });

  // Email-based authentication setup
  useEffect(() => {
    const checkAuthenticationStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // TODO: Implement token validation with your backend
          const user = JSON.parse(localStorage.getItem('user'));
          setUser(user);
          setAuthenticationConnected(true);
          setAuthenticationError(null);
        } else {
          setAuthenticationConnected(false);
          setAuthenticationError(null);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setAuthenticationConnected(false);
        setAuthenticationError(error.message);
      }
    };

    checkAuthenticationStatus();
  }, []);

  // Notification setup
  useEffect(() => {
    if (!authenticationConnected) return;

    // Request permission for notifications
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      }
    });

    // Setup WebSocket or SSE for real-time notifications
    const setupNotifications = () => {
      // TODO: Implement WebSocket or SSE connection
      console.log('Notification setup completed');
    };

    setupNotifications();

    return () => {
      // TODO: Implement cleanup for WebSocket or SSE connection
      console.log('Notification connection closed');
    };
  }, [authenticationConnected]);

  const handlePayment = () => {
    const success = processPayment(selectedPaymentMethod, currentOrderAmount, voucherBalance, setVoucherBalance);
    if (success) {
      toast({
        title: "Payment successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCurrentOrderAmount(0);
    } else {
      toast({
        title: "Payment failed",
        description: "Please try another payment method",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRecommendation = () => {
    const recommendationBonus = 5;
    setVoucherBalance(prevBalance => prevBalance + recommendationBonus);
    toast({
      title: "Recommendation bonus added",
      description: `$${recommendationBonus} added to your voucher balance`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const addVoucher = (amount) => {
    setVoucherBalance(prevBalance => prevBalance + amount);
    toast({
      title: "Voucher added",
      description: `$${amount} added to your voucher balance`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const addAccount = () => {
    if (newAccount.username && newAccount.password) {
      if (user.plan === 'unlimited' || accounts.length < 5) {
        const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
        setAccounts([...accounts, { ...newAccount, id: newId }]);
        setNewAccount({ username: '', password: '', role: 'waiter' });
        setIsAddingAccount(false);
        toast({
          title: "Account added",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Account limit reached",
          description: "Upgrade to unlimited plan to add more accounts",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleDeleteAccount = (accountId) => {
    setAccounts(prevAccounts => prevAccounts.filter(account => account.id !== accountId));
    toast({
      title: "Account deleted",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

const handleLogin = async (email, password) => {
  try {
    const user = await authenticateUser(email, password);
    setUser(user);
    setAuthenticationConnected(true);
    setAuthenticationError(null);
    localStorage.setItem('authToken', user.token);
    localStorage.setItem('user', JSON.stringify(user));
    toast({
      title: "Login successful",
      description: `Welcome, ${user.email}! You are logged in as ${user.role}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (error) {
    console.error('Login error:', error);
    setAuthenticationConnected(false);
    setAuthenticationError(error.message);
    toast({
      title: "Login failed",
      description: error.message || "Invalid credentials. Please try again.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

const handleSignUp = async (email, password) => {
  try {
    const user = await createUser(email, password);
    setUser(user);
    setAuthenticationConnected(true);
    setAuthenticationError(null);
    localStorage.setItem('authToken', user.token);
    localStorage.setItem('user', JSON.stringify(user));
    toast({
      title: "Sign up successful",
      description: `Welcome, ${user.email}! Your account has been created.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    setAuthenticationConnected(false);
    setAuthenticationError(error.message);
    toast({
      title: "Sign up failed",
      description: error.message || "Unable to create account. Please try again.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

const handleLogout = () => {
  setUser(null);
  setAuthenticationConnected(false);
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  toast({
    title: "Logged out successfully",
    status: "info",
    duration: 3000,
    isClosable: true,
  });
};

  useEffect(() => {
    const storedComments = JSON.parse(localStorage.getItem('recentComments')) || [];
    setComments(storedComments);
  }, []);

  const handleScan = (result) => {
    if (result) {
      setData(result?.text);
      setScanning(false);
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  const addComment = () => {
    if (newComment.trim()) {
      const updatedComments = [newComment, ...comments.slice(0, 9)];
      setComments(updatedComments);
      localStorage.setItem('recentComments', JSON.stringify(updatedComments));
      setNewComment('');
    }
  };

  const navigateMenu = (item) => {
    const newPath = [...currentMenu];
    const existingIndex = newPath.findIndex(menuItem => menuItem.id === item.id);
    if (existingIndex !== -1) {
      setCurrentMenu(newPath.slice(0, existingIndex + 1));
    } else {
      setCurrentMenu([...newPath, item]);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    if (newStatus === 'no stock') {
      setMenuItems(prevMenuItems =>
        prevMenuItems.map(item =>
          orders.find(o => o.id === orderId)?.items.includes(item.id)
            ? { ...item, inStock: false }
            : item
        )
      );
    }

    // Send notification (simulated with toast)
    toast({
      title: `Order ${orderId} ${newStatus}`,
      description: `Table ${orders.find(o => o.id === orderId)?.table} order has been ${newStatus}`,
      status: newStatus === 'no stock' ? 'warning' : 'success',
      duration: 3000,
      isClosable: true,
    });

    // Add waiter notification
    if (newStatus === 'ready') {
      setWaiterNotifications(prev => [
        ...prev,
        { orderId, table: orders.find(o => o.id === orderId)?.table }
      ]);
    }
  };

  const toggleStockStatus = (itemId) => {
    setMenuItems(prevMenuItems =>
      prevMenuItems.map(item =>
        item.id === itemId ? { ...item, inStock: !item.inStock } : item
      )
    );
  };

  return (
    <ChakraProvider>
      <Box minHeight="100vh" padding={6}>
        <VStack spacing={6} align="stretch">
          <Flex justifyContent="space-between" alignItems="center" width="100%">
            <Heading as="h1" size="xl">{t('app.title')}</Heading>
            <LanguageSwitcher />
          </Flex>

          {!user ? (
            <ErrorBoundary>
              <Box>
                <Heading as="h2" size="lg" mb={4}>{t('app.welcome')}</Heading>
                <EmailAuth
                  onLogin={handleLogin}
                  onSignUp={handleSignUp}
                />
              </Box>
            </ErrorBoundary>
          ) : (
            <ErrorBoundary>
              <>
                <Text>{t('app.welcome')}, {user.email}!</Text>
                <Button colorScheme="red" onClick={handleLogout}>{t('app.logout')}</Button>

                {user.role === 'cook' && (
                  <Box>
                    <Heading as="h2" size="lg" mb={2}>{t('app.views.cook')}</Heading>
                    <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                      {orders.map(order => (
                        <Box key={order.id} borderWidth={1} borderRadius="lg" p={4}>
                          <Heading size="md" mb={2}>{t('app.order.title', { id: order.id, table: order.table })}</Heading>
                          <Text mb={2}>{order.items.map(item => t(`app.menu.items.${menuItems.find(mi => mi.id === item)?.name.toLowerCase()}`)).join(', ')}</Text>
                          <Text mb={4}>{t('app.order.status.label')}: {t(`app.order.status.${order.status}`)}</Text>
                          <VStack spacing={2}>
                            <Button
                              colorScheme="blue"
                              size="lg"
                              width="100%"
                              onClick={() => updateOrderStatus(order.id, 'started')}
                              isDisabled={order.items.some(item => !menuItems.find(mi => mi.id === item)?.inStock)}
                            >
                              {t('app.order.actions.start')}
                            </Button>
                            <Button
                              colorScheme="green"
                              size="lg"
                              width="100%"
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              isDisabled={order.items.some(item => !menuItems.find(mi => mi.id === item)?.inStock)}
                            >
                              {t('app.order.actions.ready')}
                            </Button>
                            <Button
                              colorScheme="red"
                              size="lg"
                              width="100%"
                              onClick={() => updateOrderStatus(order.id, 'no stock')}
                            >
                              {t('app.order.actions.noStock')}
                            </Button>
                          </VStack>
                        </Box>
                      ))}
                    </Grid>
                  </Box>
                )}

                {user.role === 'waiter' && (
                  <Box>
                    <Heading as="h2" size="lg" mb={2}>Waiter View</Heading>
                    <WaiterView
                      orders={orders}
                      updateOrderStatus={updateOrderStatus}
                      tableCalls={tableCalls}
                      setTableCalls={setTableCalls}
                      waiterNotifications={waiterNotifications}
                      setWaiterNotifications={setWaiterNotifications}
                      clearNotification={clearNotification}
                      menuItems={menuItems}
                    />
                  </Box>
                )}

              {user.role === 'admin' && (
                <Box>
                  <Heading as="h2" size="lg" mb={4}>Admin View</Heading>
                  <Button as="a" href="/admin" colorScheme="teal" mb={4}>
                    Restaurant Admin Login
                  </Button>
                  <AdminView
                    restaurantInfo={restaurantInfo}
                    setRestaurantInfo={setRestaurantInfo}
                    menuItems={menuItems}
                    toggleStockStatus={toggleStockStatus}
                    accounts={accounts}
                    handleDeleteAccount={handleDeleteAccount}
                    addAccount={addAccount}
                    isAddingAccount={isAddingAccount}
                    setIsAddingAccount={setIsAddingAccount}
                    newAccount={newAccount}
                    setNewAccount={setNewAccount}
                    user={user}
                  />
                </Box>
              )}

              {user.role === 'customer' && (
                <Box>
                  <Heading as="h2" size="lg" mb={2}>Customer View</Heading>
                  <VStack spacing={4} align="stretch">
                    <Button
                      colorScheme="blue"
                      size="lg"
                      onClick={() => setTableCalls(prev => [...prev, { table: user.table, time: new Date() }])}
                    >
                      Call Waiter
                    </Button>
                    <Heading as="h3" size="md">Payment</Heading>
                    <Text>Current Order Amount: ${currentOrderAmount.toFixed(2)}</Text>
                    <RadioGroup value={selectedPaymentMethod} onChange={setSelectedPaymentMethod}>
                      <VStack align="start">
                        <Radio value="myUsual">My Usual</Radio>
                        <Radio value="cash">Cash</Radio>
                        <Radio value="card">Card</Radio>
                        <Radio value="voucher">Voucher</Radio>
                      </VStack>
                    </RadioGroup>
                    <Button colorScheme="green" onClick={() => handlePayment(currentOrderAmount)}>Pay</Button>
                    <Text>Voucher Balance: ${voucherBalance.toFixed(2)}</Text>
                    <Button colorScheme="purple" onClick={handleRecommendation}>Recommend a Friend</Button>
                  </VStack>
                </Box>
              )}

              <Box>
                <Heading as="h2" size="lg" mb={2}>QR Code Scanner</Heading>
                {scanning ? (
                  <Box width="300px" height="300px">
                    <QrReader
                      delay={300}
                      onError={handleError}
                      onResult={handleScan}
                      style={{ width: '100%' }}
                    />
                  </Box>
                ) : (
                  <Button colorScheme="blue" onClick={() => setScanning(true)}>
                    Start Scanning
                  </Button>
                )}
                <Text fontSize="lg" mt={2}>Scanned Data: {data}</Text>
              </Box>

              <Box>
                <Heading as="h2" size="lg" mb={2}>Comments</Heading>
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment"
                    />
                    <Button onClick={addComment}>Add</Button>
                  </HStack>
                  <List spacing={3}>
                    {comments.map((comment, index) => (
                      <ListItem key={index}>{comment}</ListItem>
                    ))}
                  </List>
                </VStack>
              </Box>
            </>
          </ErrorBoundary>
        )}
      </VStack>
    </Box>
  </ChakraProvider>
  );
}

export default App;

const WaiterView = ({ orders, updateOrderStatus, waiterNotifications, tableCalls, clearNotification }) => {
  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>Waiter View</Heading>
      <Flex justifyContent="space-between" mb={4}>
        <Box>
          <Heading size="md" mb={2}>Notifications</Heading>
          {waiterNotifications.map((notification, index) => (
            <Flex key={index} alignItems="center" mb={2}>
              <Badge colorScheme="green" mr={2}>Ready</Badge>
              <Text>Order #{notification.orderId} - Table {notification.table}</Text>
              <Button size="sm" ml={2} onClick={() => clearNotification('order', index)}>Clear</Button>
            </Flex>
          ))}
          {tableCalls.map((call, index) => (
            <Flex key={index} alignItems="center" mb={2}>
              <Badge colorScheme="red" mr={2}>Table Call</Badge>
              <Text>Table {call.table} needs assistance</Text>
              <Button size="sm" ml={2} onClick={() => clearNotification('table', index)}>Clear</Button>
            </Flex>
          ))}
        </Box>
      </Flex>
      <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
        {orders.map(order => (
          <Box key={order.id} borderWidth={1} borderRadius="lg" p={4}>
            <Heading size="md" mb={2}>Order #{order.id} - Table {order.table}</Heading>
            <Text mb={2}>Status: {order.status}</Text>
            <Progress value={getOrderProgress(order.status)} colorScheme={getOrderProgressColor(order.status)} mb={2} />
            <Button
              colorScheme="green"
              size="lg"
              width="100%"
              onClick={() => updateOrderStatus(order.id, getNextOrderStatus(order.status))}
              isDisabled={order.status === 'delivered'}
            >
              {getNextOrderStatusText(order.status)}
            </Button>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

const getOrderProgress = (status) => {
  switch (status) {
    case 'pending': return 0;
    case 'preparing': return 33;
    case 'ready': return 66;
    case 'delivered': return 100;
    default: return 0;
  }
};

const getOrderProgressColor = (status) => {
  switch (status) {
    case 'pending': return 'red';
    case 'preparing': return 'yellow';
    case 'ready': return 'green';
    case 'delivered': return 'blue';
    default: return 'gray';
  }
};

const getNextOrderStatus = (currentStatus) => {
  switch (currentStatus) {
    case 'pending': return 'preparing';
    case 'preparing': return 'ready';
    case 'ready': return 'delivered';
    default: return currentStatus;
  }
};

const getNextOrderStatusText = (currentStatus) => {
  switch (currentStatus) {
    case 'pending': return 'Start Preparing';
    case 'preparing': return 'Mark as Ready';
    case 'ready': return 'Deliver Order';
    case 'delivered': return 'Order Completed';
    default: return 'Update Status';
  }
};

const processPayment = (paymentMethod, amount, voucherBalance, setVoucherBalance) => {
  switch (paymentMethod) {
    case 'voucher':
      if (voucherBalance >= amount) {
        setVoucherBalance(prevBalance => prevBalance - amount);
        return { success: true, message: 'Payment successful using voucher.' };
      } else {
        return { success: false, message: 'Insufficient voucher balance.' };
      }
    case 'myUsual':
      return { success: true, message: 'Payment successful using your usual method.' };
    case 'cash':
      return { success: true, message: 'Cash payment received.' };
    case 'card':
      return { success: true, message: 'Card payment processed successfully.' };
    default:
      return { success: false, message: 'Invalid payment method.' };
  }
};
