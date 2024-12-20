import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AnnotationsItem from './pages/annotations/annotationsItem';
import Annotations from './pages/annotations/annotations';
import Header from './components/header/header';
import Draw from './pages/draw/draw';
import Home from './pages/home/home';
import React from 'react';
import './app.scss';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<Draw />} />
        <Route path="/annotation" element={<Annotations />} />
        <Route path="/annotation/:id" element={<AnnotationsItem />} />
      </Routes>
    </Router>
  );
}

export default App;