"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { analyze, SoilInput } from "../lib/advisory";
import { ImagePrediction, predictImage } from "../lib/api";
import { AppLanguage, readLanguage, saveLanguage } from "../lib/demo-session";
import { stopSpeech as cancelSpeechOutput } from "../lib/voice";
import VoiceAssistant from "../components/VoiceAssistant";

type Language = AppLanguage;
type AnalysisResult = ReturnType<typeof analyze>;
type HistoryItem = {
  time: string;
  score: number;
  grade: string;
  crop: string;
  input?: SoilInput;
  result?: AnalysisResult;
};
type Copy = {
  title: string; subtitle: string; analyze: string; analyzing: string;
  languageLabel: string; sampleNote: string;
  methodLabel: string; notLab: string; suited: string;
  suitedAfterChanges: string; lowerFit: string; medium: string;
  removeImage: string; openAnalysis: string;
  fieldLabels: Record<keyof SoilInput, string>;
  pdf: string; pdfLoading: string; listen: string; stop: string; speaking: string;
  voiceRead: string; voicePause: string; voiceResume: string; voiceStop: string;
  voicePlaying: string; voicePaused: string; voiceUnavailable: string; voiceDisabled: string; voiceEnabled: string;
  outOf: string;
  classification: string; confidence: string; analysisDate: string; deficiencies: string; noDeficiencies: string;
  noClassification: string; dashboard: string; login: string; inputs: string;
  brandKicker: string; mainNavigation: string;
  results: string; history: string; image: string; camera: string;
  note: string; units: string; imageNote: string; empty: string;
  soilConditions: string; recommendations: string; crops: string;
  indicator: string; value: string; status: string; crop: string;
  score: string; fit: string; limits: string; time: string;
  condition: string; topCrop: string; upload: string; imageError: string;
  speechError: string; pdfError: string; historyError: string;
  analyzeError: string; caution: string; historyEmpty: string;
  imageModelPrediction: string; imageModelWarning: string; imageModelUnavailable: string;
  gradeGood: string; gradeFair: string; gradeNeeds: string; gradePoor: string;
  low: string; adequate: string; high: string; acidic: string;
  alkaline: string; nearNeutral: string; veryLow: string; dry: string; wet: string;
};

