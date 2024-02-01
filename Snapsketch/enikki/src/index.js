import React from 'react'
import { createRoot } from 'react-dom/client'
import Timeline from './components/Timeline'


const timelineElem = document.getElementById('timeline');
const timelineRoot = createRoot(timelineElem);
timelineRoot.render(<Timeline />);



