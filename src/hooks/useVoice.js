import { useState, useRef, useCallback, useEffect } from "react";

export function useVoice({ onResult, onError, lang = "en-US" } = {}) {
  const [listening, setListening]   = useState(false);
  const [supported, setSupported]   = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError]           = useState(null);
  const recRef = useRef(null);

  useEffect(() => {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
    return () => {
      if (recRef.current) {
        try { recRef.current.abort(); } catch {}
      }
    };
  }, []);

  const start = useCallback(() => {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      const msg = "Speech recognition is not supported in this browser. Try Chrome or Edge.";
      setError(msg);
      onError?.(msg);
      return;
    }

    // Stop any existing session
    if (recRef.current) {
      try { recRef.current.abort(); } catch {}
    }

    setError(null);
    setTranscript("");

    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onstart = () => setListening(true);

    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      setTranscript(text);
      onResult?.(text);
    };

    rec.onerror = (e) => {
      let msg = "Voice input failed.";
      switch (e.error) {
        case "not-allowed":
          msg = "Microphone access denied. Allow microphone permissions and try again.";
          break;
        case "no-speech":
          msg = "No speech detected. Please try again.";
          break;
        case "network":
          msg = "Network error during voice recognition. Check your connection.";
          break;
        case "audio-capture":
          msg = "No microphone found. Plug in a mic and try again.";
          break;
        case "aborted":
          // User or code cancelled — not an error to surface
          setListening(false);
          return;
        default:
          msg = `Voice error: ${e.error}`;
      }
      setError(msg);
      onError?.(msg);
      setListening(false);
    };

    rec.onend = () => setListening(false);

    try {
      rec.start();
      recRef.current = rec;
    } catch (e) {
      const msg = "Could not start voice input. Ensure microphone access is granted.";
      setError(msg);
      onError?.(msg);
    }
  }, [lang, onResult, onError]);

  const stop = useCallback(() => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch {}
    }
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { listening, supported, transcript, error, start, stop, toggle };
}