const copy: Record<Language, Copy> = {
  English: {
    title: "Kisan Soil Advisor", subtitle: "Soil-health and crop guidance",
    analyze: "Analyze my soil", analyzing: "Checking readings...",
    languageLabel: "Language",
    sampleNote: "Sample values are pre-filled. Replace them with your soil-test results. All six readings are required in this demo.",
    methodLabel: "How this result is made", notLab: "Rule-based estimate — not a laboratory diagnosis or ML confidence score.",
    suited: "Suitable", suitedAfterChanges: "Suitable after improvement", lowerFit: "Lower suitability", medium: "Medium",
    removeImage: "Remove photo", openAnalysis: "Open analysis",
    fieldLabels: { nitrogen: "Nitrogen (N)", phosphorus: "Phosphorus (P)", potassium: "Potassium (K)", ph: "Soil pH", moisture: "Moisture (%)", organicMatter: "Organic matter (%)" }, pdf: "Download Soil Health Report",
    pdfLoading: "Preparing PDF...", listen: "Read results aloud", stop: "Stop", speaking: "Speaking results",
    voiceRead: "Read aloud", voicePause: "Pause", voiceResume: "Resume", voiceStop: "Stop",
    voicePlaying: "Reading aloud", voicePaused: "Reading paused", voiceUnavailable: "Voice output is not available in this browser.",
    voiceDisabled: "Voice assistance is turned off.", voiceEnabled: "Voice assistance", outOf: "out of",
    classification: "Soil classification", confidence: "CNN confidence", analysisDate: "Analysis date",
    deficiencies: "Nutrient deficiencies", noDeficiencies: "None identified by these indicator bands.", noClassification: "No CNN image classification for this analysis.",
    dashboard: "Dashboard", login: "Login", inputs: "Soil readings",
    brandKicker: "FARM SOIL ANALYSIS", mainNavigation: "Main navigation",
    results: "Analysis", history: "Recent analyses", image: "Soil image",
    camera: "Camera", note: "Use local Soil Health Card guidance before applying fertilizers.",
    units: "N, P and K use mg/kg (ppm). Organic matter and moisture use percent.",
    imageNote: "Take a clear, well-lit soil photo. The CNN can classify it when the backend is running. Enter lab readings below.",
    imageModelPrediction: "Experimental CNN estimate",
    imageModelWarning: "This model scored 91.6% on a small test set and can still be wrong. Confirm with a soil test or local agriculture expert.",
    imageModelUnavailable: "Image model unavailable; showing rule-based soil advisory.",
    empty: "Enter soil-test readings to see the score, nutrient actions and crop ranking.",
    soilConditions: "Soil conditions", recommendations: "Management recommendations",
    crops: "Crop suitability", indicator: "Indicator", value: "Value", status: "Status",
    crop: "Crop", score: "Score", fit: "Fit", limits: "Factors to improve",
    time: "Time", condition: "Condition", topCrop: "Top crop", upload: "Upload image",
    imageError: "Choose a valid image smaller than 10 MB.",
    speechError: "Voice output is not available in this browser.",
    pdfError: "Could not create the PDF report.",
    historyError: "Analysis completed, but recent history could not be saved in this browser.",
    analyzeError: "Could not analyze the soil readings.", caution: "Caution",
    historyEmpty: "Recent analyses are stored only in this browser.",
    gradeGood: "Good", gradeFair: "Fair", gradeNeeds: "Needs improvement", gradePoor: "Poor",
    low: "Low", adequate: "Adequate", high: "High", acidic: "Acidic",
    alkaline: "Alkaline", nearNeutral: "Near neutral", veryLow: "Very low",
    dry: "Dry", wet: "Wet",
  },
  Hindi: {
    title: "\u0915\u093f\u0938\u093e\u0928 \u092e\u093f\u091f\u094d\u091f\u0940 \u0938\u0932\u093e\u0939\u0915\u093e\u0930",
    subtitle: "\u092e\u093f\u091f\u094d\u091f\u0940 \u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f \u0914\u0930 \u092b\u0938\u0932 \u0938\u0932\u093e\u0939",
    analyze: "मेरी मिट्टी का विश्लेषण करें", analyzing: "जाँच हो रही है...",
    languageLabel: "भाषा",
    sampleNote: "नमूना मान पहले से भरे हैं। इन्हें अपनी मिट्टी-जाँच के परिणामों से बदलें। इस डेमो में सभी छह मान आवश्यक हैं।",
    methodLabel: "यह परिणाम कैसे बना", notLab: "नियम-आधारित अनुमान — यह प्रयोगशाला निदान या ML confidence score नहीं है।",
    suited: "उपयुक्त", suitedAfterChanges: "सुधार के बाद उपयुक्त", lowerFit: "कम उपयुक्तता", medium: "मध्यम",
    removeImage: "तस्वीर हटाएँ", openAnalysis: "विश्लेषण खोलें",
    fieldLabels: { nitrogen: "नाइट्रोजन (N)", phosphorus: "फॉस्फोरस (P)", potassium: "पोटैशियम (K)", ph: "मिट्टी का pH", moisture: "नमी (%)", organicMatter: "जैविक पदार्थ (%)" },
    pdf: "\u092e\u093f\u091f\u094d\u091f\u0940 \u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0921\u093e\u0909\u0928\u0932\u094b\u0921", pdfLoading: "PDF \u0924\u0948\u092f\u093e\u0930 \u0939\u094b \u0930\u0939\u093e \u0939\u0948...",
    listen: "\u092a\u0930\u093f\u0923\u093e\u092e \u0938\u0941\u0928\u0947\u0902", stop: "\u0930\u094b\u0915\u0947\u0902", speaking: "\u092a\u0930\u093f\u0923\u093e\u092e \u092a\u0922\u093c\u0947 \u091c\u093e \u0930\u0939\u0947 \u0939\u0948\u0902",
    voiceRead: "\u091c\u094b\u0930 \u0938\u0947 \u092a\u0922\u093c\u0947\u0902", voicePause: "\u0930\u094b\u0915\u0947\u0902", voiceResume: "\u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902", voiceStop: "\u092c\u0902\u0926 \u0915\u0930\u0947\u0902",
    voicePlaying: "\u092a\u0922\u093c\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948", voicePaused: "\u092a\u0922\u093c\u0928\u093e \u0930\u0941\u0915\u093e \u0939\u0948", voiceUnavailable: "\u0907\u0938 \u092c\u094d\u0930\u093e\u0909\u091c\u093c\u0930 \u092e\u0947\u0902 \u0906\u0935\u093e\u091c\u093c \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
    voiceDisabled: "\u0906\u0935\u093e\u091c\u093c \u0938\u0939\u093e\u092f\u0924\u093e \u092c\u0902\u0926 \u0939\u0948\u0964", voiceEnabled: "\u0906\u0935\u093e\u091c\u093c \u0938\u0939\u093e\u092f\u0924\u093e", outOf: "\u092e\u0947\u0902 \u0938\u0947",
    classification: "\u092e\u093f\u091f\u094d\u091f\u0940 \u0915\u093e \u0935\u0930\u094d\u0917\u0940\u0915\u0930\u0923", confidence: "CNN \u0935\u093f\u0936\u094d\u0935\u093e\u0938 \u0938\u094d\u0924\u0930", analysisDate: "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0915\u0940 \u0924\u093e\u0930\u0940\u0916",
    deficiencies: "\u092a\u094b\u0937\u0915 \u0924\u0924\u094d\u0935\u094b\u0902 \u0915\u0940 \u0915\u092e\u0940", noDeficiencies: "\u0907\u0928 \u0938\u0902\u0915\u0947\u0924\u0915 \u0938\u0940\u092e\u093e\u0913\u0902 \u092e\u0947\u0902 \u0915\u094b\u0908 \u0915\u092e\u0940 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940।", noClassification: "\u0907\u0938 \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0915\u0947 \u0932\u093f\u090f CNN \u091b\u0935\u093f \u0935\u0930\u094d\u0917\u0940\u0915\u0930\u0923 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
    dashboard: "\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921", login: "\u0932\u0949\u0917\u093f\u0928", inputs: "\u092e\u093f\u091f\u094d\u091f\u0940 \u0930\u0940\u0921\u093f\u0902\u0917",
    brandKicker: "\u0915\u093f\u0938\u093e\u0928 \u092e\u093f\u091f\u094d\u091f\u0940 \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923", mainNavigation: "\u092e\u0941\u0916\u094d\u092f \u0928\u0947\u0935\u093f\u0917\u0947\u0936\u0928",
    results: "\u092a\u0930\u093f\u0923\u093e\u092e", history: "\u0939\u093e\u0932 \u0915\u0940 \u091c\u093e\u0902\u091a",
    image: "\u092e\u093f\u091f\u094d\u091f\u0940 \u0915\u0940 \u092b\u094b\u091f\u094b", camera: "\u0915\u0948\u092e\u0930\u093e",
    note: "\u0909\u0930\u094d\u0935\u0930\u0915 \u0921\u093e\u0932\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u0938\u094d\u0925\u093e\u0928\u0940\u092f \u0938\u0949\u092f\u0932 \u0939\u0947\u0932\u094d\u0925 \u0915\u093e\u0930\u094d\u0921 \u0915\u0940 \u0938\u0932\u093e\u0939 \u092e\u093e\u0928\u0947\u0902\u0964",
    units: "N, P, K: mg/kg (ppm); \u091c\u0948\u0935\u093f\u0915 \u092a\u0926\u093e\u0930\u094d\u0925 \u0914\u0930 \u0928\u092e\u0940: \u092a\u094d\u0930\u0924\u093f\u0936\u0924\u0964",
    imageNote: "साफ़, अच्छी रोशनी वाली मिट्टी की तस्वीर लें। बैकएंड चलने पर CNN इसे वर्गीकृत करेगा। नीचे मिट्टी-जाँच के मान भी दर्ज करें।",
    imageModelPrediction: "प्रायोगिक CNN अनुमान",
    imageModelWarning: "यह मॉडल छोटे परीक्षण समूह में 91.6% सही था और फिर भी गलत हो सकता है। मिट्टी-जाँच या स्थानीय कृषि विशेषज्ञ से पुष्टि करें।",
    imageModelUnavailable: "छवि मॉडल उपलब्ध नहीं है; मिट्टी की रीडिंग के आधार पर सलाह दिखाई जा रही है।",
    empty: "\u092e\u093f\u091f\u094d\u091f\u0940 \u0915\u0940 \u091c\u093e\u0902\u091a \u0915\u0947 \u092e\u093e\u0928 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902\u0964",
    soilConditions: "\u092e\u093f\u091f\u094d\u091f\u0940 \u0915\u0940 \u0938\u094d\u0925\u093f\u0924\u093f",
    recommendations: "\u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u0940 \u0938\u0932\u093e\u0939",
    crops: "\u092b\u0938\u0932 \u0909\u092a\u092f\u0941\u0915\u094d\u0924\u0924\u093e", indicator: "\u0938\u0902\u0915\u0947\u0924\u0915",
    value: "\u092e\u093e\u0928", status: "\u0938\u094d\u0925\u093f\u0924\u093f", crop: "\u092b\u0938\u0932",
    score: "\u0905\u0902\u0915", fit: "\u0905\u0928\u0941\u0915\u0942\u0932\u0924\u093e",
    limits: "\u0938\u0941\u0927\u093e\u0930 \u0915\u0947 \u0915\u093e\u0930\u0915",
    time: "\u0938\u092e\u092f", condition: "\u0938\u094d\u0925\u093f\u0924\u093f",
    topCrop: "\u092a\u094d\u0930\u092e\u0941\u0916 \u092b\u0938\u0932",
    upload: "\u091b\u0935\u093f \u0905\u092a\u0932\u094b\u0921",
    imageError: "10 MB \u0938\u0947 \u091b\u094b\u091f\u0940 \u0935\u0948\u0927 \u091b\u0935\u093f \u091a\u0941\u0928\u0947\u0902\u0964",
    speechError: "\u0907\u0938 \u092c\u094d\u0930\u093e\u0909\u091c\u093c\u0930 \u092e\u0947\u0902 \u0906\u0935\u093e\u091c\u093c \u0906\u0909\u091f\u092a\u0941\u091f \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
    pdfError: "PDF \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0928\u0939\u0940\u0902 \u092c\u0928\u093e \u0938\u0915\u0947\u0964",
    historyError: "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u092a\u0942\u0930\u093e, \u0939\u093e\u0932 \u0915\u093e \u0907\u0924\u093f\u0939\u093e\u0938 \u0938\u0939\u0947\u091c\u093e \u0928\u0939\u0940\u0902 \u091c\u093e \u0938\u0915\u093e\u0964",
    analyzeError: "\u092e\u093f\u091f\u094d\u091f\u0940 \u0915\u0947 \u092e\u093e\u0928\u094b\u0902 \u0915\u093e \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e\u0964",
    caution: "\u0938\u093e\u0935\u0927\u093e\u0928\u0940", historyEmpty: "\u0939\u093e\u0932 \u0915\u0940 \u091c\u093e\u0902\u091a \u0915\u0947\u0935\u0932 \u0907\u0938 \u092c\u094d\u0930\u093e\u0909\u091c\u093c\u0930 \u092e\u0947\u0902 \u0938\u0902\u0917\u094d\u0930\u0939\u093f\u0924 \u0939\u0948\u0964",
    gradeGood: "\u0905\u091a\u094d\u091b\u093e", gradeFair: "\u0920\u0940\u0915", gradeNeeds: "\u0938\u0941\u0927\u093e\u0930 \u0915\u0940 \u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e", gradePoor: "\u0916\u0930\u093e\u092c",
    low: "\u0915\u092e", adequate: "\u092a\u0930\u094d\u092f\u093e\u092a\u094d\u0924", high: "\u0905\u0927\u093f\u0915",
    acidic: "\u0905\u092e\u094d\u0932\u0940\u092f", alkaline: "\u0915\u094d\u0937\u093e\u0930\u0940\u092f", nearNeutral: "\u0932\u0917\u092d\u0917 \u0924\u091f\u0938\u094d\u0925",
    veryLow: "\u092c\u0939\u0941\u0924 \u0915\u092e", dry: "\u0938\u0942\u0916\u093e", wet: "\u0917\u0940\u0932\u093e",
  },
  Kannada: {
    title: "\u0c95\u0cbf\u0cb8\u0cbe\u0ca8 \u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0cb8\u0cb2\u0cb9\u0cc6\u0c97\u0cbe\u0cb0",
    subtitle: "\u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0c86\u0cb0\u0ccb\u0c97\u0ccd\u0caf \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0cac\u0cc6\u0cb3\u0cc6 \u0cb8\u0cb2\u0cb9\u0cc6",
    analyze: "ನನ್ನ ಮಣ್ಣನ್ನು ವಿಶ್ಲೇಷಿಸಿ", analyzing: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    languageLabel: "ಭಾಷೆ",
    sampleNote: "ಮಾದರಿ ಮೌಲ್ಯಗಳನ್ನು ಮೊದಲೇ ತುಂಬಲಾಗಿದೆ. ನಿಮ್ಮ ಮಣ್ಣು ಪರೀಕ್ಷೆಯ ಫಲಿತಾಂಶಗಳಿಂದ ಬದಲಾಯಿಸಿ. ಈ ಡೆಮೊಗೆ ಆರು ಮೌಲ್ಯಗಳೂ ಅಗತ್ಯ.",
    methodLabel: "ಈ ಫಲಿತಾಂಶದ ವಿಧಾನ", notLab: "ನಿಯಮ-ಆಧಾರಿತ ಅಂದಾಜು — ಪ್ರಯೋಗಾಲಯದ ನಿರ್ಣಯ ಅಥವಾ ML confidence score ಅಲ್ಲ.",
    suited: "ಸೂಕ್ತ", suitedAfterChanges: "ಸುಧಾರಣೆಯ ನಂತರ ಸೂಕ್ತ", lowerFit: "ಕಡಿಮೆ ಸೂಕ್ತತೆ", medium: "ಮಧ್ಯಮ",
    removeImage: "ಚಿತ್ರ ತೆಗೆದುಹಾಕಿ", openAnalysis: "ವಿಶ್ಲೇಷಣೆ ತೆರೆಯಿರಿ",
    fieldLabels: { nitrogen: "ಸಾರಜನಕ (N)", phosphorus: "ರಂಜಕ (P)", potassium: "ಪೊಟ್ಯಾಸಿಯಂ (K)", ph: "ಮಣ್ಣಿನ pH", moisture: "ತೇವಾಂಶ (%)", organicMatter: "ಜೈವಿಕ ಪದಾರ್ಥ (%)" },
    pdf: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ವರದಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ", pdfLoading: "PDF \u0ca4\u0caf\u0cbe\u0cb0\u0cbf\u0c95\u0cc6 \u0c86\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0ca6\u0cc6...",
    voiceRead: "ಜೋರಾಗಿ ಓದಿ", voicePause: "ವಿರಾಮ", voiceResume: "ಮುಂದುವರಿಸಿ", voiceStop: "ನಿಲ್ಲಿಸಿ",
    voicePlaying: "ಓದಲಾಗುತ್ತಿದೆ", voicePaused: "ಓದುವುದು ನಿಂತಿದೆ", voiceUnavailable: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ.",
    voiceDisabled: "ಧ್ವನಿ ಸಹಾಯ ಆಫ್ ಆಗಿದೆ.", voiceEnabled: "ಧ್ವನಿ ಸಹಾಯ", outOf: "ರಲ್ಲಿ",
    listen: "\u0c95\u0cc7\u0cb3\u0cbf", inputs: "\u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0c93\u0ca6\u0cc1\u0cb5\u0cbf\u0c95\u0cc6\u0c97\u0cb3\u0cc1",
    results: "\u0cb5\u0cbf\u0cb6\u0ccd\u0cb2\u0cc7\u0cb7\u0ca3\u0cc6", history: "\u0c87\u0ca4\u0ccd\u0ca4\u0cc0\u0c9a\u0cbf\u0ca8 \u0cb5\u0cbf\u0cb6\u0ccd\u0cb2\u0cc7\u0cb7\u0ca3\u0cc6\u0c97\u0cb3\u0cc1",
    image: "\u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0cab\u0ccb\u0c9f\u0ccb", camera: "\u0c95\u0ccd\u0caf\u0cbe\u0cae\u0cb0\u0cbe",
    stop: "ನಿಲ್ಲಿಸಿ", speaking: "ಫಲಿತಾಂಶಗಳನ್ನು ಓದಲಾಗುತ್ತಿದೆ", classification: "ಮಣ್ಣಿನ ವರ್ಗೀಕರಣ",
    confidence: "CNN ನಂಬಿಕೆ", analysisDate: "ವಿಶ್ಲೇಷಣೆಯ ದಿನಾಂಕ", deficiencies: "ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ", noDeficiencies: "ಈ ಸೂಚಕ ಮಿತಿಗಳಲ್ಲಿ ಯಾವುದೇ ಕೊರತೆ ಕಂಡುಬಂದಿಲ್ಲ.",
    noClassification: "ಈ ವಿಶ್ಲೇಷಣೆಗೆ CNN ಚಿತ್ರ ವರ್ಗೀಕರಣವಿಲ್ಲ.", dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", login: "ಲಾಗಿನ್",
    brandKicker: "ರೈತರ ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ", mainNavigation: "ಮುಖ್ಯ ನ್ಯಾವಿಗೇಶನ್",
    note: "ಗೊಬ್ಬರ ಹಾಕುವ ಮೊದಲು ಸ್ಥಳೀಯ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್‌ನ ಸಲಹೆ ಅನುಸರಿಸಿ.",
    units: "N, P, K: mg/kg (ppm); \u0c9c\u0cc8\u0cb5\u0cbf\u0c95 \u0caa\u0ca6\u0cbe\u0cb0\u0ccd\u0ca5 \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0ca4\u0cc7\u0cb5\u0cbe\u0c82\u0cb6: \u0cb6\u0cc7\u0c95\u0ca1\u0cbe\u0cb5\u0cbe\u0cb0\u0cc1.",
    imageNote: "ಸ್ಪಷ್ಟವಾದ, ಚೆನ್ನಾಗಿ ಬೆಳಗಿದ ಮಣ್ಣಿನ ಚಿತ್ರ ತೆಗೆದುಕೊಳ್ಳಿ. ಬ್ಯಾಕೆಂಡ್ ಚಾಲನೆಯಲ್ಲಿದ್ದರೆ CNN ಅದನ್ನು ವರ್ಗೀಕರಿಸುತ್ತದೆ. ಕೆಳಗೆ ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ಅಳತೆಗಳನ್ನೂ ನಮೂದಿಸಿ.",
    imageModelPrediction: "ಪ್ರಾಯೋಗಿಕ CNN ಅಂದಾಜು",
    imageModelWarning: "ಈ ಮಾದರಿ ಸಣ್ಣ ಪರೀಕ್ಷಾ ಗುಂಪಿನಲ್ಲಿ 91.6% ಸರಿಯಾಗಿತ್ತು; ಆದರೂ ತಪ್ಪಾಗಬಹುದು. ಮಣ್ಣು ಪರೀಕ್ಷೆ ಅಥವಾ ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    imageModelUnavailable: "ಚಿತ್ರ ಮಾದರಿ ಲಭ್ಯವಿಲ್ಲ; ಮಣ್ಣಿನ ಅಳತೆಗಳ ಆಧಾರದ ಮೇಲೆ ಸಲಹೆ ತೋರಿಸಲಾಗುತ್ತಿದೆ.",
    empty: "\u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0caa\u0cb0\u0cc0\u0c95\u0ccd\u0cb7\u0cbe \u0cae\u0cbe\u0ca8\u0c97\u0cb3\u0ca8\u0ccd\u0ca8\u0cc1 \u0ca8\u0cae\u0cc2\u0ca6\u0cbf\u0cb8\u0cbf.",
    soilConditions: "\u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0cb8\u0ccd\u0ca5\u0cbf\u0ca4\u0cbf\u0c97\u0cb3\u0cc1",
    recommendations: "\u0caa\u0cb0\u0cbf\u0caa\u0cbe\u0cb2\u0ca8\u0cbe \u0cb8\u0cb2\u0cb9\u0cc6\u0c97\u0cb3\u0cc1",
    crops: "ಬೆಳೆ ಸೂಕ್ತತೆ", indicator: "\u0cb8\u0cc2\u0c9a\u0c95",
    value: "\u0cae\u0cc2\u0cb2\u0ccd\u0caf", status: "\u0cb8\u0ccd\u0ca5\u0cbf\u0ca4\u0cbf", crop: "\u0cac\u0cc6\u0cb3\u0cc6",
    score: "\u0c85\u0c82\u0c95", fit: "\u0cb9\u0cca\u0c82\u0ca6\u0cbe\u0ca3\u0cbf\u0c95\u0cc6",
    limits: "\u0cb8\u0cc1\u0ca7\u0cbe\u0cb0\u0ca3\u0cc6\u0caf \u0c85\u0c82\u0cb6\u0c97\u0cb3\u0cc1",
    time: "\u0cb8\u0cae\u0caf", condition: "\u0cb8\u0ccd\u0ca5\u0cbf\u0ca4\u0cbf", topCrop: "\u0cae\u0cc1\u0c96\u0ccd\u0caf \u0cac\u0cc6\u0cb3\u0cc6",
    upload: "\u0c9a\u0cbf\u0ca4\u0ccd\u0cb0 \u0c85\u0caa\u0ccd\u0cb2\u0ccb\u0ca1\u0ccd",
    imageError: "10 MB \u0c97\u0cbf\u0c82\u0ca4 \u0c95\u0ca1\u0cbf\u0cae\u0cc6 \u0c85\u0cb3\u0ca4\u0cc6\u0caf \u0c9a\u0cbf\u0ca4\u0ccd\u0cb0\u0cb5\u0ca8\u0ccd\u0ca8\u0cc1 \u0c86\u0cb0\u0cbf\u0cb8\u0cbf.",
    speechError: "\u0c88 \u0cac\u0ccd\u0cb0\u0ccc\u0c9c\u0cb0\u0ccd\u0ca8\u0cb2\u0ccd\u0cb2\u0cbf \u0cb5\u0cbe\u0c97\u0ccd\u0ca6\u0ccd\u0cb5\u0ca8\u0cbf \u0c89\u0ca4\u0ccd\u0caa\u0ca4\u0ccd\u0ca4\u0cbf \u0c89\u0caa\u0cb2\u0cac\u0ccd\u0ca7\u0cb5\u0cbf\u0cb2\u0ccd\u0cb2.",
    pdfError: "PDF \u0cb5\u0cb0\u0ca6\u0cbf\u0caf\u0ca8\u0ccd\u0ca8\u0cc1 \u0cb0\u0c9a\u0cbf\u0cb8\u0cb2\u0cbe\u0c97\u0cb2\u0cbf\u0cb2\u0ccd\u0cb2.",
    historyError: "\u0cb5\u0cbf\u0cb6\u0ccd\u0cb2\u0cc7\u0cb7\u0ca3\u0cc6 \u0c86\u0caf\u0cbf\u0ca4\u0cc1, \u0c86\u0ca6\u0cb0\u0cc6 \u0cb9\u0cbf\u0c82\u0ca6\u0cbf\u0ca8 \u0cb0\u0cc6\u0c95\u0cbe\u0cb0\u0ccd\u0ca1\u0ccd \u0cb8\u0cc7\u0cb5\u0ccd \u0c86\u0c97\u0cb2\u0cbf\u0cb2\u0ccd\u0cb2.",
    analyzeError: "\u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8 \u0cb0\u0cc0\u0ca1\u0cbf\u0c82\u0c97\u0ccd\u0c97\u0cb3\u0ca8\u0ccd\u0ca8\u0cc1 \u0cb5\u0cbf\u0cb6\u0ccd\u0cb2\u0cc7\u0cb7\u0cbf\u0cb8\u0cb2\u0cbe\u0c97\u0cb2\u0cbf\u0cb2\u0ccd\u0cb2.",
    caution: "ಎಚ್ಚರಿಕೆ", historyEmpty: "ಇತ್ತೀಚಿನ ವಿಶ್ಲೇಷಣೆಗಳು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಸಂಗ್ರಹವಾಗುತ್ತವೆ.",
    gradeGood: "\u0c89\u0ca4\u0ccd\u0ca4\u0cae", gradeFair: "\u0cae\u0ca7\u0ccd\u0caf\u0cae", gradeNeeds: "\u0cb8\u0cc1\u0ca7\u0cbe\u0cb0\u0ca3\u0cc6 \u0cac\u0cc7\u0c95\u0cc1", gradePoor: "\u0cae\u0cca\u0cb8\u0ccd\u0ca4\u0cc1",
    low: "\u0c95\u0ca1\u0cbf\u0cae\u0cc6", adequate: "\u0cb8\u0cbe\u0c95\u0cb7\u0ccd\u0c9f\u0cc1", high: "\u0c85\u0ca7\u0cbf\u0c95",
    acidic: "\u0c85\u0cae\u0ccd\u0cb2\u0cc0\u0caf", alkaline: "\u0c95\u0ccd\u0cb7\u0cbe\u0cb0\u0cc0\u0caf", nearNeutral: "\u0cae\u0cbf\u0ca4\u0cb5\u0cbe\u0ca6 \u0ca4\u0c9f\u0cb8\u0ccd\u0ca5",
    veryLow: "\u0ca4\u0cc1\u0c82\u0cac\u0cbe \u0c95\u0ca1\u0cbf\u0cae\u0cc6", dry: "\u0cae\u0cb0\u0cb3\u0cc1", wet: "\u0ca4\u0cc7\u0cb5\u0cb5\u0cbe\u0c97\u0cbf\u0ca6\u0cc6",
  },
  Tamil: {
    title: "கிசான் மண் ஆலோசகர்", subtitle: "மண் ஆரோக்கியம் மற்றும் பயிர் வழிகாட்டுதல்",
    analyze: "என் மண்ணைப் பகுப்பாய்வு செய்", analyzing: "அளவீடுகளைச் சரிபார்க்கிறது...",
    languageLabel: "மொழி",
    sampleNote: "மாதிரி மதிப்புகள் முன்பே நிரப்பப்பட்டுள்ளன. உங்கள் மண் பரிசோதனை முடிவுகளால் மாற்றவும். இந்தச் செய்முறையில் ஆறு மதிப்புகளும் தேவை.",
    methodLabel: "இந்த முடிவு எவ்வாறு உருவானது", notLab: "விதி அடிப்படையிலான மதிப்பீடு — ஆய்வக நோயறிதலோ ML நம்பகத்தன்மை மதிப்பெண்ணோ அல்ல.",
    suited: "பொருத்தமானது", suitedAfterChanges: "மேம்படுத்திய பின் பொருத்தமானது", lowerFit: "குறைந்த பொருத்தம்", medium: "நடுத்தரம்",
    removeImage: "படத்தை அகற்று", openAnalysis: "பகுப்பாய்வைத் திற",
    fieldLabels: { nitrogen: "நைட்ரஜன் (N)", phosphorus: "பாஸ்பரஸ் (P)", potassium: "பொட்டாசியம் (K)", ph: "மண் pH", moisture: "ஈரப்பதம் (%)", organicMatter: "கரிமப் பொருள் (%)" },
    pdf: "மண் ஆரோக்கிய அறிக்கையைப் பதிவிறக்கு", pdfLoading: "PDF தயாராகிறது...", listen: "கேளுங்கள்",
    voiceRead: "சத்தமாக வாசி", voicePause: "இடைநிறுத்து", voiceResume: "தொடரவும்", voiceStop: "நிறுத்து",
    voicePlaying: "வாசிக்கப்படுகிறது", voicePaused: "வாசிப்பு இடைநிறுத்தப்பட்டது", voiceUnavailable: "இந்த உலாவியில் குரல் கிடைக்கவில்லை.",
    voiceDisabled: "குரல் உதவி முடக்கப்பட்டுள்ளது.", voiceEnabled: "குரல் உதவி", outOf: "இல்",
    inputs: "மண் அளவீடுகள்", results: "பகுப்பாய்வு", history: "சமீபத்திய பகுப்பாய்வுகள்",
    image: "மண் படம்", camera: "கேமரா",
    stop: "நிறுத்து", speaking: "முடிவுகள் வாசிக்கப்படுகின்றன", classification: "மண் வகைப்பாடு",
    confidence: "CNN நம்பகத்தன்மை", analysisDate: "பகுப்பாய்வு தேதி", deficiencies: "ஊட்டச்சத்து குறைபாடுகள்", noDeficiencies: "இந்தக் குறியீட்டு வரம்புகளில் குறைபாடு கண்டறியப்படவில்லை.",
    noClassification: "இந்தப் பகுப்பாய்விற்கு CNN பட வகைப்பாடு இல்லை.", dashboard: "டாஷ்போர்டு", login: "உள்நுழை",
    brandKicker: "விவசாய மண் பகுப்பாய்வு", mainNavigation: "முதன்மை வழிசெலுத்தல்",
    note: "உரமிடுவதற்கு முன் உள்ளூர் மண் சுகாதார அட்டை வழிகாட்டுதலைப் பின்பற்றவும்.",
    units: "N, P, K: mg/kg (ppm); கரிமப் பொருள் மற்றும் ஈரப்பதம் சதவீதத்தில்.",
    imageNote: "தெளிவான, நல்ல வெளிச்சமுள்ள மண் படத்தை எடுக்கவும். பின்தளம் இயங்கும்போது CNN வகைப்படுத்தும். மண் பரிசோதனை அளவுகளையும் கீழே உள்ளிடவும்.",
    imageModelPrediction: "சோதனை CNN கணிப்பு",
    imageModelWarning: "சிறிய சோதனைத் தொகுப்பில் இந்த மாதிரி 91.6% சரியாக இருந்தது; இருந்தாலும் தவறாக இருக்கலாம். மண் பரிசோதனை அல்லது உள்ளூர் வேளாண் நிபுணரிடம் உறுதிப்படுத்தவும்.",
    imageModelUnavailable: "பட வகைப்பாடு கிடைக்கவில்லை; மண் அளவீடுகளின் அடிப்படையில் ஆலோசனை காட்டப்படுகிறது.",
    empty: "மதிப்பெண், ஊட்டச்சத்து நடவடிக்கைகள் மற்றும் பயிர் தரவரிசையைக் காண மண் பரிசோதனை மதிப்புகளை உள்ளிடவும்.",
    soilConditions: "மண் நிலைகள்", recommendations: "பராமரிப்பு பரிந்துரைகள்",
    crops: "பயிர் பொருத்தம்", indicator: "குறியீடு", value: "மதிப்பு", status: "நிலை",
    crop: "பயிர்", score: "மதிப்பெண்", fit: "பொருத்தம்", limits: "மேம்படுத்த வேண்டியவை",
    time: "நேரம்", condition: "நிலை", topCrop: "முதன்மைப் பயிர்", upload: "படத்தைப் பதிவேற்றவும்",
    imageError: "10 MB-க்கு குறைவான சரியான படத்தைத் தேர்ந்தெடுக்கவும்.",
    speechError: "இந்த உலாவியில் குரல் வெளியீடு கிடைக்கவில்லை.",
    pdfError: "PDF அறிக்கையை உருவாக்க முடியவில்லை.",
    historyError: "பகுப்பாய்வு முடிந்தது; ஆனால் இந்த உலாவியில் சமீபத்திய வரலாற்றைச் சேமிக்க முடியவில்லை.",
    analyzeError: "மண் அளவீடுகளைப் பகுப்பாய்வு செய்ய முடியவில்லை.", caution: "எச்சரிக்கை",
    historyEmpty: "சமீபத்திய பகுப்பாய்வுகள் இந்த உலாவியில் மட்டுமே சேமிக்கப்படும்.",
    gradeGood: "நன்று", gradeFair: "மிதமானது", gradeNeeds: "மேம்படுத்த வேண்டும்", gradePoor: "மோசம்",
    low: "குறைவு", adequate: "போதுமானது", high: "அதிகம்", acidic: "அமிலத்தன்மை",
    alkaline: "காரத்தன்மை", nearNeutral: "கிட்டத்தட்ட நடுநிலை", veryLow: "மிகக் குறைவு",
    dry: "உலர்", wet: "ஈரமானது",
  },
};

