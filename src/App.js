import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/LoginPage';
import Import from './pages/Experimental/Import';
import ProtectedRoutes from './util/ProtectedRoutes';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Home />} />
          </Route>
          {/*  <Route path="/" element={<Home />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/experimental" element={<Import />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
