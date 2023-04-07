import { useState } from 'react'
import './App.css'

import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { v4 as uuidV4 } from 'uuid'

import { TextEditor } from '../components'

const Redirect = ({ to }) => (
  <Navigate to={to} />
)
function App() {
  

  return (
    <>
      <Routes>
          <Route path='/' exact  element={<Navigate to={`/documents/${uuidV4()}`} />} />
            
          <Route path='/documents/:id' element={<TextEditor />} />
      </Routes>
    </>
  )
}

export default App
