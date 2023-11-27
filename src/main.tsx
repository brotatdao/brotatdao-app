import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer';
import util from 'util';
import stream from 'stream-browserify';
import App from './App.tsx'
import './index.css'

declare global {
  var util: any;
  var stream: any;
}

global.Buffer = Buffer;
global.util = util;
global.stream = stream;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)