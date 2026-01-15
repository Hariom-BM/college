import React from 'react'
import { createRoot } from 'react-dom/client'
import MeetingNotesManager from './index.js'
import './styles.css'

const root = document.getElementById('root')
createRoot(root).render(
  <React.StrictMode>
    <MeetingNotesManager />
  </React.StrictMode>
)
