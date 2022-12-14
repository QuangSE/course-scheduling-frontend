import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/LoginPage';
import DocentsOverview from './pages/DocentsOverview/DocentsOverview';
import Import from './pages/Experimental/Import';
import ProtectedRoutes from './util/ProtectedRoutes';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/docents-overview" element={<DocentsOverview />} />
            <Route path="/experimental" element={<Import />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<p>Error 404: Die Seite existiert nicht</p>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
