'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hwnkucfptcbnpbmbmtec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bmt1Y2ZwdGNibnBibWJtdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkzODExNzEsImV4cCI6MjAyNDk1NzE3MX0.QTCWf1l7vkryMi6DPWDckOLU5ft8tzclpSkZr3zzxQU';
const supabase = createClient(supabaseUrl, supabaseKey);

const SpeechToTextComponent = () => {
  const [inputText, setInputText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        recognitionInstance.continuous = !isMobile;
        recognitionInstance.interimResults = !isMobile;

        recognitionInstance.onresult = (event) => {
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }

          setInputText((prevText) => {
            // Check if the new transcript is already in the input text
            if (prevText.endsWith(finalTranscript)) {
              return prevText; // No need to append duplicate text
            }
            return prevText + finalTranscript;
          });
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      } else {
        console.warn('SpeechRecognition API is not supported in this browser.');
      }
    }
  }, []);

  const toggleMic = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        setInputText(''); // Clear the input text when starting to listen
        recognition.start();
      }
      setIsListening(!isListening);
    } else {
      console.warn('Speech recognition is not available.');
    }
  };

  const updateSupabase = async (text) => {
    const { error } = await supabase
      .from('Data2')
      .update({ text: text })
      .eq('id', 1);
    
    if (error) {
      console.error('Error updating data:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputText) {
        updateSupabase(inputText);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputText]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDu59IuPqXGMA4KPGH9h8Zh7EbCqFZQXGo',

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Please answer in just one line ..... ' + inputText }] }],
          }),
        }
      );
  
      const data = await response.json();
      const aiResponse = data["candidates"][0]["content"]["parts"][0]["text"];
      setResponseText(aiResponse);
  
      const { error } = await supabase
        .from('Data2')
        .update({ text: aiResponse })
        .eq('id', 2);
  
      if (error) {
        console.error('Error updating AI response:', error);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setInputText('');
    setResponseText('');

    try {
      const { error: error1 } = await supabase
        .from('Data2')
        .update({ text: '' })
        .eq('id', 1);

      const { error: error2 } = await supabase
        .from('Data2')
        .update({ text: '' })
        .eq('id', 2);

      if (error1) {
        console.error('Error clearing text for id 1:', error1);
      }

      if (error2) {
        console.error('Error clearing text for id 2:', error2);
      }
    } catch (error) {
      console.error("Error clearing text in Supabase:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-4">Speech to AI Text</h1>

      <textarea 
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)} 
        placeholder="Speak or type something..."
        className="w-3/4 p-4 rounded-lg mb-4 text-lg text-gray-700 shadow-lg focus:outline-none"
        rows="4"
      />

      <div className="flex space-x-4 mb-4">
        <button 
          onClick={toggleMic} 
          className={`p-4 rounded-full text-white shadow-lg transition-all duration-300 ${
            isListening ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {isListening ? 'Stop Mic' : 'Start Mic'}
        </button>
        <button 
          onClick={handleSubmit} 
          className="p-4 rounded-full bg-blue-500 text-white shadow-lg transition-all duration-300 hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
        <button 
          onClick={handleClear} 
          className="p-4 rounded-full bg-yellow-500 text-white shadow-lg transition-all duration-300 hover:bg-yellow-600"
        >
          Clear
        </button>
      </div>

      <textarea 
        value={responseText} 
        readOnly 
        placeholder="AI response will appear here..."
        className="w-3/4 p-4 rounded-lg text-lg text-gray-700 shadow-lg focus:outline-none"
        rows="4"
      />  
    </div>
  );
};

export default SpeechToTextComponent;