import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import appInfo from "./app-info.json";
//import reportWebVitals from './reportWebVitals';
//import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
document.head.querySelectorAll('title')[0].innerText = appInfo.name;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
