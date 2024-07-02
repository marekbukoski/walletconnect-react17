import React from 'react';
import './App.css';
import { ClientContextProvider } from './context/ClientContext';
import { Connect } from './Connect';

function App() {
  return (
    <ClientContextProvider>
      <Connect />
    </ClientContextProvider>
  );
}

export default App;
