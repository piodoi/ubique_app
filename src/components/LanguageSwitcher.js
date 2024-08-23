import React, { useState, useEffect } from 'react';
import { Button, HStack, Image } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', countryCode: 'GBR' },
    { code: 'ro', name: 'Română', flag: '🇷🇴', countryCode: 'ROU' },
  ];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
  };

  return (
    <HStack spacing={2}>
      {languages.map((lang) => (
        <Button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          variant={currentLanguage === lang.code ? 'solid' : 'outline'}
          leftIcon={<span role="img" aria-label={lang.name}>{lang.flag}</span>}
        >
          {lang.countryCode}
        </Button>
      ))}
    </HStack>
  );
};

export default LanguageSwitcher;
