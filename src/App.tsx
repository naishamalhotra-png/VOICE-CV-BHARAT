import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, Square, Sparkles, Download, History, Globe2, ArrowRight, Lock, 
  User, CheckCircle2, ListChecks, RefreshCw, Play, Trash2, LogOut, 
  Eye, FileText, ChevronRight, Award, Edit, Volume2, Info, Check, Plus
} from "lucide-react";
import { LANGUAGES, LanguageOption, ResumeData, TemplateType, SavedResume } from "./types";
import ResumeTemplate from "./components/ResumeTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const FEEDBACK_STRINGS: Record<string, {
  recordingStarted: string;
  recordingLive: string;
  readyForCapture: string;
  processingSTT: string;
  processingTranslation: string;
  processingGemini: string;
  processingResume: string;
  resumeReady: string;
}> = {
  "hi-IN": {
    recordingStarted: "रिकॉर्डिंग शुरू हो गई है",
    recordingLive: "रिकॉर्डिंग लाइव है",
    readyForCapture: "ध्वनि रिकॉर्डिंग के लिए तैयार",
    processingSTT: "सरवम एआई सारिका ट्रांसक्राइब कर रहा है...",
    processingTranslation: "सरवम एआई अनुवाद कर रहा है...",
    processingGemini: "जेमिनी आपके रेज़्यूमे को प्रारूपित कर रहा है...",
    processingResume: "आपके रेज़्यूमे को प्रोसेस किया जा रहा है",
    resumeReady: "आपका रेज़्यूमे तैयार है!"
  },
  "ta-IN": {
    recordingStarted: "பதிவு செய்யத் தொடங்கப்பட்டது",
    recordingLive: "நேரடி பதிவு செய்யப்படுகிறது",
    readyForCapture: "ஒலிப் பதிவுக்குத் தயார்",
    processingSTT: "ஸர்வம் ஏஐ தட்டச்சு செய்கிறது...",
    processingTranslation: "ஸர்வம் ஏஐ மொழிபெயர்க்கிறது...",
    processingGemini: "ஜெமினி உங்கள் சுயவிவரத்தை உருவாக்குகிறது...",
    processingResume: "உங்கள் சுயவிவரம் செயலாக்கப்படுகிறது",
    resumeReady: "உங்கள் சுயவிவரம் தயாராக உள்ளது!"
  },
  "te-IN": {
    recordingStarted: "రికార్డింగ్ ప్రారంభమైంది",
    recordingLive: "లైవ్ రికార్డింగ్ జరుగుతోంది",
    readyForCapture: "వాయిస్ రికార్డింగ్ కోసం సిద్ధంగా ఉంది",
    processingSTT: "సర్వం ఏఐ ట్రాన్స్‌క్రైబ్ చేస్తోంది...",
    processingTranslation: "సర్వం ఏఐ అనువదిస్తోంది...",
    processingGemini: "జెమిని మీ రెజ్యూమెను సిద్ధం చేస్తోంది...",
    processingResume: "మీ రెజ్యూమెను సిద్ధం చేస్తున్నాము",
    resumeReady: "మీ రెజ్యూమె సిద్ధంగా ఉంది!"
  },
  "kn-IN": {
    recordingStarted: "ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭವಾಗಿದೆ",
    recordingLive: "ಲೈವ್ ರೆಕಾರ್ಡಿಂಗ್ ನಡೆಯುತ್ತಿದೆ",
    readyForCapture: "ರೆಕಾರ್ಡಿಂಗ್‌ಗೆ ಸಿದ್ಧವಾಗಿದೆ",
    processingSTT: "ಸರ್ವಮ್ ಎಐ ಪ್ರತಿಲಿಪಿ ಮಾಡುತ್ತಿದೆ...",
    processingTranslation: "ಸರ್ವಮ್ ಎಐ ಅನುವಾದಿಸುತ್ತಿದೆ...",
    processingGemini: "ಜೆಮಿನಿ ನಿಮ್ಮ ರೆಸ್ಯೂಮೆಯನ್ನು ರೂಪಿಸುತ್ತಿದೆ...",
    processingResume: "ನಿಮ್ಮ ರೆಸ್ಯೂಮೆಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ",
    resumeReady: "ನಿಮ್ಮ ರೆಸ್ಯೂಮೆ ಸಿದ್ಧವಾಗಿದೆ!"
  },
  "ml-IN": {
    recordingStarted: "റെക്കോർഡിംഗ് ആരംഭിച്ചു",
    recordingLive: "തത്സമയ റെക്കോർഡിംഗ്",
    readyForCapture: "റെക്കോർഡിംഗിനായി തയ്യാറാണ്",
    processingSTT: "സർവ്വം എഐ ട്രാൻസ്ക്രൈബ് ചെയ്യുന്നു...",
    processingTranslation: "സർവ്വം എഐ വിവർത്തനം ചെയ്യുന്നു...",
    processingGemini: "ജെമിനി ബയോഡാറ്റ രൂപപ്പെടുത്തുന്നു...",
    processingResume: "നിങ്ങളുടെ ബയോഡാറ്റ തയ്യാറാക്കുന്നു",
    resumeReady: "നിങ്ങളുടെ ബയോഡാറ്റ തയ്യാറാണ്!"
  },
  "bn-IN": {
    recordingStarted: "রেকর্ডিং শুরু হয়েছে",
    recordingLive: "লাইভ রেকর্ডিং চলছে",
    readyForCapture: "রেকর্ডিংয়ের জন্য প্রস্তুত",
    processingSTT: "সর্বম এআই ট্রান্সক্রাইব করছে...",
    processingTranslation: "সর্বম এআই অনুবাদ করছে...",
    processingGemini: "জেমিনি আপনার জীবনবৃত্তান্ত প্রস্তুত করছে...",
    processingResume: "আপনার জীবনবৃত্তান্ত প্রক্রিয়া করা হচ্ছে",
    resumeReady: "আপনার জীবনবৃত্তান্ত প্রস্তুত!"
  },
  "mr-IN": {
    recordingStarted: "रेकॉर्डिंग सुरू झाले आहे",
    recordingLive: "थेट रेकॉर्डिंग सुरू आहे",
    readyForCapture: "रेकॉर्डिंगसाठी तयार",
    processingSTT: "सर्वम एआय ट्रान्सक्राईब करत आहे...",
    processingTranslation: "सर्वम एआय भाषांतर करत आहे...",
    processingGemini: "जेमिनी तुमचे रेझ्युमे बनवत आहे...",
    processingResume: "तुमच्या रेझ्युमेवर प्रक्रिया केली जात आहे",
    resumeReady: "तुमचा रेझ्युमे तयार आहे!"
  },
  "gu-IN": {
    recordingStarted: "રેકોર્ડિંગ શરૂ થયું છે",
    recordingLive: "લાઈવ રેકોર્ડિંગ શરૂ છે",
    readyForCapture: "રેકોર્ડિંગ માટે તૈયાર",
    processingSTT: "સરવમ એઆઈ લખાણ કરી રહ્યું છે...",
    processingTranslation: "સરવમ એઆઈ અનુવાદ કરી રહ્યું છે...",
    processingGemini: "જેમિની તમારું રેઝ્યૂમે તૈયાર કરી રહ્યું છે...",
    processingResume: "તમારા રેઝ્યૂમે પર પ્રક્રિયા થઈ રહી છે",
    resumeReady: "તમારું રેઝ્યૂમે તૈયાર છે!"
  },
  "pa-IN": {
    recordingStarted: "ਰਿਕਾਰਡਿੰਗ ਸ਼ੁਰੂ ਹੋ ਗਈ ਹੈ",
    recordingLive: "ਲਾਈਵ ਰਿਕਾਰਡਿੰਗ ਚੱਲ ਰਹੀ ਹੈ",
    readyForCapture: "ਰਿਕਾਰਡਿੰਗ ਲਈ ਤਿਆਰ",
    processingSTT: "ਸਰਵਮ ਏਆਈ ਟ੍ਰਾਂਸਕ੍ਰਾਈਬ ਕਰ ਰਹੀ ਹੈ...",
    processingTranslation: "ਸਰਵਮ ਏਆਈ ਅਨੁਵਾਦ ਕਰ ਰਹੀ ਹੈ...",
    processingGemini: "ਜੀਮਿਨੀ ਤੁਹਾਡੀ ਰੈਜ਼ਿਊਮੇ ਤਿਆਰ ਕਰ ਰਹੀ ਹੈ...",
    processingResume: "ਤੁਹਾਡੀ ਰੈਜ਼ਿਊਮੇ 'ਤੇ ਪ੍ਰਕਿਰਿਆ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ",
    resumeReady: "ਤੁਹਾਡੀ ਰੈਜ਼ਿਊਮੇ ਤਿਆਰ ਹੈ!"
  },
  "or-IN": {
    recordingStarted: "ରେକର୍ଡିଂ ଆରମ୍ଭ ହୋଇଛି",
    recordingLive: "ଲାଇଭ୍ ରେକର୍ଡିଂ ଚାଲିଛି",
    readyForCapture: "ରେକର୍ଡିଂ ପାଇଁ ପ୍ରସ୍ତୁତ",
    processingSTT: "ସର୍ବମ୍ ଏଆଇ ଟ୍ରାନ୍ସକ୍ରାଇବ୍ କରୁଛି...",
    processingTranslation: "ସର୍ବମ୍ ଏଆଇ ଅਨୁବାଦ କରୁଛି...",
    processingGemini: "ଜେମିନି ଆପଣଙ୍କର ରେଜୁମେ ପ୍ରସ୍ତୁତ କରୁଛି...",
    processingResume: "ଆପଣଙ୍କର ରେଜୁମେ ପ୍ରକ୍ରିୟାକରଣ ଚାଲିଛି",
    resumeReady: "ଆପଣଙ୍କର ରେଜୁମେ ପ୍ରସ୍ତୁତ ଅଛି!"
  },
  "en-IN": {
    recordingStarted: "Recording started",
    recordingLive: "Recording Live",
    readyForCapture: "Ready for Acoustic capture",
    processingSTT: "Sarvam AI Saarika v2.5 STT transcribing...",
    processingTranslation: "Sarvam AI translating raw speech to English...",
    processingGemini: "Gemini formatting unstructured transcript...",
    processingResume: "Processing your resume",
    resumeReady: "Your resume is ready"
  }
};

