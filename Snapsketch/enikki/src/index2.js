import React from 'react'
import { createRoot } from 'react-dom/client'
import Calendar from './components/Calendar'

const calendarElem = document.getElementById('calendar');
const calendarRoot = createRoot(calendarElem);
calendarRoot.render(<Calendar />);