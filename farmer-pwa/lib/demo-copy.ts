import type { AppLanguage } from "./demo-session";

type PageCopy = {
  loginTitle: string; loginSubtitle: string; identifier: string; identifierPlaceholder: string;
  password: string; showPassword: string; hidePassword: string; remember: string; forgot: string;
  login: string; demoNotice: string; recoveryUnavailable: string; registrationUnavailable: string;
  loginError: string; dashboardTitle: string; dashboardSubtitle: string; language: string;
  signOut: string; heroEyebrow: string; heroTitle: string; heroBody: string;
  soilAnalysis: string; soilAnalysisBody: string; uploadImage: string; soilParameters: string;
  soilHealth: string; cropRecommendations: string; fertilizerRecommendations: string;
  history: string; voice: string; openAnalysis: string; overview: string; heroAlt: string; install: string;
};

export const pageCopy: Record<AppLanguage, PageCopy> = {
  English: {
    loginTitle: "Welcome back", loginSubtitle: "Sign in to your farmer workspace",
    identifier: "Mobile number or email", identifierPlaceholder: "Enter mobile number or email",
    password: "Password", showPassword: "Show password", hidePassword: "Hide password",
    remember: "Remember me on this device", forgot: "Forgot password?", login: "Continue to dashboard",
    demoNotice: "Local demo only. This form does not verify an account. Do not enter a real password.",
    recoveryUnavailable: "Password recovery is not available in this local demo.",
    registrationUnavailable: "Account registration is not connected in this local demo.",
    loginError: "Enter a mobile number or email and a password to continue.",
    dashboardTitle: "Farmer dashboard", dashboardSubtitle: "A practical workspace for your soil checks and crop planning.",
    language: "Language", signOut: "Log out", heroEyebrow: "SOIL FIRST. BETTER DECISIONS.",
    heroTitle: "Know your soil before the next season.",
    heroBody: "Bring your soil-test readings together with image classification and clear, locally cautious guidance.",
    soilAnalysis: "Soil analysis", soilAnalysisBody: "Review a soil photo and enter lab readings.",
    uploadImage: "Upload soil photo", soilParameters: "Enter soil readings", soilHealth: "Soil health",
    cropRecommendations: "Crop suitability", fertilizerRecommendations: "Fertilizer guidance",
    history: "Analysis history", voice: "Voice assistance", openAnalysis: "Open analysis",
    overview: "Your tools", heroAlt: "Illustrated field rows, crops and a seedling growing from a soil profile", install: "Install app",
  },
  Hindi: {
    loginTitle: "वापस स्वागत है", loginSubtitle: "अपने किसान कार्यक्षेत्र में प्रवेश करें",
    identifier: "मोबाइल नंबर या ईमेल", identifierPlaceholder: "मोबाइल नंबर या ईमेल दर्ज करें",
    password: "पासवर्ड", showPassword: "पासवर्ड दिखाएँ", hidePassword: "पासवर्ड छिपाएँ",
    remember: "इस डिवाइस पर याद रखें", forgot: "पासवर्ड भूल गए?", login: "डैशबोर्ड खोलें",
    demoNotice: "केवल स्थानीय डेमो। यह फ़ॉर्म खाते की पुष्टि नहीं करता। असली पासवर्ड न डालें।",
    recoveryUnavailable: "इस स्थानीय डेमो में पासवर्ड पुनर्प्राप्ति उपलब्ध नहीं है।",
    registrationUnavailable: "इस स्थानीय डेमो में खाता पंजीकरण जुड़ा नहीं है।",
    loginError: "आगे बढ़ने के लिए मोबाइल नंबर या ईमेल और पासवर्ड दर्ज करें।",
    dashboardTitle: "किसान डैशबोर्ड", dashboardSubtitle: "मिट्टी की जाँच और फसल योजना के लिए उपयोगी कार्यक्षेत्र।",
    language: "भाषा", signOut: "लॉग आउट", heroEyebrow: "पहले मिट्टी। बेहतर निर्णय।",
    heroTitle: "अगले मौसम से पहले अपनी मिट्टी को जानें।",
    heroBody: "मिट्टी-जाँच के मान, छवि वर्गीकरण और सावधानीपूर्वक सलाह एक जगह देखें।",
    soilAnalysis: "मिट्टी विश्लेषण", soilAnalysisBody: "मिट्टी की तस्वीर देखें और जाँच के मान दर्ज करें।",
    uploadImage: "मिट्टी की तस्वीर अपलोड करें", soilParameters: "मिट्टी के मान दर्ज करें",
    soilHealth: "मिट्टी का स्वास्थ्य", cropRecommendations: "फसल उपयुक्तता",
    fertilizerRecommendations: "उर्वरक मार्गदर्शन", history: "विश्लेषण इतिहास",
    voice: "आवाज़ सहायता", openAnalysis: "विश्लेषण खोलें", overview: "आपके उपकरण",
    heroAlt: "खेत की कतारें, फसलें और मिट्टी से उगता पौधा", install: "ऐप इंस्टॉल करें",
  },
  Kannada: {
    loginTitle: "ಮತ್ತೆ ಸ್ವಾಗತ", loginSubtitle: "ನಿಮ್ಮ ರೈತ ಕಾರ್ಯಕ್ಷೇತ್ರಕ್ಕೆ ಪ್ರವೇಶಿಸಿ",
    identifier: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್", identifierPlaceholder: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್ ನಮೂದಿಸಿ",
    password: "ಪಾಸ್‌ವರ್ಡ್", showPassword: "ಪಾಸ್‌ವರ್ಡ್ ತೋರಿಸಿ", hidePassword: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆಮಾಡಿ",
    remember: "ಈ ಸಾಧನದಲ್ಲಿ ನೆನಪಿಡಿ", forgot: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?", login: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",
    demoNotice: "ಸ್ಥಳೀಯ ಡೆಮೊ ಮಾತ್ರ. ಈ ಫಾರ್ಮ್ ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸುವುದಿಲ್ಲ. ನಿಜವಾದ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಬೇಡಿ.",
    recoveryUnavailable: "ಈ ಸ್ಥಳೀಯ ಡೆಮೊದಲ್ಲಿ ಪಾಸ್‌ವರ್ಡ್ ಮರುಪಡೆಯುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ.",
    registrationUnavailable: "ಈ ಸ್ಥಳೀಯ ಡೆಮೊದಲ್ಲಿ ಖಾತೆ ನೋಂದಣಿ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ.",
    loginError: "ಮುಂದುವರಿಯಲು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.",
    dashboardTitle: "ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", dashboardSubtitle: "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಬೆಳೆ ಯೋಜನೆಗಾಗಿ ಪ್ರಾಯೋಗಿಕ ಕಾರ್ಯಕ್ಷೇತ್ರ.",
    language: "ಭಾಷೆ", signOut: "ಲಾಗ್ ಔಟ್", heroEyebrow: "ಮೊದಲು ಮಣ್ಣು. ಉತ್ತಮ ನಿರ್ಧಾರ.",
    heroTitle: "ಮುಂದಿನ ಋತುವಿಗೆ ಮೊದಲು ನಿಮ್ಮ ಮಣ್ಣನ್ನು ತಿಳಿಯಿರಿ.",
    heroBody: "ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ಅಳತೆಗಳು, ಚಿತ್ರ ವರ್ಗೀಕರಣ ಮತ್ತು ಎಚ್ಚರಿಕೆಯ ಮಾರ್ಗದರ್ಶನವನ್ನು ಒಟ್ಟಿಗೆ ನೋಡಿ.",
    soilAnalysis: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ", soilAnalysisBody: "ಮಣ್ಣಿನ ಚಿತ್ರವನ್ನು ನೋಡಿ ಪ್ರಯೋಗಾಲಯದ ಅಳತೆಗಳನ್ನು ನಮೂದಿಸಿ.",
    uploadImage: "ಮಣ್ಣಿನ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", soilParameters: "ಮಣ್ಣಿನ ಅಳತೆಗಳನ್ನು ನಮೂದಿಸಿ",
    soilHealth: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ", cropRecommendations: "ಬೆಳೆ ಸೂಕ್ತತೆ",
    fertilizerRecommendations: "ರಸಗೊಬ್ಬರ ಮಾರ್ಗದರ್ಶನ", history: "ವಿಶ್ಲೇಷಣೆ ಇತಿಹಾಸ",
    voice: "ಧ್ವನಿ ಸಹಾಯ", openAnalysis: "ವಿಶ್ಲೇಷಣೆ ತೆರೆಯಿರಿ", overview: "ನಿಮ್ಮ ಉಪಕರಣಗಳು",
    heroAlt: "ಹೊಲದ ಸಾಲುಗಳು, ಬೆಳೆಗಳು ಮತ್ತು ಮಣ್ಣಿನಿಂದ ಬೆಳೆಯುವ ಸಸಿ", install: "ಅಪ್‌ನ್ನು ಸ್ಥಾಪಿಸಿ",
  },
  Tamil: {
    loginTitle: "மீண்டும் வருக", loginSubtitle: "உங்கள் விவசாயி பணியிடத்தில் நுழையவும்",
    identifier: "மொபைல் எண் அல்லது மின்னஞ்சல்", identifierPlaceholder: "மொபைல் எண் அல்லது மின்னஞ்சலை உள்ளிடவும்",
    password: "கடவுச்சொல்", showPassword: "கடவுச்சொல்லைக் காட்டு", hidePassword: "கடவுச்சொல்லை மறை",
    remember: "இந்தச் சாதனத்தில் நினைவில் கொள்", forgot: "கடவுச்சொல் மறந்துவிட்டதா?", login: "டாஷ்போர்டுக்குச் செல்",
    demoNotice: "உள்ளூர் டெமோ மட்டும். இந்தப் படிவம் கணக்கைச் சரிபார்க்காது. உண்மையான கடவுச்சொல்லை உள்ளிட வேண்டாம்.",
    recoveryUnavailable: "இந்த உள்ளூர் டெமோவில் கடவுச்சொல் மீட்பு கிடையாது.",
    registrationUnavailable: "இந்த உள்ளூர் டெமோவில் கணக்குப் பதிவு இணைக்கப்படவில்லை.",
    loginError: "தொடர மொபைல் எண் அல்லது மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.",
    dashboardTitle: "விவசாயி டாஷ்போர்டு", dashboardSubtitle: "மண் பரிசோதனை மற்றும் பயிர் திட்டமிடலுக்கான பணியிடம்.",
    language: "மொழி", signOut: "வெளியேறு", heroEyebrow: "மண்ணை அறிந்து. சிறந்த முடிவு.",
    heroTitle: "அடுத்த பருவத்திற்கு முன் உங்கள் மண்ணை அறியுங்கள்.",
    heroBody: "மண் பரிசோதனை அளவுகள், பட வகைப்பாடு மற்றும் எச்சரிக்கையான வழிகாட்டுதலை ஒன்றாகப் பாருங்கள்.",
    soilAnalysis: "மண் பகுப்பாய்வு", soilAnalysisBody: "மண் படத்தைப் பார்த்து ஆய்வக அளவுகளை உள்ளிடவும்.",
    uploadImage: "மண் படத்தைப் பதிவேற்றவும்", soilParameters: "மண் அளவுகளை உள்ளிடவும்",
    soilHealth: "மண் ஆரோக்கியம்", cropRecommendations: "பயிர் பொருத்தம்",
    fertilizerRecommendations: "உர வழிகாட்டுதல்", history: "பகுப்பாய்வு வரலாறு",
    voice: "குரல் உதவி", openAnalysis: "பகுப்பாய்வைத் திற", overview: "உங்கள் கருவிகள்",
    heroAlt: "வயல் வரிசைகள், பயிர்கள் மற்றும் மண்ணிலிருந்து வளரும் செடி", install: "செயலியை நிறுவு",
  },
};