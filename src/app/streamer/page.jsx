'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hwnkucfptcbnpbmbmtec.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bmt1Y2ZwdGNibnBibWJtdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkzODExNzEsImV4cCI6MjAyNDk1NzE3MX0.QTCWf1l7vkryMi6DPWDckOLU5ft8tzclpSkZr3zzxQU'
const supabase = createClient(supabaseUrl, supabaseKey)

const SpeechToTextComponent = () => {
  const [inputText, setInputText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognition = new window.webkitSpeechRecognition();

  // Function to start/stop speech recognition
  const toggleMic = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Handle speech recognition result
  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    setInputText(speechResult);
  };

  // Function to update Supabase with new inputText value
  const updateSupabase = async (text) => {
    const { data,error } = await supabase
      .from('Data')
      .update({ text: text })
      .eq('id', 1);
    
    if (error) {
      console.error('Error updating data:', error);
    }
  };

  // UseEffect to listen for changes in inputText
  useEffect(() => {
    console.log(inputText)
      updateSupabase(inputText);

  }, [inputText]);

  // Handle submit to OpenAI API (left empty for now)
  const handleSubmit = async () => {
    // Add your OpenAI API call here
  };

  // Handle clear button
  const handleClear = () => {
    setInputText('');
    setResponseText('');
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
        >
          Submit
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