const initial: SoilInput = { nitrogen: 45, phosphorus: 25, potassium: 110, ph: 5.2, moisture: 18, organicMatter: 1.1 };
const voicePreferenceKey = "soil-advisor-voice-enabled";

const advisorTranslations: Partial<Record<Language, Record<string, string>>> = {
  Hindi: {
    "Confirm the crop-specific nitrogen dose using the soil-test report and local Soil Health Card.": "मिट्टी-जाँच रिपोर्ट और स्थानीय मृदा स्वास्थ्य कार्ड के अनुसार फसल के लिए नाइट्रोजन मात्रा की पुष्टि करें।",
    "Split nitrogen applications to match crop demand and reduce avoidable losses.": "फसल की आवश्यकता के अनुसार नाइट्रोजन को किस्तों में दें।",
    "Use composted manure, legumes or green manure where suitable.": "उपयुक्त होने पर कम्पोस्ट खाद, दलहनी फसल या हरी खाद का उपयोग करें।",
    "Confirm the crop-specific phosphorus dose from the Soil Health Card or local extension service.": "मृदा स्वास्थ्य कार्ड या स्थानीय कृषि सेवा से फसल के लिए फॉस्फोरस मात्रा की पुष्टि करें।",
    "Use locally recommended basal placement near the root zone.": "स्थानीय सलाह के अनुसार जड़ क्षेत्र के पास आधार उर्वरक दें।",
    "Maintain organic matter and suitable crop residues.": "जैविक पदार्थ और उपयुक्त फसल अवशेष बनाए रखें।",
    "Confirm the crop-specific potassium dose from the Soil Health Card or local extension service.": "मृदा स्वास्थ्य कार्ड या स्थानीय कृषि सेवा से फसल के लिए पोटैशियम मात्रा की पुष्टि करें।",
    "Apply at the crop stage and placement advised locally.": "स्थानीय सलाह के अनुसार फसल अवस्था और स्थान पर डालें।",
    "Return suitable crop residues to the soil.": "उपयुक्त फसल अवशेषों को मिट्टी में वापस मिलाएँ।",
    "Review the soil test and crop plan before adding nitrogen.": "नाइट्रोजन डालने से पहले मिट्टी-जाँच और फसल योजना देखें।",
    "Review the soil test and crop plan before adding phosphorus.": "फॉस्फोरस डालने से पहले मिट्टी-जाँच और फसल योजना देखें।",
    "Review the soil test and crop plan before adding potassium.": "पोटैशियम डालने से पहले मिट्टी-जाँच और फसल योजना देखें।",
    "Avoid routine nitrogen application until the recommendation is confirmed.": "सिफारिश की पुष्टि होने तक नियमित नाइट्रोजन न डालें।",
    "Avoid routine phosphorus application until the recommendation is confirmed.": "सिफारिश की पुष्टि होने तक नियमित फॉस्फोरस न डालें।",
    "Avoid routine potassium application until the recommendation is confirmed.": "सिफारिश की पुष्टि होने तक नियमित पोटैशियम न डालें।",
    "Request lime-requirement or buffer-pH testing before selecting an application rate.": "मात्रा तय करने से पहले चूना आवश्यकता या बफर pH जाँच कराएँ।",
    "Use agricultural lime or dolomite only at a locally recommended rate.": "कृषि चूना या डोलोमाइट केवल स्थानीय अनुशंसित मात्रा में उपयोग करें।",
    "Consider locally adapted acid-tolerant crops while soil constraints are addressed.": "मिट्टी की समस्या सुधारते समय स्थानीय अम्ल-सहिष्णु फसलों पर विचार करें।",
    "Check electrical conductivity, sodicity and irrigation-water quality before selecting an amendment.": "सुधारक चुनने से पहले विद्युत चालकता, सोडिसिटी और सिंचाई जल की गुणवत्ता जाँचें।",
    "Consult a local soil laboratory or extension service for a field-specific plan.": "खेत के अनुसार योजना के लिए स्थानीय मिट्टी प्रयोगशाला या कृषि सेवा से सलाह लें।",
    "Maintain organic inputs where appropriate.": "उपयुक्त होने पर जैविक इनपुट बनाए रखें।",
    "Use mature compost or well-decomposed manure where suitable.": "उपयुक्त होने पर परिपक्व कम्पोस्ट या अच्छी तरह सड़ी खाद उपयोग करें।",
    "Add green manure, cover crops or legumes when the rotation allows.": "फसल चक्र अनुमति दे तो हरी खाद, आवरण फसल या दलहन शामिल करें।",
    "Avoid unnecessary residue burning.": "फसल अवशेषों को अनावश्यक रूप से न जलाएँ।",
    "Use mulch and schedule irrigation according to crop stage, soil texture and weather.": "फसल अवस्था, मिट्टी बनावट और मौसम के अनुसार मल्च और सिंचाई अपनाएँ।",
    "Check drainage, irrigation timing and compaction before adding fertilizer.": "उर्वरक डालने से पहले जल निकासी, सिंचाई समय और मिट्टी दबाव जाँचें।",
    "Continue crop-specific soil-test planning and periodic testing.": "फसल के अनुसार मिट्टी-जाँच योजना और नियमित परीक्षण जारी रखें।",
    "Use crop- and district-specific Soil Health Card guidance; do not apply a universal rate from these demonstration bands.": "फसल और जिले के मृदा स्वास्थ्य कार्ड की सलाह मानें; इन उदाहरण सीमाओं से सार्वभौमिक मात्रा तय न करें।",
    "Phosphorus interpretation depends on the laboratory extraction method and local calibration.": "फॉस्फोरस की व्याख्या प्रयोगशाला विधि और स्थानीय मानकीकरण पर निर्भर करती है।",
    "A high test value is not, by itself, a diagnosis of toxicity.": "केवल ऊँचा परीक्षण मान विषाक्तता का निदान नहीं है।",
    "Do not estimate a lime rate from pH alone; soil texture and buffer capacity matter.": "केवल pH से चूने की मात्रा न आँकें; मिट्टी की बनावट और बफर क्षमता भी महत्त्वपूर्ण हैं।",
    "High pH alone does not establish sodicity or identify the correct amendment.": "केवल ऊँचा pH सोडिसिटी सिद्ध नहीं करता और सही सुधारक नहीं बताता।",
    "Account for nutrients in organic inputs and follow local nutrient-management guidance.": "जैविक इनपुट के पोषक तत्वों को गणना में लें और स्थानीय पोषक-प्रबंधन सलाह अपनाएँ।",
    "A single moisture reading does not represent seasonal field water availability.": "एक नमी माप पूरे मौसम में खेत की जल उपलब्धता नहीं बताता।",
    "This prototype does not assess micronutrients, salinity, pests or disease.": "यह प्रोटोटाइप सूक्ष्म पोषक तत्व, लवणता, कीट या रोग का आकलन नहीं करता।",
    "Enter valid non-negative numeric values.": "शून्य या उससे अधिक के मान दर्ज करें।",
    "pH must be between 0 and 14.": "pH का मान 0 से 14 के बीच होना चाहिए।",
    "Moisture and organic matter must be percentages from 0 to 100.": "नमी और जैविक पदार्थ का मान 0 से 100 प्रतिशत के बीच होना चाहिए।",
    "Upload a JPEG or PNG image.": "JPEG या PNG छवि अपलोड करें।",
    "Image must be smaller than 10 MB.": "छवि 10 MB से छोटी होनी चाहिए।",
    "CNN model unavailable. Showing rule-based soil advisory only.": "CNN मॉडल उपलब्ध नहीं है। केवल नियम-आधारित मिट्टी सलाह दिखाई जा रही है।",
  },
  Kannada: {
    "Confirm the crop-specific nitrogen dose using the soil-test report and local Soil Health Card.": "ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ವರದಿ ಮತ್ತು ಸ್ಥಳೀಯ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಆಧರಿಸಿ ಬೆಳೆಗೆ ಬೇಕಾದ ಸಾರಜನಕ ಪ್ರಮಾಣವನ್ನು ಖಚಿತಪಡಿಸಿ.",
    "Split nitrogen applications to match crop demand and reduce avoidable losses.": "ಬೆಳೆಯ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ಸಾರಜನಕವನ್ನು ಹಂತ ಹಂತವಾಗಿ ನೀಡಿ.",
    "Use composted manure, legumes or green manure where suitable.": "ಸೂಕ್ತವಾದಲ್ಲಿ ಕಾಂಪೋಸ್ಟ್ ಗೊಬ್ಬರ, ದ್ವಿದಳ ಧಾನ್ಯ ಅಥವಾ ಹಸಿರು ಗೊಬ್ಬರ ಬಳಸಿ.",
    "Confirm the crop-specific phosphorus dose from the Soil Health Card or local extension service.": "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಅಥವಾ ಸ್ಥಳೀಯ ಕೃಷಿ ಸೇವೆಯಿಂದ ಬೆಳೆಗೆ ಬೇಕಾದ ರಂಜಕ ಪ್ರಮಾಣ ಖಚಿತಪಡಿಸಿ.",
    "Use locally recommended basal placement near the root zone.": "ಸ್ಥಳೀಯ ಸಲಹೆಯಂತೆ ಬೇರು ವಲಯದ ಬಳಿ ಮೂಲ ಗೊಬ್ಬರ ನೀಡಿ.",
    "Maintain organic matter and suitable crop residues.": "ಸಾವಯವ ಪದಾರ್ಥ ಮತ್ತು ಸೂಕ್ತ ಬೆಳೆ ಅವಶೇಷಗಳನ್ನು ಉಳಿಸಿ.",
    "Confirm the crop-specific potassium dose from the Soil Health Card or local extension service.": "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಅಥವಾ ಸ್ಥಳೀಯ ಕೃಷಿ ಸೇವೆಯಿಂದ ಬೆಳೆಗೆ ಬೇಕಾದ ಪೊಟ್ಯಾಸಿಯಂ ಪ್ರಮಾಣ ಖಚಿತಪಡಿಸಿ.",
    "Apply at the crop stage and placement advised locally.": "ಸ್ಥಳೀಯ ಸಲಹೆಯಂತೆ ಬೆಳೆಯ ಹಂತ ಮತ್ತು ಸ್ಥಳದಲ್ಲಿ ಅನ್ವಯಿಸಿ.",
    "Return suitable crop residues to the soil.": "ಸೂಕ್ತ ಬೆಳೆ ಅವಶೇಷಗಳನ್ನು ಮಣ್ಣಿಗೆ ಮರಳಿಸಿ.",
    "Review the soil test and crop plan before adding nitrogen.": "ಸಾರಜನಕ ನೀಡುವ ಮೊದಲು ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಬೆಳೆ ಯೋಜನೆ ಪರಿಶೀಲಿಸಿ.",
    "Review the soil test and crop plan before adding phosphorus.": "ರಂಜಕ ನೀಡುವ ಮೊದಲು ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಬೆಳೆ ಯೋಜನೆ ಪರಿಶೀಲಿಸಿ.",
    "Review the soil test and crop plan before adding potassium.": "ಪೊಟ್ಯಾಸಿಯಂ ನೀಡುವ ಮೊದಲು ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಬೆಳೆ ಯೋಜನೆ ಪರಿಶೀಲಿಸಿ.",
    "Avoid routine nitrogen application until the recommendation is confirmed.": "ಸಲಹೆ ಖಚಿತವಾಗುವವರೆಗೆ ರೂಢಿಯಾಗಿ ಸಾರಜನಕ ನೀಡಬೇಡಿ.",
    "Avoid routine phosphorus application until the recommendation is confirmed.": "ಸಲಹೆ ಖಚಿತವಾಗುವವರೆಗೆ ರೂಢಿಯಾಗಿ ರಂಜಕ ನೀಡಬೇಡಿ.",
    "Avoid routine potassium application until the recommendation is confirmed.": "ಸಲಹೆ ಖಚಿತವಾಗುವವರೆಗೆ ರೂಢಿಯಾಗಿ ಪೊಟ್ಯಾಸಿಯಂ ನೀಡಬೇಡಿ.",
    "Request lime-requirement or buffer-pH testing before selecting an application rate.": "ಪ್ರಮಾಣ ಆಯ್ಕೆಮಾಡುವ ಮೊದಲು ಸುಣ್ಣದ ಅಗತ್ಯ ಅಥವಾ ಬಫರ್-pH ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ.",
    "Use agricultural lime or dolomite only at a locally recommended rate.": "ಕೃಷಿ ಸುಣ್ಣ ಅಥವಾ ಡೊಲೊಮೈಟ್ ಅನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮಾಣದಲ್ಲಿ ಮಾತ್ರ ಬಳಸಿ.",
    "Consider locally adapted acid-tolerant crops while soil constraints are addressed.": "ಮಣ್ಣಿನ ಸಮಸ್ಯೆ ಸರಿಪಡಿಸುವಾಗ ಸ್ಥಳೀಯ ಆಮ್ಲ-ಸಹಿಷ್ಣು ಬೆಳೆಗಳನ್ನು ಪರಿಗಣಿಸಿ.",
    "Check electrical conductivity, sodicity and irrigation-water quality before selecting an amendment.": "ಸುಧಾರಕ ಆಯ್ಕೆಗೆ ಮೊದಲು ವಿದ್ಯುತ್ ವಾಹಕತೆ, ಸೋಡಿಸಿಟಿ ಮತ್ತು ನೀರಾವರಿ ನೀರಿನ ಗುಣಮಟ್ಟ ಪರೀಕ್ಷಿಸಿ.",
    "Consult a local soil laboratory or extension service for a field-specific plan.": "ಹೊಲಕ್ಕೆ ತಕ್ಕ ಯೋಜನೆಗಾಗಿ ಸ್ಥಳೀಯ ಮಣ್ಣಿನ ಪ್ರಯೋಗಾಲಯ ಅಥವಾ ಕೃಷಿ ಸೇವೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    "Maintain organic inputs where appropriate.": "ಸೂಕ್ತವಾದಲ್ಲಿ ಸಾವಯವ ಪದಾರ್ಥಗಳನ್ನು ಮುಂದುವರಿಸಿ.",
    "Use mature compost or well-decomposed manure where suitable.": "ಸೂಕ್ತವಾದಲ್ಲಿ ಪೂರ್ಣವಾಗಿ ಮಾಗಿದ ಕಾಂಪೋಸ್ಟ್ ಅಥವಾ ಕೊಳೆತ ಗೊಬ್ಬರ ಬಳಸಿ.",
    "Add green manure, cover crops or legumes when the rotation allows.": "ಬೆಳೆ ಸರದಿ ಅನುಮತಿಸಿದರೆ ಹಸಿರು ಗೊಬ್ಬರ, ಹೊದಿಕೆ ಬೆಳೆ ಅಥವಾ ದ್ವಿದಳ ಧಾನ್ಯ ಸೇರಿಸಿ.",
    "Avoid unnecessary residue burning.": "ಅಗತ್ಯವಿಲ್ಲದೆ ಬೆಳೆ ಅವಶೇಷಗಳನ್ನು ಸುಡಬೇಡಿ.",
    "Use mulch and schedule irrigation according to crop stage, soil texture and weather.": "ಬೆಳೆ ಹಂತ, ಮಣ್ಣಿನ ರಚನೆ ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ತಕ್ಕಂತೆ ಮಲ್ಚ್ ಮತ್ತು ನೀರಾವರಿ ಯೋಜಿಸಿ.",
    "Check drainage, irrigation timing and compaction before adding fertilizer.": "ಗೊಬ್ಬರ ಹಾಕುವ ಮೊದಲು ನೀರು ಹರಿವು, ನೀರಾವರಿ ಸಮಯ ಮತ್ತು ಮಣ್ಣಿನ ಗಟ್ಟಿತನ ಪರಿಶೀಲಿಸಿ.",
    "Continue crop-specific soil-test planning and periodic testing.": "ಬೆಳೆ ಆಧಾರಿತ ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ಯೋಜನೆ ಮತ್ತು ನಿಯಮಿತ ಪರೀಕ್ಷೆ ಮುಂದುವರಿಸಿ.",
    "Use crop- and district-specific Soil Health Card guidance; do not apply a universal rate from these demonstration bands.": "ಬೆಳೆ ಮತ್ತು ಜಿಲ್ಲೆಯ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಸಲಹೆ ಅನುಸರಿಸಿ; ಈ ಮಾದರಿ ಮಿತಿಗಳಿಂದ ಸಾರ್ವತ್ರಿಕ ಪ್ರಮಾಣ ನಿಗದಿಪಡಿಸಬೇಡಿ.",
    "Phosphorus interpretation depends on the laboratory extraction method and local calibration.": "ರಂಜಕದ ಅರ್ಥೈಸುವಿಕೆ ಪ್ರಯೋಗಾಲಯದ ವಿಧಾನ ಮತ್ತು ಸ್ಥಳೀಯ ಮಾನದಂಡದ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿದೆ.",
    "A high test value is not, by itself, a diagnosis of toxicity.": "ಹೆಚ್ಚಿನ ಪರೀಕ್ಷಾ ಮೌಲ್ಯ ಮಾತ್ರವೇ ವಿಷಕಾರಿತ್ವದ ನಿರ್ಣಯವಲ್ಲ.",
    "Do not estimate a lime rate from pH alone; soil texture and buffer capacity matter.": "pH ಒಂದರಿಂದಲೇ ಸುಣ್ಣದ ಪ್ರಮಾಣ ಅಂದಾಜಿಸಬೇಡಿ; ಮಣ್ಣಿನ ರಚನೆ ಮತ್ತು ಬಫರ್ ಸಾಮರ್ಥ್ಯವೂ ಮುಖ್ಯ.",
    "High pH alone does not establish sodicity or identify the correct amendment.": "ಹೆಚ್ಚಿನ pH ಮಾತ್ರದಿಂದ ಸೋಡಿಸಿಟಿ ಅಥವಾ ಸರಿಯಾದ ಸುಧಾರಕ ನಿರ್ಧಾರವಾಗುವುದಿಲ್ಲ.",
    "Account for nutrients in organic inputs and follow local nutrient-management guidance.": "ಸಾವಯವ ಒಳಾಂಶಗಳ ಪೋಷಕಾಂಶಗಳನ್ನು ಲೆಕ್ಕಿಸಿ ಸ್ಥಳೀಯ ನಿರ್ವಹಣಾ ಸಲಹೆ ಅನುಸರಿಸಿ.",
    "A single moisture reading does not represent seasonal field water availability.": "ಒಂದು ತೇವಾಂಶದ ಅಳತೆ ಇಡೀ ಋತುವಿನ ಹೊಲದ ನೀರಿನ ಲಭ್ಯತೆಯನ್ನು ಸೂಚಿಸುವುದಿಲ್ಲ.",
    "This prototype does not assess micronutrients, salinity, pests or disease.": "ಈ ಮಾದರಿ ಸೂಕ್ಷ್ಮ ಪೋಷಕಾಂಶ, ಲವಣಾಂಶ, ಕೀಟ ಅಥವಾ ರೋಗವನ್ನು ಅಳೆಯುವುದಿಲ್ಲ.",
    "Enter valid non-negative numeric values.": "ಶೂನ್ಯ ಅಥವಾ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಸಂಖ್ಯೆಯ ಮೌಲ್ಯಗಳನ್ನು ನಮೂದಿಸಿ.",
    "pH must be between 0 and 14.": "pH ಮೌಲ್ಯವು 0 ರಿಂದ 14ರ ನಡುವೆ ಇರಬೇಕು.",
    "Moisture and organic matter must be percentages from 0 to 100.": "ತೇವಾಂಶ ಮತ್ತು ಸಾವಯವ ಪದಾರ್ಥದ ಮೌಲ್ಯಗಳು 0 ರಿಂದ 100 ಪ್ರತಿಶತದ ನಡುವೆ ಇರಬೇಕು.",
    "Upload a JPEG or PNG image.": "JPEG ಅಥವಾ PNG ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    "Image must be smaller than 10 MB.": "ಚಿತ್ರವು 10 MB ಗಿಂತ ಚಿಕ್ಕದಾಗಿರಬೇಕು.",
    "CNN model unavailable. Showing rule-based soil advisory only.": "CNN ಮಾದರಿ ಲಭ್ಯವಿಲ್ಲ. ನಿಯಮ-ಆಧಾರಿತ ಮಣ್ಣಿನ ಸಲಹೆ ಮಾತ್ರ ತೋರಿಸಲಾಗುತ್ತಿದೆ.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSoilInput(value: unknown): value is SoilInput {
  if (!isRecord(value)) return false;
  return ["nitrogen", "phosphorus", "potassium", "ph", "moisture", "organicMatter"]
    .every((key) => typeof value[key] === "number" && Number.isFinite(value[key]));
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!isRecord(value)) return false;
  const statuses = value.statuses;
  if (!isRecord(statuses) || !Array.isArray(value.recommendations) || !Array.isArray(value.crops)) return false;
  const statusesValid = ["nitrogen", "phosphorus", "potassium", "ph", "moisture", "organicMatter"]
    .every((key) => typeof statuses[key] === "string");
  const recommendationsValid = value.recommendations.every((item) =>
    isRecord(item) &&
    typeof item.title === "string" &&
    ["High", "Medium", "Low"].includes(String(item.priority)) &&
    Array.isArray(item.actions) &&
    item.actions.every((action) => typeof action === "string") &&
    typeof item.caution === "string",
  );
  const cropsValid = value.crops.every((crop) =>
    isRecord(crop) &&
    typeof crop.name === "string" &&
    typeof crop.score === "number" &&
    typeof crop.status === "string" &&
    typeof crop.limits === "string",
  );
  return typeof value.score === "number" &&
    Number.isFinite(value.score) &&
    typeof value.grade === "string" &&
    statusesValid &&
    recommendationsValid &&
    cropsValid;
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (!isRecord(value) ||
      typeof value.time !== "string" ||
      typeof value.score !== "number" ||
      typeof value.grade !== "string" ||
      typeof value.crop !== "string") return false;
  if (value.input === undefined && value.result === undefined) return true;
  return isSoilInput(value.input) && isAnalysisResult(value.result);
}

