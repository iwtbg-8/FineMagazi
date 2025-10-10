// hreflang-config.js
// Configuration for international targeting with hreflang tags

window.HREFLANG_CONFIG = {
  baseUrl: 'https://finemagazi.com',
  
  // Define regions and their corresponding URL patterns
  // Format: 'language-COUNTRY': 'url-path-prefix'
  regions: {
    // English-speaking markets
    'en-US': '',           // United States (default, no prefix)
    'en-GB': '/uk',        // United Kingdom
    'en-AU': '/au',        // Australia
    'en-CA': '/ca',        // Canada
    'en-IN': '/in',        // India
    'en-SG': '/sg',        // Singapore
    'en-HK': '/hk',        // Hong Kong
    'en-NZ': '/nz',        // New Zealand
    'en-ZA': '/za',        // South Africa
    
    // European markets
    'de-DE': '/de',        // Germany
    'de-AT': '/at',        // Austria
    'de-CH': '/ch',        // Switzerland (German)
    'fr-FR': '/fr',        // France
    'fr-CA': '/fr-ca',     // Canada (French)
    'fr-BE': '/fr-be',     // Belgium (French)
    'fr-CH': '/fr-ch',     // Switzerland (French)
    'es-ES': '/es',        // Spain
    'es-MX': '/mx',        // Mexico
    'es-AR': '/ar',        // Argentina
    'es-CO': '/co',        // Colombia
    'it-IT': '/it',        // Italy
    'pt-PT': '/pt',        // Portugal
    'pt-BR': '/br',        // Brazil
    'nl-NL': '/nl',        // Netherlands
    'nl-BE': '/nl-be',     // Belgium (Dutch)
    'sv-SE': '/se',        // Sweden
    'no-NO': '/no',        // Norway
    'da-DK': '/dk',        // Denmark
    'fi-FI': '/fi',        // Finland
    'pl-PL': '/pl',        // Poland
    'ru-RU': '/ru',        // Russia
    
    // Asian markets
    'ja-JP': '/jp',        // Japan
    'ko-KR': '/kr',        // South Korea
    'zh-CN': '/cn',        // China (Simplified)
    'zh-TW': '/tw',        // Taiwan (Traditional)
    'zh-HK': '/hk-zh',     // Hong Kong (Chinese)
    'th-TH': '/th',        // Thailand
    'vi-VN': '/vn',        // Vietnam
    'id-ID': '/id',        // Indonesia
    'ms-MY': '/my',        // Malaysia
    'hi-IN': '/in-hi',     // India (Hindi)
    'ar-AE': '/ae',        // UAE
    'ar-SA': '/sa',        // Saudi Arabia
    'he-IL': '/il',        // Israel
    'tr-TR': '/tr',        // Turkey
    
    // Default fallback
    'x-default': ''
  },
  
  // Additional configuration options
  options: {
    includeRegionalVariants: true,
    fallbackToDefault: true,
    logErrors: false
  }
};

// Helper function to generate hreflang URLs for a given page
window.generateHreflangUrls = function(currentPath) {
  const config = window.HREFLANG_CONFIG;
  const urls = {};
  
  // Clean the current path
  const cleanPath = currentPath.startsWith('/') ? currentPath : '/' + currentPath;
  
  // Generate URLs for each region
  Object.keys(config.regions).forEach(function(hreflang) {
    const prefix = config.regions[hreflang];
    urls[hreflang] = config.baseUrl + prefix + cleanPath;
  });
  
  return urls;
};

// Function to inject hreflang tags into the document head
window.injectHreflangTags = function(currentPath) {
  const urls = window.generateHreflangUrls(currentPath);
  
  // Remove existing hreflang tags
  document.head.querySelectorAll('link[hreflang]').forEach(function(el) {
    el.remove();
  });
  
  // Add new hreflang tags
  Object.keys(urls).forEach(function(hreflang) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', urls[hreflang]);
    document.head.appendChild(link);
  });
  
  if (window.HREFLANG_CONFIG.options.logErrors) {
    console.log('Hreflang tags injected for:', currentPath, urls);
  }
};