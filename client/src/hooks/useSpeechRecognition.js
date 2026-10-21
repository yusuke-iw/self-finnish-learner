import { useState } from 'react';
import { replaceNumbersWithFinnishWords } from '../utils/numberToFinnish';

// Browser speech recognition (fi-FI). `onTranscript` receives the recognised text
// with digits replaced by Finnish number words.
export function useSpeechRecognition(onTranscript) {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'fi-FI';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsRecording(true);

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = replaceNumbersWithFinnishWords(transcript);
      onTranscript(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  return { isRecording, startRecording };
}