export default function Home() {
  const [form, setForm] = useState<SoilInput>(initial);
  const [analyzedForm, setAnalyzedForm] = useState<SoilInput>(initial);
  const [language, setLanguage] = useState<Language>("English");
  const [result, setResult] = useState<ReturnType<typeof analyze> | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePrediction, setImagePrediction] = useState<ImagePrediction | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [analysisTime, setAnalysisTime] = useState("");
  const text = copy[language];

  useEffect(() => {
    setLanguage(readLanguage());
    try {
      setVoiceEnabled(localStorage.getItem(voicePreferenceKey) !== "false");
    } catch {
      setVoiceEnabled(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "Hindi" ? "hi" : language === "Kannada" ? "kn" : language === "Tamil" ? "ta" : "en";
  }, [language]);

  useEffect(() => () => cancelSpeechOutput(), []);

  function changeLanguage(next: Language) {
    cancelSpeechOutput();
    setLanguage(next);
    saveLanguage(next);
  }

  function changeVoiceEnabled(enabled: boolean) {
    setVoiceEnabled(enabled);
    try {
      localStorage.setItem(voicePreferenceKey, String(enabled));
    } catch {}
    if (!enabled) cancelSpeechOutput();
  }

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem("soil-advisor-history") || "[]");
      if (!Array.isArray(stored)) throw new Error("History data must be an array.");
      setHistory(stored.filter(isHistoryItem));
    } catch (caught) {
      console.error("Could not load recent soil analyses.", caught);
      setError(copy[language].historyError);
    }

  }, []);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const conditions = useMemo(() => result ? [
    [text.fieldLabels.nitrogen, `${analyzedForm.nitrogen} mg/kg`, result.statuses.nitrogen],
    [text.fieldLabels.phosphorus, `${analyzedForm.phosphorus} mg/kg`, result.statuses.phosphorus],
    [text.fieldLabels.potassium, `${analyzedForm.potassium} mg/kg`, result.statuses.potassium],
    ["pH", String(analyzedForm.ph), result.statuses.ph],
    [text.fieldLabels.organicMatter, `${analyzedForm.organicMatter}%`, result.statuses.organicMatter],
    [text.fieldLabels.moisture, `${analyzedForm.moisture}%`, result.statuses.moisture],
  ] : [], [result, analyzedForm, text.fieldLabels]);

  function displayStatus(status: string): string {
    const translated: Record<string, string> = {
      Low: text.low, Adequate: text.adequate, High: text.high,
      Acidic: text.acidic, Alkaline: text.alkaline, "Near neutral": text.nearNeutral,
      "Very low": text.veryLow, Dry: text.dry, Wet: text.wet,
      Good: text.gradeGood, Fair: text.gradeFair,
      "Needs improvement": text.gradeNeeds, Poor: text.gradePoor,
      Medium: text.medium,
    };
    return translated[status] ?? status;
  }

  function displayCropStatus(status: string): string {
    if (status === "Suitable") return text.suited;
    if (status === "Suitable after improvement") return text.suitedAfterChanges;
    if (status === "Lower suitability") return text.lowerFit;
    return status;
  }

  function displayAdvisorText(value: string): string {
    if (language === "English") return value;
    const cropNames: Record<string, [string, string]> = {
      "Alluvial Soil": ["जलोढ़ मिट्टी", "ಮೆಕ್ಕಲು ಮಣ್ಣು"], "Black Soil": ["काली मिट्टी", "ಕಪ್ಪು ಮಣ್ಣು"],
      "Clay Soil": ["चिकनी मिट्टी", "ಜೇಡಿ ಮಣ್ಣು"], "Red Soil": ["लाल मिट्टी", "ಕೆಂಪು ಮಣ್ಣು"],
      Rice: ["चावल", "ಅಕ್ಕಿ"], Wheat: ["गेहूँ", "ಗೋಧಿ"], Maize: ["मक्का", "ಮೆಕ್ಕೆಜೋಳ"],
      Groundnut: ["मूँगफली", "ಕಡಲೆಕಾಯಿ"], Cotton: ["कपास", "ಹತ್ತಿ"], Potato: ["आलू", "ಆಲೂಗಡ್ಡೆ"],
      Chickpea: ["चना", "ಕಡಲೆ"], "Pearl millet": ["बाजरा", "ಸಜ್ಜೆ"],
    };
    if (cropNames[value]) return cropNames[value][language === "Hindi" ? 0 : 1];
    const factorNames: Record<string, [string, string]> = {
      pH: ["pH", "pH"], N: ["नाइट्रोजन", "ಸಾರಜನಕ"], P: ["फॉस्फोरस", "ರಂಜಕ"],
      K: ["पोटैशियम", "ಪೊಟ್ಯಾಸಿಯಂ"], "organic matter": ["जैविक पदार्थ", "ಸಾವಯವ ಪದಾರ್ಥ"],
      moisture: ["नमी", "ತೇವಾಂಶ"],
    };
    if (value.includes(", ")) return value.split(", ").map((part) => factorNames[part]?.[language === "Hindi" ? 0 : 1] ?? part).join(", ");
    return advisorTranslations[language]?.[value] ?? value;
  }

  function displayRecommendation(title: string, caution: boolean): string {
    if (language === "English") return title;
    const translations: Record<string, [string, string]> = {
      "Nitrogen management": ["\u0928\u093e\u0907\u091f\u094d\u0930\u094b\u091c\u0928 \u092a\u094d\u0930\u092c\u0902\u0927\u0928", "ಸಾರಜನಕ ನಿರ್ವಹಣೆ"],
      "Phosphorus management": ["\u092b\u093e\u0938\u094d\u092b\u094b\u0930\u0938 \u092a\u094d\u0930\u092c\u0902\u0927\u0928", "ರಂಜಕ ನಿರ್ವಹಣೆ"],
      "Potassium management": ["\u092a\u094b\u091f\u0947\u0936\u093f\u092f\u092e \u092a\u094d\u0930\u092c\u0902\u0927\u0928", "ಪೊಟ್ಯಾಸಿಯಂ ನಿರ್ವಹಣೆ"],
      "Acid soil management": ["\u0905\u092e\u094d\u0932\u0940\u092f \u092e\u093f\u091f\u094d\u091f\u0940 \u092a\u094d\u0930\u092c\u0902\u0927\u0928", "ಆಮ್ಲೀಯ ಮಣ್ಣಿನ ನಿರ್ವಹಣೆ"],
      "Alkaline soil assessment": ["\u0915\u094d\u0937\u093e\u0930\u0940\u092f \u092e\u093f\u091f\u094d\u091f\u0940 \u0915\u093e \u092e\u0942\u0932\u094d\u092f\u093e\u0902\u0915\u0928", "ಕ್ಷಾರೀಯ ಮಣ್ಣಿನ ಮೌಲ್ಯಮಾಪನ"],
      "Build organic matter": ["\u091c\u0948\u0935\u093f\u0915 \u092a\u0926\u093e\u0930\u094d\u0925 \u092c\u0922\u093c\u093e\u090f\u0902", "ಜೈವಿಕ ಪದಾರ್ಥ ಹೆಚ್ಚಿಸಿ"],
      "Build soil organic matter": ["\u091c\u0948\u0935\u093f\u0915 \u092a\u0926\u093e\u0930\u094d\u0925 \u092c\u0922\u093c\u093e\u090f\u0902", "ಜೈವಿಕ ಪದಾರ್ಥ ಹೆಚ್ಚಿಸಿ"],
      "Avoid extra nitrogen": ["\u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u0928\u093e\u0907\u091f\u094d\u0930\u094b\u091c\u0928 \u0928 \u0921\u093e\u0932\u0947\u0902", "ಹೆಚ್ಚುವರಿ ಸಾರಜನಕ ಹಾಕಬೇಡಿ"],
      "Avoid extra phosphorus": ["\u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u092b\u093e\u0938\u094d\u092b\u094b\u0930\u0938 \u0928 \u0921\u093e\u0932\u0947\u0902", "ಹೆಚ್ಚುವರಿ ರಂಜಕ ಹಾಕಬೇಡಿ"],
      "Avoid extra potassium": ["\u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u092a\u094b\u091f\u0947\u0936\u093f\u092f\u092e \u0928 \u0921\u093e\u0932\u0947\u0902", "ಹೆಚ್ಚುವರಿ ಪೊಟ್ಯಾಸಿಯಂ ಹಾಕಬೇಡಿ"],
      "Conserve moisture": ["\u0928\u092e\u0940 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930\u0947\u0902", "ಮಣ್ಣಿನ ತೇವಾಂಶ ಉಳಿಸಿ"],
      "Conserve soil moisture": ["\u0928\u092e\u0940 \u0938\u0902\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930\u0947\u0902", "ಮಣ್ಣಿನ ತೇವಾಂಶ ಉಳಿಸಿ"],
      "Check excess wetness": ["\u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u0928\u092e\u0940 \u0915\u0940 \u091c\u093e\u0902\u091a", "ಹೆಚ್ಚಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ"],
      "Review excess wetness": ["\u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u0928\u092e\u0940 \u0915\u0940 \u091c\u093e\u0902\u091a", "ಹೆಚ್ಚಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ"],
      "Review moisture management": ["\u0928\u092e\u0940 \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u0940 \u0938\u092e\u0940\u0915\u094d\u0937\u093e", "ತೇವಾಂಶ ನಿರ್ವಹಣೆ ಪರಿಶೀಲಿಸಿ"],
      "Maintain balanced management": ["\u0938\u0902\u0924\u0941\u0932\u093f\u0924 \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u092c\u0928\u093e\u090f \u0930\u0916\u0947\u0902", "ಸಮತೋಲಿತ ನಿರ್ವಹಣೆ ಮುಂದುವರಿಸಿ"],
      "Maintain balanced soil management": ["\u0938\u0902\u0924\u0941\u0932\u093f\u0924 \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u092c\u0928\u093e\u090f \u0930\u0916\u0947\u0902", "ಸಮತೋಲಿತ ನಿರ್ವಹಣೆ ಮುಂದುವರಿಸಿ"],
    };
    if (language === "Tamil") {
      const tamilTitles: Record<string, string> = {
        "Nitrogen management": "நைட்ரஜன் மேலாண்மை",
        "Phosphorus management": "பாஸ்பரஸ் மேலாண்மை",
        "Potassium management": "பொட்டாசியம் மேலாண்மை",
        "Acid soil management": "அமில மண் மேலாண்மை",
        "Alkaline soil assessment": "கார மண் மதிப்பீடு",
        "Build organic matter": "கரிமப் பொருளை அதிகரிக்கவும்",
        "Build soil organic matter": "மண்ணின் கரிமப் பொருளை அதிகரிக்கவும்",
        "Avoid extra nitrogen": "கூடுதல் நைட்ரஜன் இட வேண்டாம்",
        "Avoid extra phosphorus": "கூடுதல் பாஸ்பரஸ் இட வேண்டாம்",
        "Avoid extra potassium": "கூடுதல் பொட்டாசியம் இட வேண்டாம்",
        "Conserve moisture": "மண்ணின் ஈரப்பதத்தைப் பாதுகாக்கவும்",
        "Conserve soil moisture": "மண்ணின் ஈரப்பதத்தைப் பாதுகாக்கவும்",
        "Check excess wetness": "அதிக ஈரப்பதத்தைச் சரிபார்க்கவும்",
        "Review excess wetness": "அதிக ஈரப்பதத்தைச் சரிபார்க்கவும்",
        "Review moisture management": "ஈரப்பத மேலாண்மையைச் சரிபார்க்கவும்",
        "Maintain balanced management": "சமநிலையான மேலாண்மையைத் தொடரவும்",
        "Maintain balanced soil management": "சமநிலையான மண் மேலாண்மையைத் தொடரவும்",
      };
      return caution ? text.caution : tamilTitles[title] ?? title;
    }
    const pair = translations[title];
    if (!pair) return title;
    return caution ? text.caution : pair[language === "Hindi" ? 0 : 1];
  }

  function createResultSummary(): string {
    if (!result) return "";
    const deficiencies = deficiencyRows.map(([name]) => name);
    const suggestedActions = result.recommendations
      .slice(0, 2)
      .map((item) => item.actions[0] ? displayAdvisorText(item.actions[0]) : "")
      .filter(Boolean);
    const crops = result.crops.slice(0, 3).map((crop) => displayAdvisorText(crop.name));
    return [
      ...(imagePrediction ? [`${text.imageModelPrediction}: ${displayAdvisorText(imagePrediction.predicted_class)}, ${Math.round(imagePrediction.confidence * 100)}%. ${text.imageModelWarning}`] : []),
      `${text.score}: ${result.score} ${text.outOf} 100. ${displayStatus(result.grade)}`,
      `${text.deficiencies}: ${deficiencies.length ? deficiencies.join(", ") : text.noDeficiencies}`,
      ...(suggestedActions.length ? [`${text.recommendations}: ${suggestedActions.join(". ")}`] : []),
      ...(crops.length ? [`${text.crops}: ${crops.join(", ")}`] : []),
    ].map((part) => part.trim().replace(/[.!?।]+$/u, "")).filter(Boolean).join(". ");
  }

  function setValue(name: keyof SoilInput, value: string) {
    setForm((current) => ({ ...current, [name]: value.trim() === "" ? Number.NaN : Number(value) }));
  }

  function onImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setPreview("");
      setError(text.imageError);
      return;
    }
    setError("");
    setImageFile(file);
    setImagePrediction(null);
    setPreview(URL.createObjectURL(file));
  }

  function reopenAnalysis(item: HistoryItem) {
    if (!item.input || !item.result) return;
    setForm(item.input);
    setAnalyzedForm(item.input);
    setResult(item.result);
    setAnalysisTime(item.time);
    setError("");
    document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit() {
    if (isAnalyzing) return;
    cancelSpeechOutput();
    setIsAnalyzing(true);
    setError("");
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    try {
      const next = analyze(form);
      const time = new Date().toLocaleString();
      setResult(next);
      if (imageFile) {
        try {
          setImagePrediction(await predictImage(imageFile));
        } catch (imageError) {
          setImagePrediction(null);
          setError(imageError instanceof TypeError
            ? text.imageModelUnavailable || "Image model unavailable; showing rule-based soil advisory."
            : imageError instanceof Error
              ? displayAdvisorText(imageError.message)
              : text.imageModelUnavailable || "Image model unavailable; showing rule-based soil advisory.");
        }
      }
      setAnalyzedForm({ ...form });
      setAnalysisTime(time);
      const nextHistory = [
        {
          time,
          score: next.score,
          grade: next.grade,
          crop: next.crops[0].name,
          input: { ...form },
          result: next,
        },
        ...history,
      ].slice(0, 8);
      setHistory(nextHistory);
      try {
        localStorage.setItem("soil-advisor-history", JSON.stringify(nextHistory));
      } catch (caught) {
        console.error("Could not save recent soil analyses.", caught);
        setError(copy[language].historyError);
      }
    } catch (caught) {
      setError(caught instanceof Error ? displayAdvisorText(caught.message) : copy[language].analyzeError);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function downloadPdf() {
    if (!result || isDownloading) return;
    setIsDownloading(true);
    setError("");
    try {
      const pdf = new jsPDF();
      const fertilizerRecommendations = result.recommendations.filter((item) =>
        /nitrogen|phosphorus|potassium/i.test(item.title),
      );
      const managementRecommendations = result.recommendations.filter((item) =>
        !/nitrogen|phosphorus|potassium/i.test(item.title),
      );
      const reportConditions: [string, number | string, string][] = [
        ["Nitrogen (N)", `${analyzedForm.nitrogen} mg/kg`, result.statuses.nitrogen],
        ["Phosphorus (P)", `${analyzedForm.phosphorus} mg/kg`, result.statuses.phosphorus],
        ["Potassium (K)", `${analyzedForm.potassium} mg/kg`, result.statuses.potassium],
        ["pH", analyzedForm.ph, result.statuses.ph],
        ["Moisture", `${analyzedForm.moisture}%`, result.statuses.moisture],
        ["Organic matter", `${analyzedForm.organicMatter}%`, result.statuses.organicMatter],
      ];
      const reportDeficiencies = reportConditions
        .filter(([, , status]) => status === "Low" || status === "Very low")
        .map(([name, , status]) => `${name}: ${status}`);
      const lines = [
        "Kisan Soil Advisor",
        `Analysis date: ${analysisTime || new Date().toLocaleString()}`,
        "",
        "Image classification",
        imagePrediction
          ? `${imagePrediction.predicted_class} (${Math.round(imagePrediction.confidence * 100)}% model score). Experimental estimate only; confirm with a soil test or local agriculture expert.`
          : "CNN classification: Not available for this analysis.",
        `Soil-health score: ${result.score}/100 (${result.grade})`,
        "",
        "Soil readings",
        ...reportConditions.map(([name, value, status]) => `${name}: ${value} (${status})`),
        "",
        "Nutrient deficiencies",
        ...(reportDeficiencies.length ? reportDeficiencies : ["None identified by the displayed indicator bands."]),
        "",
        "Fertilizer recommendations",
        ...(fertilizerRecommendations.length ? fertilizerRecommendations : [{ title: "No nutrient-specific fertilizer action", actions: [], caution: "Follow the local soil-test recommendation." }]).flatMap((item) => [
          item.title,
          ...item.actions.map((action) => `- ${action}`),
          `Caution: ${item.caution}`,
          "",
        ]),
        "Soil management recommendations",
        ...(managementRecommendations.length ? managementRecommendations : [{ title: "No additional soil-management action", actions: [], caution: "Continue periodic soil testing." }]).flatMap((item) => [
          item.title,
          ...item.actions.map((action) => `- ${action}`),
          `Caution: ${item.caution}`,
          "",
        ]),
        "Suitable crop ranking",
        ...result.crops.map((crop) => `${crop.name}: ${crop.score}/100 - ${crop.status} (${crop.limits || "No demonstrated limitation"})`),
        "",
        "Confirm crop, season, soil-test method and local Soil Health Card guidance before applying fertilizer.",
      ];
      let y = 18;
      lines.forEach((line) => {
        const wrapped = pdf.splitTextToSize(line, 170);
        if (y + wrapped.length * 7 > 280) {
          pdf.addPage();
          y = 18;
        }
        pdf.text(wrapped, 20, y);
        y += wrapped.length * 7 + 3;
      });
      pdf.save("soil-health-report.pdf");
    } catch (caught) {
      console.error("Could not generate the soil report PDF.", caught);
      setError(caught instanceof Error ? `${text.pdfError} ${caught.message}` : text.pdfError);
    } finally {
      setIsDownloading(false);
    }
  }

  const inputFields: [keyof SoilInput, string][] = [
    ["nitrogen", text.fieldLabels.nitrogen],
    ["phosphorus", text.fieldLabels.phosphorus],
    ["potassium", text.fieldLabels.potassium],
    ["ph", text.fieldLabels.ph],
    ["moisture", text.fieldLabels.moisture],
    ["organicMatter", text.fieldLabels.organicMatter],
  ];
  const deficiencyRows = conditions.filter(([, , status]) => status === "Low" || status === "Very low");
  const voiceLabels = {
    read: text.voiceRead,
    pause: text.voicePause,
    resume: text.voiceResume,
    stop: text.voiceStop,
    playing: text.voicePlaying,
    paused: text.voicePaused,
    unavailable: text.voiceUnavailable,
    disabled: text.voiceDisabled,
  };

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">{text.brandKicker}</p>
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>
        <label className="language">
          {text.languageLabel}
          <select value={language} onChange={(event) => changeLanguage(event.target.value as Language)}>
            <option>English</option><option>Hindi</option><option>Kannada</option><option>Tamil</option>
          </select>
        </label>
        <label className="voice-setting">
          <input type="checkbox" checked={voiceEnabled} onChange={(event) => changeVoiceEnabled(event.target.checked)} />
          <span>{text.voiceEnabled}</span>
        </label>
      </header>
      <nav className="section-nav" aria-label={text.mainNavigation}>
        <a href="/dashboard">{text.dashboard}</a>
        <a href="#soil-inputs">{text.inputs}</a>
        <a href="#analysis">{text.results}</a>
        <a href="#recent-analyses">{text.history}</a>
        <a href="/login">{text.login}</a>
      </nav>
      <section className="workspace">
        <aside className="inputs" id="soil-inputs">
          <h2>{text.inputs}</h2>
          <p className="units">{text.units}</p>
          <label className="image-input">
            {text.image}
            <input type="file" accept="image/*" capture="environment" onChange={onImage} />
            <span>{text.camera} / {text.upload}</span>
          </label>
          <p className="sample-note">{text.sampleNote}</p>
          <p className="units">{text.imageNote}</p>
          {preview && (
            <div className="preview-wrap">
              <img className="preview" src={preview} alt={text.image} />
              <button type="button" className="remove-image" onClick={() => { setPreview(""); setImageFile(null); setImagePrediction(null); }}>{text.removeImage}</button>
            </div>
          )}
          {imagePrediction && (
            <div className="status-card" aria-live="polite">
              <strong>{text.imageModelPrediction}</strong>
              <span>{displayAdvisorText(imagePrediction.predicted_class)} ({Math.round(imagePrediction.confidence * 100)}%)</span>
              <p className="model-warning">{text.imageModelWarning}</p>
            </div>
          )}
          <div className="field-grid">
            {inputFields.map(([name, label]) => (
              <label key={name}>
                {label}
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={name === "ph" ? 14 : name === "moisture" || name === "organicMatter" ? 100 : undefined}
                  value={Number.isFinite(form[name]) ? form[name] : ""}
                  onChange={(event) => setValue(name, event.target.value)}
                />
              </label>
            ))}
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="primary" onClick={submit} disabled={isAnalyzing} aria-busy={isAnalyzing} aria-live="polite">
            <span aria-hidden="true">✦</span>
            {isAnalyzing ? text.analyzing : text.analyze}
          </button>
        </aside>
        <section className="results" id="analysis">
          <h2>{text.results}</h2>
          {!result ? <p className="empty">{text.empty}</p> : <>
            <div className="score-row">
              <div
                className={`score-gauge grade-${result.grade.toLowerCase().replace(/\s+/g, "-")}`}
                role="img"
                aria-label={`${text.score}: ${result.score} out of 100`}
                style={{ background: `conic-gradient(var(--score-color) ${result.score * 3.6}deg, var(--line) 0)` }}
              >
                <div className="score"><strong>{result.score}</strong><span>/100</span></div>
              </div>
              <div>
                <p className="eyebrow">{text.methodLabel}</p>
                <h3>{displayStatus(result.grade)}</h3>
                <p className="result-disclaimer">{text.notLab}</p>
                <p>{text.note}</p>
                <VoiceAssistant text={`${text.score}: ${result.score} ${text.outOf} 100. ${displayStatus(result.grade)}`} language={language} enabled={voiceEnabled} labels={voiceLabels} />
              </div>
              <div className="actions">
                <VoiceAssistant text={createResultSummary()} language={language} enabled={voiceEnabled} labels={{ ...voiceLabels, read: text.listen }} />
                <button onClick={downloadPdf} disabled={isDownloading} aria-busy={isDownloading} aria-label={text.pdf}>
                  {isDownloading ? text.pdfLoading : text.pdf}
                </button>
              </div>
            </div>
            <ul className="result-meta" aria-live="polite">
              <li><strong>{text.analysisDate}:</strong> {analysisTime}</li>
            </ul>
            <h3>{text.soilConditions}</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>{text.indicator}</th><th>{text.value}</th><th>{text.status}</th></tr></thead>
                <tbody>{conditions.map(([name, value, status]) => (
                  <tr key={name}><td>{name}</td><td>{value}</td><td><span className={`status status-${String(status).toLowerCase().replace(/\s+/g, "-")}`}><span aria-hidden="true">{["Low", "Very low", "Acidic", "Alkaline", "High"].includes(String(status)) ? "!" : "✓"}</span> {displayStatus(String(status))}</span></td></tr>
                ))}</tbody>
              </table>
            </div>
            <h3>{text.deficiencies}</h3>
            {deficiencyRows.length ? <ul className="deficiency-list">
              {deficiencyRows.map(([name, value, status]) => <li key={name}>{name}: {value} ({displayStatus(String(status))})</li>)}
            </ul> : <p className="empty">{text.noDeficiencies}</p>}
            <VoiceAssistant
              text={`${text.deficiencies}: ${deficiencyRows.length ? deficiencyRows.map(([name, , status]) => `${name}: ${displayStatus(String(status))}`).join(". ") : text.noDeficiencies}`}
              language={language}
              enabled={voiceEnabled}
              labels={voiceLabels}
            />
            <h3>{text.recommendations}</h3>
            <div className="recommendations">
              {result.recommendations.map((item) => (
                <article key={item.title}>
                  <div><span className={`priority ${item.priority.toLowerCase()}`}>{displayStatus(item.priority)}</span><h4>{displayRecommendation(item.title, false)}</h4></div>
                  <ul>{item.actions.map((action) => <li key={action}>{displayAdvisorText(action)}</li>)}</ul>
                  <p className="caution"><strong>{text.caution}:</strong> {displayAdvisorText(item.caution)}</p>
                  <VoiceAssistant
                    text={[
                      displayRecommendation(item.title, false),
                      ...item.actions.map(displayAdvisorText),
                      `${text.caution}: ${displayAdvisorText(item.caution)}`,
                    ].map((part) => part.trim().replace(/[.!?।]+$/u, "")).filter(Boolean).join(". ")}
                    language={language}
                    enabled={voiceEnabled}
                    labels={voiceLabels}
                  />
                </article>
              ))}
            </div>
            <h3>{text.crops}</h3>
            <div className="crop-list">
              {result.crops.map((crop, index) => (
                <details className="crop-card" key={crop.name}>
                  <summary>
                    <span className="crop-title"><span className="crop-rank" aria-label={`Rank ${index + 1}`}>{index + 1}</span>{displayAdvisorText(crop.name)}</span>
                    <span className="crop-value">{crop.score}/100</span>
                    <progress value={crop.score} max={100} aria-label={`${crop.name}: ${crop.score} ${text.score}`} />
                  </summary>
                  <div className="crop-details">
                    <strong>{displayCropStatus(crop.status)}</strong>
                    <p>{text.limits}: {crop.limits ? displayAdvisorText(crop.limits) : "—"}</p>
                    <VoiceAssistant
                      text={`${displayAdvisorText(crop.name)}. ${displayCropStatus(crop.status)}. ${crop.limits ? `${text.limits}: ${displayAdvisorText(crop.limits)}` : ""}`}
                      language={language}
                      enabled={voiceEnabled}
                      labels={voiceLabels}
                    />
                  </div>
                </details>
              ))}
            </div>
          </>}
        </section>
      </section>
      <section className="history" id="recent-analyses">
        <h2>{text.history}</h2>
        {history.length ? <div className="table-wrap">
          <table>
            <thead><tr><th>{text.time}</th><th>{text.score}</th><th>{text.condition}</th><th>{text.topCrop}</th></tr></thead>
            <tbody>{history.map((item, index) => (
              <tr key={`${item.time}-${item.score}-${index}`}>
                <td>{item.time}{item.result && item.input && <button className="history-open" onClick={() => reopenAnalysis(item)}>{text.openAnalysis}</button>}</td>
                <td>{item.score}/100</td><td>{displayStatus(item.grade)}</td><td>{item.crop}</td>
              </tr>
            ))}</tbody>
          </table>
        </div> : <p className="empty">{text.historyEmpty}</p>}
      </section>
    </main>
  );
}
