export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  skills: string[];
  experience: Experience[];
  education: Education[];
  languages: string[];
  atsScore: number;
  feedback: string;
}

export type TemplateType = "Classic" | "Modern" | "Saffron";

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
  placeholderPrompt: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "hi-IN", name: "Hindi", native: "हिन्दी", placeholderPrompt: "जैसे: 'मेरा नाम राहुल शर्मा है। मैंने बीटेक किया है और मुझे 3 साल का सॉफ्टवेयर इंजीनियरिंग का अनुभव है...'" },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்", placeholderPrompt: "எ.கா: 'என் பெயர் ராகுல். நான் கணினி அறிவியல் கற்றேன் மற்றும் எனக்கு 3 வருட அனுபவம் உள்ளது...'" },
  { code: "te-IN", name: "Telugu", native: "తెలుగు", placeholderPrompt: "ఉదా: 'నా పేరు రాహుల్. నేను సాఫ్ట్‌వేర్ ఇంజనీర్ గా 3 సంవత్సరాల అనుభవం కలిగి ఉన్నాను...'" },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", placeholderPrompt: "ಉದಾ: 'ನನ್ನ ಹೆಸರು ರಾಹುಲ್. ನಾನು ಸಾಫ್ಟ್‌ವೇರ್ ಎಂಜಿನಿಯರಿಂಗ್‌ನಲ್ಲಿ 3 ವರ್ಷಗಳ ಅನುಭವ ಹೊಂದಿದ್ದೇನೆ...'" },
  { code: "ml-IN", name: "Malayalam", native: "മലയാളം", placeholderPrompt: "ഉദാ: 'എൻ്റെ പേര് രാഹുൽ. എനിക്ക് സോഫ്റ്റ്‌വെയർ എഞ്ചിനീയറിംഗിൽ 3 വർഷത്തെ പരിചയമുണ്ട്...'" },
  { code: "bn-IN", name: "Bengali", native: "বাংলা", placeholderPrompt: "যেমন: 'আমার নাম রাহুল। আমি ৩ বছর ধরে সফটওয়্যার ইঞ্জিনিয়ার হিসেবে কাজ করছি...'" },
  { code: "mr-IN", name: "Marathi", native: "मराठी", placeholderPrompt: "उदा: 'माझे नाव राहुल आहे. मला सॉफ्टवेअर डेव्हलपमेंटमध्ये ३ वर्षांचा अनुभव आहे...'" },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી", placeholderPrompt: "દા.ત: 'મારું નામ રાહુલ છે. મને સોફ્ટવેર એન્જિનિયરિંગમાં ૩ વર્ષનો અનુભव છે...'" },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ", placeholderPrompt: "ਉਦਾਹਰਨ: 'ਮੇਰਾ ਨਾਮ ਰਾਹੁਲ ਹੈ। ਮੈਨੂੰ ਸਾਫਟਵੇਅਰ ਇੰਜੀਨੀਅਰਿੰਗ ਵਿੱਚ 3 ਸਾਲ ਦਾ ਤਜਰਬਾ ਹੈ...'" },
  { code: "or-IN", name: "Odia", native: "ଓଡ଼ିଆ", placeholderPrompt: "ଉଦାହରଣ: 'ମୋ ନାମ ରାହୁଲ। ମୋର ସଫ୍ଟୱେର୍ ଇଞ୍ଜିନିୟରିଂରେ ୩ ବର୍ଷର ଅଭିଜ୍ଞତା ଅଛି...'" },
  { code: "en-IN", name: "English", native: "English", placeholderPrompt: "E.g., 'My name is Rahul Sharma. I have a B.Tech in CSE and 3 years of experience in React...'" }
];

export interface SavedResume {
  id: string;
  date: string;
  language: string;
  data: ResumeData;
}