const speakAgentMessage = (text: string, languageCode: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  
  const cleanLang = languageCode === "or-IN" ? "od-IN" : languageCode;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = cleanLang;
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  utterance.volume = 1;

  let spoken = false;

  const setVoice = () => {
    if (spoken) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    spoken = true;
    
    const normalizeLang = (l: string) => l.toLowerCase().replace("_", "-");
    const targetNormalized = normalizeLang(cleanLang);
    const langPrefix = targetNormalized.split("-")[0];
    
    const preferred = voices.find(v =>
      normalizeLang(v.lang) === targetNormalized && v.localService === true
    ) || voices.find(v =>
      normalizeLang(v.lang) === targetNormalized
    ) || voices.find(v =>
      normalizeLang(v.lang).startsWith(langPrefix)
    );

    if (preferred) {
      utterance.voice = preferred;
      utterance.lang = preferred.lang;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    setVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      setVoice();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState<"HOME" | "AUTH" | "APP">("HOME");
  const [isLogin, setIsLogin] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  
  // Workspace App State
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [processingStep, setProcessingStep] = useState<"" | "STT" | "TRANSLATING" | "GEMINI" | "COMPLETE">("");
  const [processingError, setProcessingError] = useState("");
  
  // Form input transcript (user can edit before calling AI generation)
  const [transcriptText, setTranscriptText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  
  // Output state
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>("Modern");
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Audio recording helpers
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(10));

  // Load state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("voicecv_active_user");
    if (savedUser) {
      setLoggedInUser(savedUser);
      setCurrentView("APP");
    }
    
    const localResumes = localStorage.getItem("voicecv_saved_resumes");
    if (localResumes) {
      setSavedResumes(JSON.parse(localResumes));
    }
  }, []);

  // Save resumes whenever changed
  const saveToLocalResumes = (updated: SavedResume[]) => {
    setSavedResumes(updated);
    localStorage.setItem("voicecv_saved_resumes", JSON.stringify(updated));
  };

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 29) {
            // Auto stop recording to prevent exceeding the 30-second API limit
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              try {
                mediaRecorderRef.current.stop();
              } catch (e) {
                console.error("Auto stop recording error:", e);
              }
              setIsRecording(false);
              if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
              }
              if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => {});
              }
              if (mediaRecorderRef.current.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
              }
            }
            return 29;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Clean visual levels animation loop
  const drawAudioWave = () => {
    if (!isRecording) return;
    analyserRef.current?.getByteFrequencyData(new Uint8Array(20));
    const dummyLevels = Array.from({ length: 20 }, () => {
      // Create active natural looking wave jump
      return Math.floor(Math.random() * 45) + 10;
    });
    setAudioLevels(dummyLevels);
    animationFrameRef.current = requestAnimationFrame(drawAudioWave);
  };

  // Auth Operations
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;

    if (isLogin) {
      // Login flow
      localStorage.setItem("voicecv_active_user", userEmail);
      setLoggedInUser(userEmail);
      setCurrentView("APP");
    } else {
      // Signup flow
      localStorage.setItem("voicecv_user_name", userName || "Indian Professional");
      localStorage.setItem("voicecv_active_user", userEmail);
      setLoggedInUser(userEmail);
      setCurrentView("APP");
    }
  };

  const handleGuestMode = () => {
    localStorage.setItem("voicecv_active_user", "Guest User");
    setLoggedInUser("Guest User");
    setCurrentView("APP");
  };

  const handleLogout = () => {
    localStorage.removeItem("voicecv_active_user");
    setLoggedInUser(null);
    setGeneratedResume(null);
    setAudioUrl(null);
    setTranscriptText("");
    setTranslatedText("");
    setProcessingStep("");
    setCurrentView("HOME");
  };

  // Start Audio Recording
  const startRecording = async () => {
    setProcessingError("");
    setAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Audiocontext setup for visualizer
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch (e) {
        console.warn("Visualizer context failed:", e);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Auto convert to transcription text after record stop to make workflow smooth
        processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      // Start visualization
      drawAudioWave();
      
      const strings = FEEDBACK_STRINGS[selectedLang.code] || FEEDBACK_STRINGS["en-IN"];
      speakAgentMessage(strings.recordingStarted, selectedLang.code);
    } catch (err: any) {
      console.error("Recording start error:", err);
      setProcessingError("Microphone permission was denied or is unavailable in your iframe window context. You can click 'Load Preset Voice Transcript' to demo AI capabilities instantly!");
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop media tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  // Load Mock Pre-filled Indian Professional transcripts per language
  const loadPresetTranscript = () => {
    const presets: Record<string, { trans: string; transEng: string }> = {
      "hi-IN": {
        trans: "मेरा नाम विजय कुमार है। मैं उत्तर प्रदेश का रहने वाला हूँ। मैंने सीएसई में बीटेक किया है और मुझे दो साल का अनुभव है। मेरी विशेषता रेएक्ट और जावास्क्रिप्ट में है। मैंने कई ई-कॉमर्स वेबसाइट्स बनाई हैं।",
        transEng: "My name is Vijay Kumar. I live in Uttar Pradesh. I have completed my B.Tech in CSE and I have two years of professional experience. My core expertise is in React and JavaScript. I have built several e-commerce web applications."
      },
      "ta-IN": {
        trans: "என் பெயர் கார்த்திக். நான் சென்னையில் ஒரு மென்பொருள் பொறியாளராக 3 வருட அனுபவத்துடன் பணிபுரிகிறேன். எனது முக்கிய திறன்கள் கோட்லின், ஆண்ட்ராய்டு மற்றும் ஜாவா. நான் மொபைல் பயன்பாடுகளை உருவாக்குகிறேன்.",
        transEng: "My name is Karthik. I work as a Software Engineer in Chennai with 3 years of experience. My primary skills are Kotlin, Android, and Java. I specialize in building mobile applications."
      },
      "te-IN": {
        trans: "నా పేరు సురేష్. నేను హైదరాబాద్ లో నివసిస్తున్నాను. నేను 4 సంవత్సరాలుగా డాట్ నెట్ డెవలపర్ గా పనిచేస్తున్నాను. నా విద్యార్హత ఎమ్మెస్సీ కంప్యూటర్స్. సాఫ్ట్‌వేర్ ఆర్కిటెక్చర్ లో నాకు మంచి పట్టు ఉంది.",
        transEng: "My name is Suresh. I live in Hyderabad. I have been working as a .NET Developer for 4 years. My educational qualification is M.Sc. in Computers. I have good knowledge of software architecture."
      },
      "en-IN": {
        trans: "I am Anjali Sharma, from Noida. I graduated with a degree in Information Technology in 2021. For the last 3 years, I have been a Senior UI Designer, working on Figma, Tailwind, and React design frameworks. I love creating spectacular user experiences.",
        transEng: "I am Anjali Sharma, from Noida. I graduated with a degree in Information Technology in 2021. For the last 3 years, I have been a Senior UI Designer, working on Figma, Tailwind, and React design frameworks. I love creating spectacular user experiences."
      }
    };

    const preset = presets[selectedLang.code] || presets["en-IN"];
    setTranscriptText(preset.trans);
    setTranslatedText(preset.transEng);
    setAudioUrl(null);
    setAudioBlob(null);
    setProcessingError("");
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Pipeline Processing
  const processAudio = async (targetBlob: Blob) => {
    try {
      setProcessingStep("STT");
      setProcessingError("");
      
      const strings = FEEDBACK_STRINGS[selectedLang.code] || FEEDBACK_STRINGS["en-IN"];
      speakAgentMessage(strings.processingResume, selectedLang.code);
      
      const base64Audio = await blobToBase64(targetBlob);
      
      // 1. Send to STT endpoint proxy
      const sttResponse = await fetch("/api/stt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          audioBase64: base64Audio,
          language_code: selectedLang.code
        })
      });

      if (!sttResponse.ok) {
        throw new Error("Transcribing original speech failed on backend");
      }

      const sttData = await sttResponse.json();
      const rawTranscript = sttData.transcript || "";
      
      if (!rawTranscript) {
        throw new Error("We couldn't hear any words. Try repeating more slowly in your native dialect.");
      }

      setTranscriptText(rawTranscript);

      // 2. Call Translate
      setProcessingStep("TRANSLATING");
      
      const translateResponse = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: rawTranscript,
          source_language_code: selectedLang.code
        })
      });

      if (!translateResponse.ok) {
        throw new Error("Translating transcript to English failed.");
      }

      const translateData = await translateResponse.json();
      const engTranslation = translateData.translated_text || rawTranscript;
      setTranslatedText(engTranslation);

      // 3. Auto Trigger AI Resume Extraction from English transcript
      generateResumeFromInputs(engTranslation);

    } catch (err: any) {
      console.error("Pipeline failure:", err);
      setProcessingError(err.message || "An unexpected network or gateway error occurred during regional sound synthesis.");
      setProcessingStep("");
    }
  };

  // Final Action: Send transcript to Gemini for structuring
  const generateResumeFromInputs = async (finalEnglishText: string) => {
    try {
      setProcessingStep("GEMINI");
      setProcessingError("");

      const response = await fetch("/api/resume-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transcript: finalEnglishText || translatedText,
          originalLanguage: selectedLang.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "AI intelligence resume formatting failed.");
      }

      const resumeJson: ResumeData = await response.json();
      setGeneratedResume(resumeJson);
      setProcessingStep("COMPLETE");

      if (resumeJson.agentMessage) {
        speakAgentMessage(resumeJson.agentMessage, selectedLang.code);
      } else {
        const strings = FEEDBACK_STRINGS[selectedLang.code] || FEEDBACK_STRINGS["en-IN"];
        speakAgentMessage(strings.resumeReady, selectedLang.code);
      }

      // Save to historic resume logs in local storage
      const newResumeRecord: SavedResume = {
        id: "res_" + Date.now(),
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
        language: selectedLang.name,
        data: resumeJson
      };
      
      const updatedList = [newResumeRecord, ...savedResumes];
      saveToLocalResumes(updatedList);

    } catch (err: any) {
      console.error("Gemini failed:", err);
      setProcessingError(err.message || "AI intelligence modeling failed to structure the outputs.");
      setProcessingStep("");
    }
  };

  // Restore previous resume to dashboard view
  const loadSavedResume = (hist: SavedResume) => {
    setGeneratedResume(hist.data);
    setTranscriptText("");
    setTranslatedText("");
    setProcessingStep("COMPLETE");
    
    // Find back language object
    const matchedLang = LANGUAGES.find(l => l.name === hist.language);
    if (matchedLang) {
      setSelectedLang(matchedLang);
      if (hist.data.agentMessage) {
        speakAgentMessage(hist.data.agentMessage, matchedLang.code);
      } else {
        const strings = FEEDBACK_STRINGS[matchedLang.code] || FEEDBACK_STRINGS["en-IN"];
        speakAgentMessage(strings.resumeReady, matchedLang.code);
      }
    }
  };

  // Delete saved historic item
  const deleteSavedResume = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedResumes.filter(item => item.id !== id);
    saveToLocalResumes(filtered);
  };

  // Download PDF Document Action (FIX 3)
  const downloadPDF = async () => {
    const element = document.getElementById('resume-preview-container');
    if (!element) return;
    
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedRoot = clonedDoc.getElementById('resume-preview-container');
          const originalRoot = document.getElementById('resume-preview-container');
          if (!clonedRoot || !originalRoot) return;

          const clonedElements = clonedRoot.getElementsByTagName('*');
          const originalElements = originalRoot.getElementsByTagName('*');

          const colorProps = [
            'color', 
            'backgroundColor', 
            'borderColor', 
            'borderTopColor', 
            'borderRightColor', 
            'borderBottomColor', 
            'borderLeftColor',
            'fill',
            'stroke'
          ];

          const fixStyling = (orig: HTMLElement, clone: HTMLElement) => {
            const computed = window.getComputedStyle(orig);
            for (const prop of colorProps) {
              const val = computed[prop as keyof CSSStyleDeclaration];
              if (typeof val === 'string' && val) {
                if (val.includes('oklch') || val.includes('oklab')) {
                  if (prop === 'color') {
                    clone.style.color = '#1f2937';
                  } else if (prop === 'backgroundColor') {
                    clone.style.backgroundColor = '#ffffff';
                  } else if (prop.startsWith('border')) {
                    clone.style[prop as any] = '#e5e7eb';
                  }
                } else {
                  clone.style[prop as any] = val;
                }
              }
            }
          };

          fixStyling(originalRoot as HTMLElement, clonedRoot as HTMLElement);

          for (let i = 0; i < originalElements.length; i++) {
            const orig = originalElements[i] as HTMLElement;
            const clone = clonedElements[i] as HTMLElement;
            if (orig && clone) {
              fixStyling(orig, clone);
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      
      const totalPages = Math.ceil((imgHeight * ratio) / pdfHeight);
      
      for (let page = 0; page < totalPages; page++) {
  if (page > 0) pdf.addPage();
  pdf.addImage(
    imgData,
    'PNG',
    imgX,
    -(page * pdfHeight),   // ← negative offset scrolls the image up each page
    imgWidth * ratio,
    imgHeight * ratio
  );
}
      
      const resumeData = { name: generatedResume?.personalInfo?.name };
      const candidateName = resumeData?.name || 'Resume';
      pdf.save(candidateName + '_VoiceCV.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF download failed. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Custom UI Elements
  const renderATSGauge = (score: number) => {
    const radius = 40;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-2xl">
        <div className="relative flex items-center justify-center w-24 h-24">
          <svg className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-white/10 fill-none"
              strokeWidth={strokeWidth}
            />
            {/* Animated gauge fill */}
            <motion.circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-amber-500 fill-none"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-bold font-sans text-amber-500">{score}</span>
            <span className="text-[10px] text-zinc-400 block -mt-1 font-mono uppercase">ATS</span>
          </div>
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
            <Award size={15} className="text-amber-500" />
            Vocal ATS score
          </h4>
          <p className="text-xs text-zinc-300 mt-1 italic font-sans leading-snug">
            "{generatedResume?.feedback || 'Your vocal resume compiles beautifully!'}"
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#08060f] text-zinc-100 relative overflow-hidden font-sans">
      
      {/* Universal Floating Purple & Emerald Glow Dust & Ambient Spheres */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] bg-violet-900/15 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-120px] right-[-120px] w-[500px] h-[500px] bg-teal-900/15 blur-[120px] rounded-full"></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-indigo-900/5 blur-[150px] rounded-full"></div>
        
        {Array.from({ length: 15 }).map((_, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-violet-500/10 blur-[2px]"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-25, -200],
              x: [0, Math.random() * 40 - 20],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 12,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <header className="border-b border-white/5 bg-[#08060f]/60 backdrop-blur-md sticky top-0 z-50 transition w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView("HOME")} id="nav-logo">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200">
              <Mic className="text-white shrink-0" size={19} />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold tracking-tight text-white">Voice<span className="text-violet-500">CV</span></span>
              <span className="text-[10px] text-teal-400 block -mt-1 tracking-wider uppercase font-mono font-bold">Bharat Regional</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loggedInUser ? (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-xl">
                <div className={`w-2 h-2 rounded-full ${loggedInUser === "Guest User" ? "bg-emerald-500" : "bg-violet-400 animate-pulse"}`}></div>
                <span className="text-xs text-zinc-300 font-semibold max-w-[150px] truncate">
                  {loggedInUser === "Guest User" ? "Guest Mode" : loggedInUser}
                </span>
                <span className="text-zinc-700">|</span>
                <button onClick={handleLogout} className="text-xs text-zinc-400 hover:text-amber-400 transition cursor-pointer flex items-center gap-1 bg-transparent border-0 p-0">
                  <LogOut size={12} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setIsLogin(true); setCurrentView("AUTH"); }} 
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 border border-white/10 hover:border-violet-600 transition bg-white/5 cursor-pointer"
                id="btn-login-nav"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* VIEW 1: HOME LANDING PAGE */}
      <AnimatePresence mode="wait">
        {currentView === "HOME" && (
          <motion.main
            id="view-home"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto px-4 py-12 md:py-20 z-10 relative flex flex-col items-center text-center"
          >
            {/* Premium Badge */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/50 border border-violet-800/80 text-violet-300 text-xs font-semibold mb-6 hover:border-amber-500/50 transition cursor-default"
            >
              <Sparkles size={13} className="text-amber-500 animate-pulse" />
              <span>Next-Gen Voice-to-Resume Platform</span>
            </motion.div>

            {/* Glowing Big Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
              Vocalise Your Achievements. <br />
              <span className="bg-gradient-to-r from-violet-400 via-amber-400 to-teal-400 bg-clip-text text-transparent">
                Assemble Your Resume instantly.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-350 max-w-2xl mb-10 leading-relaxed font-sans">
              Indian regional languages are empowered here. Speak live about your experience in 
              <span className="text-violet-400 font-semibold"> Hindi</span>, 
              <span className="text-teal-400 font-semibold"> Tamil</span>, 
              <span className="text-amber-500 font-semibold"> Bengali</span> or 8 other local dialects. Sarvam AI translates & Gemini formats it instantly into professional, high-scoring ATS resumes!
            </p>

            {/* Navigation action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center">
              <button
                onClick={() => {
                  if (loggedInUser) setCurrentView("APP");
                  else { setIsLogin(true); setCurrentView("AUTH"); }
                }}
                className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-bold rounded-full shadow-lg shadow-violet-950/50 hover:shadow-violet-800/30 transition flex items-center justify-center gap-2 cursor-pointer border border-violet-500/20"
                id="btn-get-started"
              >
                <span>Launch Builder free</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handleGuestMode}
                className="px-8 py-3.5 bg-white/5 border border-white/10 hover:border-zinc-700 hover:bg-white/10 text-zinc-200 hover:text-white font-semibold rounded-full transition flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xl"
                id="btn-guest-home"
              >
                <span>Continue as Guest</span>
              </button>
            </div>

            {/* Feature Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
              
              <div className="glass hover:border-violet-500/40 p-6 group shadow-sm relative overflow-hidden transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-violet-600/15 flex items-center justify-center mb-4 border border-violet-500/20 group-hover:bg-violet-600/30 transition">
                  <Globe2 className="text-violet-400 shrink-0" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-sans uppercase tracking-wide">11 Regional Languages</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Comprehensive support for Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, and Indian English.
                </p>
              </div>

              <div className="glass hover:border-amber-500/40 p-6 group shadow-sm relative overflow-hidden transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center mb-4 border border-amber-500/20 group-hover:bg-amber-500/30 transition">
                  <Mic className="text-amber-500 shrink-0" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-sans uppercase tracking-wide">Acoustic Auto STT</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Engineered with top Sarvam AI translation & speech synthesis engines. Audio is auto-transcribed and mapped directly to global standards.
                </p>
              </div>

              <div className="glass hover:border-teal-500/40 p-6 group shadow-sm relative overflow-hidden transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-teal-500/15 flex items-center justify-center mb-4 border border-teal-500/20 group-hover:bg-teal-500/30 transition">
                  <FileText className="text-teal-400 shrink-0" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-sans uppercase tracking-wide">Dynamic Styling</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Instantly structure into selectable Classic, Modern, and warm Heritage saffron designs. Perfect print templates ready to download as PDF.
                </p>
              </div>

            </div>

            {/* Regional Status Indicators footer */}
            <div className="mt-16 text-zinc-500 text-xs flex justify-center items-center gap-4 flex-wrap select-none no-pdf">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> WebRTC Secure</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-850"></span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Sarvam saarika:v2.5</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-850"></span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Gemini-3.5 Structure AI</span>
            </div>
          </motion.main>
        )}

        {/* VIEW 2: LOGIN / SIGNUP SCREEN */}
        {currentView === "AUTH" && (
          <motion.main
            id="view-auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto px-4 py-20 z-10 relative"
          >
            <div className="glass p-8 rounded-3xl shadow-2xl relative glow-violet">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center mx-auto mb-3 border border-violet-500/30 text-violet-400">
                  {isLogin ? <Lock size={20} /> : <User size={20} />}
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{isLogin ? "Welcome Back" : "Create Professional Account"}</h2>
                <p className="text-xs text-zinc-450 mt-1">Generate stunning resumes using regional dictation formats.</p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4 text-left">
                {!isLogin && (
                  <div>
                    <label className="text-xs font-bold text-zinc-450 block mb-1 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-zinc-550" size={16} />
                      <input
                        type="text"
                        placeholder="Vijay Kumar"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-white/3 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-violet-600 outline-none transition"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-zinc-450 block mb-1 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-zinc-550" size={16} />
                    <input
                      type="email"
                      placeholder="vijay.kumar@gmail.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-white/3 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-violet-600 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-450 block mb-1 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-zinc-550" size={16} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full bg-white/3 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-violet-600 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-bold py-2.5 rounded-xl mt-2 transition text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-violet-950/20"
                  id="btn-auth-submit"
                >
                  <span>{isLogin ? "Sign In" : "Register with Email"}</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="relative my-6 text-center">
                <hr className="border-white/10" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest bg-[#0c0919] px-3 absolute -top-2 left-1/2 -translate-x-1/2">Or</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGuestMode}
                  className="w-full bg-white/5 border border-white/10 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold py-2.5 rounded-xl transition text-sm cursor-pointer block bg-transparent"
                  id="btn-guest-auth"
                >
                  Continue as Guest
                </button>

                <div className="text-center mt-4">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-xs text-violet-400 hover:text-violet-300 hover:underline transition bg-transparent border-0"
                  >
                    {isLogin ? "Don't have an account? Sign Up" : "Already registered? Sign In"}
                  </button>
                </div>
              </div>
            </div>
          </motion.main>
        )}

        {/* VIEW 3: CORE WORKSPACE APPLICATION */}
        {currentView === "APP" && (
          <motion.main
            id="view-app-workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 py-8 z-10 relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* COLUMN 1: INPUT CONTROLS SECTION */}
            <div className="lg:col-span-4 space-y-6 flex flex-col shrink-0">
              
              {/* Language Selector Glass Card */}
              <div className="glass p-6 text-left relative overflow-hidden">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Globe2 className="text-violet-400" size={16} />
                  1. Regional Dialect
                </h3>
                <p className="text-xs text-zinc-400 mb-4 leading-normal">
                  Our Sarvam model operates best on regional accents. Choose your speech dialect.
                </p>

                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 border border-white/5 rounded-xl bg-white/3 p-2">
                  {LANGUAGES.map((langOption) => {
                    const isSelected = selectedLang.code === langOption.code;
                    return (
                      <button
                        key={langOption.code}
                        onClick={() => setSelectedLang(langOption)}
                        className={`flex flex-col items-start px-3 py-2 rounded-xl transition-all border text-left cursor-pointer ${
                          isSelected
                            ? "bg-violet-500/20 border-violet-500/50 text-violet-300 ring-1 ring-violet-500/40 shadow-sm"
                            : "bg-white/3 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/5"
                        }`}
                      >
                        <span className="text-xs font-bold leading-none">{langOption.name}</span>
                        <span className="text-[10px] text-zinc-550 font-mono mt-1 leading-none">{langOption.native}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dictation Controller Studio */}
              <div className="glass p-6 text-left relative overflow-hidden">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Mic className="text-violet-400" size={16} />
                  2. Voice Recording Session
                </h3>
                <p className="text-xs text-zinc-400 leading-normal mb-6">
                  Click below to speak about your role, name, work achievements, and academics.
                </p>

                {/* Microphone Ring animation area */}
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/3 relative py-8 overflow-hidden">
                  
                  {isRecording ? (
                    <div className="flex items-center gap-1.5 h-12 mb-6 justify-center">
                      {audioLevels.map((lvl, index) => (
                        <motion.div
                          key={index}
                          className="w-1.5 rounded-full bg-violet-500"
                          style={{ height: `${lvl}%` }}
                          animate={{ scaleY: [1, 1.25, 1] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: index * 0.04 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Volume2 size={36} className="text-zinc-600 mb-6 animate-pulse" />
                  )}

                  <div className="text-center mb-6 z-10">
                    {isRecording ? (
                      <div>
                        <span className="text-2xl font-bold font-mono text-red-500 tracking-wider">
                          {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")}
                        </span>
                        <p className="text-[10px] text-red-400 tracking-widest uppercase font-bold mt-1 font-sans">
                          {FEEDBACK_STRINGS[selectedLang.code]?.recordingLive || "Recording Live"}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm font-semibold text-zinc-300">
                          {FEEDBACK_STRINGS[selectedLang.code]?.readyForCapture || "Ready for Acoustic capture"}
                        </span>
                        <p className="text-[11px] text-zinc-500 mt-1 font-sans">Limits: Up to 30 seconds of regional speech</p>
                      </div>
                    )}
                  </div>

                  {/* Record controls */}
                  <div className="relative flex items-center justify-center mb-4">
                    {isRecording && (
                      <div className="absolute w-32 h-32 bg-violet-600/20 rounded-full animate-ping pointer-events-none" />
                    )}
                    
                    {isRecording ? (
                      <button
                        onClick={stopRecording}
                        className="relative w-24 h-24 bg-gradient-to-br from-red-600 to-rose-700 rounded-full flex items-center justify-center shadow-lg shadow-red-950/40 hover:scale-105 active:scale-95 transition-all text-white cursor-pointer"
                      >
                        <Square size={24} className="fill-white text-white font-bold" />
                      </button>
                    ) : (
                      <button
                        onClick={startRecording}
                        className="relative w-24 h-24 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-full flex items-center justify-center glow-violet hover:scale-105 active:scale-95 transition-all text-white cursor-pointer"
                      >
                        <Mic size={28} className="text-white" />
                      </button>
                    )}
                  </div>

                  {/* Playback player if sound was captured */}
                  {audioUrl && !isRecording && (
                    <div className="mt-4 w-full bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-widest">Acoustic Captured</span>
                      <audio src={audioUrl} controls className="h-6 w-36 outline-none text-xs" />
                    </div>
                  )}

                  <p className="text-[10px] text-zinc-550 mt-4 text-center leading-normal max-w-xs px-2">
                    Speech captures are capped at 30 seconds to align with high-speed transcription model quotas.
                  </p>
                </div>

                <div className="relative my-6 text-center">
                  <hr className="border-white/5" />
                  <span className="text-[10px] text-zinc-550 uppercase tracking-widest bg-[#0c0919] px-3 absolute -top-2 left-1/2 -translate-x-1/2 font-mono">Or Demo Test</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={loadPresetTranscript}
                    className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={13} className="text-amber-500 animate-pulse" />
                    <span>Demo testing: Load Sample Speech text</span>
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center leading-normal">
                    Loads preset Indian regional transcripts and automated English translation. Ideal for viewing the AI engine directly without using mic.
                  </p>
                </div>
              </div>

              {/* Editable Transcript Review Card */}
              {(transcriptText || processingStep) && (
                <div className="glass p-6 text-left relative overflow-hidden">
                  <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ListChecks className="text-violet-400" size={16} />
                    3. Dialect Transcript review
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4 leading-normal">
                    Review and edit the processed text below prior to sending it to Gemini ATS AI.
                  </p>

                  <div className="space-y-4">
                    {/* Raw transcription */}
                    <div>
                      <span className="text-[10px] uppercase text-zinc-450 tracking-wider block mb-1">
                        Original Speech ({selectedLang.native})
                      </span>
                      <textarea
                        value={transcriptText}
                        onChange={(e) => setTranscriptText(e.target.value)}
                        placeholder="Automatic transcription appears here..."
                        className="w-full h-24 bg-white/3 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-violet-600 font-sans leading-relaxed resize-none"
                      />
                    </div>

                    {/* English translation */}
                    <div>
                      <span className="text-[10px] uppercase text-zinc-450 tracking-wider block mb-1">
                        Translated to English (Corporate Standard)
                      </span>
                      <textarea
                        value={translatedText}
                        onChange={(e) => setTranscriptText(e.target.value)}
                        placeholder="Translation to English translates automatically..."
                        className="w-full h-24 bg-white/3 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-600 font-sans leading-relaxed resize-none"
                      />
                    </div>

                    {/* Trigger manual formatting */}
                    <button
                      onClick={() => generateResumeFromInputs(translatedText)}
                      disabled={!translatedText || processingStep === "GEMINI" || processingStep === "TRANSLATING"}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-xs hover:scale-101 hover:brightness-105 cursor-pointer disabled:opacity-40 select-none block transition text-center uppercase tracking-wider shadow-md shadow-cyan-950/20"
                    >
                      {processingStep === "GEMINI" ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <RefreshCw className="animate-spin" size={13} />
                          <span>Gemini is Structuring...</span>
                        </div>
                      ) : (
                        "Generate final ATS Resume with Gemini"
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* COLUMN 2: LIVE RESUME CANVAS FRAME */}
            <div className="lg:col-span-5 space-y-6 min-w-0 w-full">
              
              {/* Pipeline processing spinner overlays */}
              {processingStep && processingStep !== "COMPLETE" && (
                <div className="glass p-16 flex flex-col items-center text-center justify-center space-y-6 min-h-[400px] glow-violet">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
                    <Mic className="absolute text-violet-400" size={24} />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold bg-gradient-to-r from-violet-300 to-amber-300 bg-clip-text text-transparent leading-relaxed animate-pulse">
                      {processingStep === "STT" && (FEEDBACK_STRINGS[selectedLang.code]?.processingSTT || "Sarvam AI Saarika v2.5 STT transcribing...")}
                      {processingStep === "TRANSLATING" && (FEEDBACK_STRINGS[selectedLang.code]?.processingTranslation || "Sarvam AI translating raw speech to English...")}
                      {processingStep === "GEMINI" && (FEEDBACK_STRINGS[selectedLang.code]?.processingGemini || "Gemini formatting unstructured transcript...")}
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-sm mt-3 mx-auto leading-relaxed">
                      Please hold on! Indian vocal soundwaves are parsed via secure high-performance deeplearning servers to extract structured qualifications.
                    </p>
                  </div>
                </div>
              )}

              {/* Display processing errors */}
              {processingError && (
                <div className="border border-red-500/20 bg-red-950/20 rounded-2xl p-5 text-left flex items-start gap-3">
                  <Info className="text-red-400 shrink-0 mt-0.5" size={17} />
                  <div>
                    <h4 className="text-sm font-bold text-red-200">Processing Interruption</h4>
                    <p className="text-xs text-red-100/70 mt-1 leading-relaxed">
                      {processingError}
                    </p>
                  </div>
                </div>
              )}

              {/* RESUME DISPLAY WORKSPACE */}
              {generatedResume && processingStep === "COMPLETE" && (
                <div className="space-y-6">
                  {/* Decorative Header visual from Immersive UI */}
                  <div className="bg-white/3 border border-white/5 px-6 py-3 flex justify-between items-center rounded-t-2xl">
                    <span className="text-xs font-bold text-zinc-350 tracking-tighter uppercase">Live Document Canvas • {activeTemplate}</span>
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    </div>
                  </div>

                  {/* Print Target DOM Paper frame (FIX 2) */}
                <div 
  id="resume-preview-container"
  className="overflow-x-auto overflow-y-auto rounded-b-2xl shadow-2xl border border-white/5 bg-slate-900/10 p-1 md:p-3 relative custom-violet-scrollbar"
  style={{ maxHeight: "calc(100vh - 200px)" }}
>
                    <div className="w-[100%] min-w-[700px] mx-auto scale-100 origin-top">
                      <ResumeTemplate
                        data={generatedResume}
                        template={activeTemplate}
                        onUpdateData={(newData) => {
                          setGeneratedResume(newData);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback Empty state */}
              {(!generatedResume || processingStep === "") && (
                <div className="glass p-16 flex flex-col items-center justify-center text-center space-y-4 shadow-xl min-h-[450px]">
                  <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-white/5 flex items-center justify-center text-zinc-550 shadow-inner">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">Ready for acoustics resume compilation</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mt-2 mx-auto leading-relaxed">
                      Select your dialect on the left panel, and dictate or load the template speech demo. Your polished ATS resume document compiles live in this workspace!
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* COLUMN 3: PERFORMANCE METRICS & STYLE CONFIGS */}
            <div className="lg:col-span-3 space-y-6 flex flex-col shrink-0 min-w-0 w-full">
              
              {/* ATS Rating score indicator */}
              {generatedResume ? (
                renderATSGauge(generatedResume.atsScore)
              ) : (
                <div className="glass p-6 flex flex-col items-center gap-4 text-center">
                  <h4 className="text-xs font-bold text-zinc-455 uppercase tracking-widest">Acoustic ATS Score</h4>
                  <div className="ats-gauge" style={{ '--score-percentage': '0%' } as React.CSSProperties}>
                    <div className="ats-inner">
                      <span className="text-2xl font-bold text-teal-500/30">--</span>
                      <span className="text-[10px] text-white/30 uppercase">Optimal</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-center text-zinc-450 leading-relaxed">
                    Once voice is transcribed, regional soundwave parsing will calculate the optimal job role mapping score.
                  </p>
                </div>
              )}

              {generatedResume && generatedResume.agentMessage && (
                <div className="glass p-5 text-left border border-violet-500/20 bg-violet-950/10 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2 text-violet-400 font-bold uppercase tracking-wider text-[10px]">
                    <Volume2 size={14} className="shrink-0" />
                    <span>AI Voice Message</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                    {generatedResume.agentMessage}
                  </p>
                </div>
              )}

              {/* Template Theme Selector Panel */}
              <div className="glass p-5 space-y-4 text-left relative overflow-hidden">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Select Styling Template</h4>
                <div className="space-y-2">
                  {(["Classic", "Modern", "Saffron"] as TemplateType[]).map((tmpl) => {
                    const isActive = activeTemplate === tmpl;
                    return (
                      <button
                        key={tmpl}
                        onClick={() => setActiveTemplate(tmpl)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs text-left transition-all cursor-pointer inline-block ${
                          isActive
                            ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold glow-gold"
                            : "bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-300"
                        }`}
                      >
                        {tmpl === "Classic" ? "Classic Serif" : tmpl === "Modern" ? "Modern Minimal" : "Saffron Heritage"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trigger Download PDF Actions */}
              <button
                onClick={downloadPDF}
                disabled={!generatedResume || isGeneratingPDF}
                className="w-full py-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xl glow-teal flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
              >
                {isGeneratingPDF ? (
                  <>
                    <RefreshCw className="animate-spin text-white" size={16} />
                    <span>Rendering PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} className="text-white font-bold" />
                    <span>Download PDF Document</span>
                  </>
                )}
              </button>

              {/* Historic Resume session tracking */}
              {savedResumes.length > 0 && (
                <div className="glass p-5 text-left relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-zinc-300 border-b border-white/5 pb-2.5 mb-4">
                    <History size={13} className="text-violet-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Previous Builds History</h3>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {savedResumes.map((hist) => (
                      <div
                        key={hist.id}
                        onClick={() => loadSavedResume(hist)}
                        className="flex items-center justify-between p-2.5 bg-white/3 border border-white/5 rounded-xl hover:bg-white/5 transition cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded bg-violet-600/10 flex items-center justify-center border border-violet-500/25 text-violet-400 shrink-0">
                            <FileText size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-zinc-200 block truncate">{hist.data.personalInfo.name || "Untitled Candidate"}</span>
                            <span className="text-[9px] text-zinc-500 block truncate">{hist.date} ({hist.language})</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => deleteSavedResume(hist.id, e)}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-white/5 transition shrink-0 bg-transparent border-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Corporate platform footer */}
      <footer className="border-t border-zinc-900/60 bg-[#08060f]/90 relative z-30 py-8 px-4 text-center select-none text-zinc-500 text-xs">
        <p>© 2026 VoiceCV Corp. Developed for Indian Multilingual Enterprise enablement.</p>
        <p className="mt-1 flex items-center justify-center gap-1">Powered securely by <span className="text-violet-400 font-semibold font-mono">Sarvam AI Speech</span> & <span className="text-amber-500 font-semibold font-mono">Google Gemini Nano Framework</span>.</p>
      </footer>

    </div>
  );
}
