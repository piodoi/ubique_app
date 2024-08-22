import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Button, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, HStack, Checkbox } from '@chakra-ui/react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';

function AdminView({ user, restaurantInfo, setRestaurantInfo }) {
  const toast = useToast();

  useEffect(() => {
    // Fetch restaurant info from the database
    // This is a placeholder. Replace with actual API call.
    const fetchRestaurantInfo = async () => {
      // const response = await fetch('/api/restaurant-info');
      // const data = await response.json();
      // setRestaurantInfo(data);
    };
    fetchRestaurantInfo();
  }, []);

  const generateQRCode = (tableIndex) => {
    return `${restaurantInfo.id}-${tableIndex}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRestaurantInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color, type) => {
    setRestaurantInfo(prev => ({ ...prev, [type]: color }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setRestaurantInfo(prev => ({ ...prev, logo: reader.result }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const generateQRCodePage = (tableNumber) => {
      if (tableNumber > 1) pdf.addPage();

      // Set background color
      pdf.setFillColor(restaurantInfo.backgroundColor);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Add logo if exists
      if (restaurantInfo.logo) {
        pdf.addImage(restaurantInfo.logo, 'PNG', 10, 10, 50, 50);
      }

      // Add restaurant name
      pdf.setTextColor(restaurantInfo.textColor);
      pdf.setFontSize(20);
      pdf.text(restaurantInfo.name, pageWidth / 2, 30, { align: 'center' });

      // Add table number or "Unlimited" text
      pdf.setFontSize(16);
      const tableText = restaurantInfo.tables === 'unlimited' ? 'Unlimited Tables' : `Table ${tableNumber}`;
      pdf.text(tableText, pageWidth / 2, 50, { align: 'center' });

      // Add custom text
      if (restaurantInfo.customText) {
        pdf.setFontSize(12);
        pdf.text(restaurantInfo.customText, pageWidth / 2, 70, { align: 'center' });
      }

      // Add QR code
      const qrCode = generateQRCode(tableNumber);
      const canvas = document.createElement('canvas');
      QRCodeCanvas({
        value: qrCode,
        size: 150,
        level: 'H',
      }, canvas);
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', pageWidth / 2 - 75, 90, 150, 150);
    };

    if (restaurantInfo.tables === 'unlimited') {
      // Generate a single QR code for unlimited tables
      generateQRCodePage('unlimited');
    } else {
      // Generate QR codes for each table
      for (let i = 1; i <= restaurantInfo.tables; i++) {
        generateQRCodePage(i);
      }
    }

    pdf.save('restaurant_qr_codes.pdf');
    toast({
      title: 'PDF Generated',
      description: 'QR codes have been generated and downloaded.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>Admin View</Heading>
      <Tabs>
        <TabList>
          <Tab>QR Code Management</Tab>
          <Tab>Restaurant Settings</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Number of Tables</FormLabel>
                <HStack>
                  <Input
                    name="tables"
                    type="number"
                    value={restaurantInfo.tables === 'unlimited' ? '' : restaurantInfo.tables}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRestaurantInfo(prev => ({
                        ...prev,
                        tables: value === '' ? 'unlimited' : parseInt(value, 10)
                      }));
                    }}
                    isDisabled={restaurantInfo.tables === 'unlimited'}
                  />
                  <Checkbox
                    isChecked={restaurantInfo.tables === 'unlimited'}
                    onChange={(e) => setRestaurantInfo(prev => ({
                      ...prev,
                      tables: e.target.checked ? 'unlimited' : 10
                    }))}
                  >
                    Unlimited
                  </Checkbox>
                </HStack>
              </FormControl>
              <Button colorScheme="blue" onClick={generatePDF}>
                Generate QR Codes PDF
              </Button>
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Restaurant Name</FormLabel>
                <Input name="name" value={restaurantInfo.name} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Custom Text</FormLabel>
                <Input name="customText" value={restaurantInfo.customText} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Background Color</FormLabel>
                <Input
                  name="backgroundColor"
                  type="color"
                  value={restaurantInfo.backgroundColor}
                  onChange={(e) => handleColorChange(e.target.value, 'backgroundColor')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Text Color</FormLabel>
                <Input
                  name="textColor"
                  type="color"
                  value={restaurantInfo.textColor}
                  onChange={(e) => handleColorChange(e.target.value, 'textColor')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Logo</FormLabel>
                <Input type="file" accept="image/*" onChange={handleLogoUpload} />
              </FormControl>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default AdminView;
