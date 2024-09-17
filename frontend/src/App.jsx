import { useState } from 'react'
import './App.css'
import Register from './Pages/Register/Register';
import Login from './Pages/Login/Login';
import Auth from './Pages/index';
import Home from './Home/Home';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>   
          <Route path='/' element={<Home />} />
          
          <Route path='*' element={<h1>Not Found</h1>} />
        </Routes>
      </BrowserRouter>    
    </>
  )
}

export default App
