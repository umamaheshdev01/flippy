'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hwnkucfptcbnpbmbmtec.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bmt1Y2ZwdGNibnBibWJtdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkzODExNzEsImV4cCI6MjAyNDk1NzE3MX0.QTCWf1l7vkryMi6DPWDckOLU5ft8tzclpSkZr3zzxQU'
const supabase = createClient(supabaseUrl, supabaseKey)

const ViewerComponent = () => {
  const [inputText, setInputText] = useState('');
  const [responseText, setResponseText] = useState('');

  // Function to fetch initial data
  const fetchInitialData = async () => {
    const { data, error } = await supabase
      .from('Data')
      .select('text')
      .eq('id', 1);

    if (error) {
      console.error('Error fetching data:', error);
    } else if (data && data.length > 0) {
      setInputText(data[0].text);
      // You can set the responseText similarly if it's stored in the database
    }
  };

  const Data = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'Data' },
    (payload) => {
      console.log('Change received!', payload)
      setInputText(payload.new.text)
    }
  )
  .subscribe()

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-4">Viewer Side</h1>

      <textarea 
        value={inputText} 
        readOnly
        placeholder="Input text will appear here..."
        className="w-3/4 p-4 rounded-lg mb-4 text-lg text-gray-700 shadow-lg focus:outline-none"
        rows="4"
      />

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

export default ViewerComponent;
