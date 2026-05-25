import logo from './logo.svg';
import './App.css';
import Auth from './Pages/Auth';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import i18n from "./i18n";
import Navbar from './Components/Layout/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout/Layout';

function App() {
  const lang = useSelector((state) => state.language.lang)

  useEffect(() => {
    i18n.changeLanguage(lang);
    document.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        
        {/* Routes with Sidebar */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/dashboard" element={""} />
              <Route path="/users/all" element={""} />
              <Route path="/users/add" element={""} />
              <Route path="/settings" element={""} />
              {/* Add other routes */}
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
