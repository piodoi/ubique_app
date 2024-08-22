import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, VStack, HStack, Heading, Text, Button, Input, List, ListItem, Grid, useToast, Badge, Flex, FormControl, FormLabel, RadioGroup, Radio, Progress, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { QrReader } from 'react-qr-reader';
import { BellIcon, CheckIcon, TimeIcon, WarningIcon } from '@chakra-ui/icons';
import { app } from './firebaseConfig';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import './i18n';
import LanguageSwitcher from './components/LanguageSwitcher';
import AdminView from './AdminView';
import ErrorBoundary from './components/ErrorBoundary';

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
  const [orders, setOrders] = useState([
    { id: 1, table: 1, items: [1, 2], status: 'pending', progress: 0 },
    { id: 2, table: 2, items: [3, 4], status: 'pending', progress: 0 },
  ]);
  const [waiterNotifications, setWaiterNotifications] = useState([]);
  const [tableCalls, setTableCalls] = useState([]);
  const toast = useToast();

  const [firebaseConnected, setFirebaseConnected] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);

  const clearNotification = (type, index) => {
    if (type === 'order') {
      setWaiterNotifications(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'table') {
      setTableCalls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
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

  // Initialize Firebase and check connection
  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        const messaging = getMessaging(app);
        await messaging.getToken();
        setFirebaseConnected(true);
        setFirebaseError(null);
      } catch (error) {
        console.error('Firebase connection error:', error);
        setFirebaseConnected(false);
        setFirebaseError(error.message);
      }
    };

    checkFirebaseConnection();
  }, []);

  // Initialize Firebase Messaging if connected
  useEffect(() => {
    if (!firebaseConnected) return;

    const messaging = getMessaging(app);

    // Request permission for notifications
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY }).then((currentToken) => {
          if (currentToken) {
            console.log('FCM registration token:', currentToken);
            // TODO: Send the token to your server
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });
      }
    });

    // Handle incoming messages
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      toast({
        title: "New Notification",
        description: payload.notification.body,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    });
  }, [toast]);

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

  // Dummy restaurant account
  const dummyRestaurant = {
    username: 'restaurant',
    password: 'password123',
    role: 'admin',
    plan: 'unlimited'
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

  const handleLogin = () => {
    if (username === dummyRestaurant.username && password === dummyRestaurant.password) {
      setUser(dummyRestaurant);
      toast({
        title: "Admin login successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else if (username === 'waiter' && password === 'password123') {
      setUser({ username: 'waiter', role: 'waiter' });
      toast({
        title: "Waiter login successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Invalid credentials",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
    toast({
      title: "Logged out successfully",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleScan = (result) => {
    if (result) {
      setData(result?.text);
      setScanning(false);
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

// Removed unused navigateMenu function

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
      <ErrorBoundary>
        <Box minHeight="100vh" padding={6}>
          <VStack spacing={6} align="stretch">
            <Heading as="h1" size="xl">Restaurant Management System</Heading>
            <LanguageSwitcher />

            {firebaseError ? (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle mr={2}>Firebase Connection Error</AlertTitle>
                <AlertDescription>Some features may be unavailable.</AlertDescription>
              </Alert>
            ) : null}

            {!user ? (
              <Box>
                <Heading as="h2" size="lg" mb={4}>Welcome</Heading>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading as="h3" size="md" mb={2}>QR Code Scanner</Heading>
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
                  {!firebaseError && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin();
                    }}>
                      <VStack spacing={4} align="stretch">
                        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button type="submit" colorScheme="blue">Login</Button>
                        <Text>Don't have an account? <Button variant="link" onClick={() => setIsSignUp(true)}>Sign Up</Button></Text>
                      </VStack>
                    </form>
                  )}
                  {!firebaseError && (
                    <Button variant="link" size="sm" onClick={() => setIsAdminLogin(true)}>Restaurant Admin Login</Button>
                  )}
                </VStack>
              </Box>
            ) : (
              <>
                <Text>Welcome, {user.username}!</Text>
                <Button colorScheme="red" onClick={handleLogout}>Logout</Button>

                {user.role === 'cook' && (
                  <Box>
                    <Heading as="h2" size="lg" mb={2}>Cook View</Heading>
                    <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                      {orders.map(order => (
                        <Box key={order.id} borderWidth={1} borderRadius="lg" p={4}>
                          <Heading size="md" mb={2}>Order #{order.id} - Table {order.table}</Heading>
                          <Text mb={2}>{order.items.map(item => menuItems.find(mi => mi.id === item)?.name).join(', ')}</Text>
                          <Text mb={4}>Status: {order.status}</Text>
                          <VStack spacing={2}>
                            <Button
                              colorScheme="blue"
                              size="lg"
                              width="100%"
                              onClick={() => updateOrderStatus(order.id, 'started')}
                              isDisabled={order.items.some(item => !menuItems.find(mi => mi.id === item)?.inStock)}
                            >
                              Start Order
                            </Button>
                            <Button
                              colorScheme="green"
                              size="lg"
                              width="100%"
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              isDisabled={order.items.some(item => !menuItems.find(mi => mi.id === item)?.inStock)}
                            >
                              Order Ready
                            </Button>
                            <Button
                              colorScheme="red"
                              size="lg"
                              width="100%"
                              onClick={() => updateOrderStatus(order.id, 'no stock')}
                            >
                              No Stock
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
                  <AdminView
                    user={user}
                    menuItems={menuItems}
                    toggleStockStatus={toggleStockStatus}
                    accounts={accounts}
                    setIsAddingAccount={setIsAddingAccount}
                    handleDeleteAccount={handleDeleteAccount}
                    isAddingAccount={isAddingAccount}
                    newAccount={newAccount}
                    setNewAccount={setNewAccount}
                    addAccount={addAccount}
                    restaurantInfo={restaurantInfo}
                    setRestaurantInfo={setRestaurantInfo}
                  />
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

                <Box mb={6}>
                  <Heading as="h2" size="lg" mb={4}>Welcome to Our Restaurant</Heading>
                  <Text fontSize="lg" mb={4}>Scan a QR code to get started or log in to your account.</Text>
                  <Box width="300px" height="300px" mx="auto" mb={4}>
                    {scanning ? (
                      <QrReader
                        delay={300}
                        onError={handleError}
                        onResult={handleScan}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <Button colorScheme="blue" size="lg" onClick={() => setScanning(true)} width="100%">
                        Start QR Scanning
                      </Button>
                    )}
                  </Box>
                  {data !== 'No result' && (
                    <Text fontSize="lg" mt={2} textAlign="center">Scanned Data: {data}</Text>
                  )}
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
                      <Button onClick={() => {
                        if (newComment.trim()) {
                          setComments([...comments, newComment.trim()]);
                          setNewComment('');
                        }
                      }}>Add</Button>
                    </HStack>
                    <List spacing={3}>
                      {comments.map((comment, index) => (
                        <ListItem key={index}>{comment}</ListItem>
                      ))}
                    </List>
                  </VStack>
                </Box>
              </>
            )}
          </VStack>
        </Box>
      </ErrorBoundary>
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
