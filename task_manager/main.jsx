import React from 'react'
import { createRoot } from 'react-dom/client'
import ABTestGenerator from './ABTestGenerator.jsx'
import './styles.css'

const root = document.getElementById('root')
createRoot(root).render(
  <React.StrictMode>
    <ABTestGenerator />
  </React.StrictMode>
)
