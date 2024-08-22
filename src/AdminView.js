import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Button, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, ColorPicker } from '@chakra-ui/react';
import { QRCode } from 'qrcode.react';
import jsPDF from 'jspdf';

function AdminView({ user }) {
  const [restaurantInfo, setRestaurantInfo] = useState({
    id: '12345',
    name: 'Sample Restaurant',
    tables: 10,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    logo: null,
    customText: '',
  });
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

    for (let i = 1; i <= restaurantInfo.tables; i++) {
      if (i > 1) pdf.addPage();

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

      // Add table number
      pdf.setFontSize(16);
      pdf.text(`Table ${i}`, pageWidth / 2, 50, { align: 'center' });

      // Add custom text
      if (restaurantInfo.customText) {
        pdf.setFontSize(12);
        pdf.text(restaurantInfo.customText, pageWidth / 2, 70, { align: 'center' });
      }

      // Add QR code
      const qrCode = generateQRCode(i);
      const canvas = document.createElement('canvas');
      QRCode.toCanvas(canvas, qrCode, { width: 150, height: 150 });
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', pageWidth / 2 - 75, 90, 150, 150);
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
          {/* Add other admin tabs here */}
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Restaurant Name</FormLabel>
                <Input name="name" value={restaurantInfo.name} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Number of Tables</FormLabel>
                <Input name="tables" type="number" value={restaurantInfo.tables} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Custom Text</FormLabel>
                <Input name="customText" value={restaurantInfo.customText} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Background Color</FormLabel>
                <ColorPicker value={restaurantInfo.backgroundColor} onChange={(color) => handleColorChange(color, 'backgroundColor')} />
              </FormControl>
              <FormControl>
                <FormLabel>Text Color</FormLabel>
                <ColorPicker value={restaurantInfo.textColor} onChange={(color) => handleColorChange(color, 'textColor')} />
              </FormControl>
              <FormControl>
                <FormLabel>Logo</FormLabel>
                <Input type="file" accept="image/*" onChange={handleLogoUpload} />
              </FormControl>
              <Button colorScheme="blue" onClick={generatePDF}>
                Generate QR Codes PDF
              </Button>
            </VStack>
          </TabPanel>
          {/* Add other admin panels here */}
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default AdminView;
