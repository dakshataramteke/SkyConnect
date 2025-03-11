import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import 'react-quill/dist/quill.snow.css';
import './App.css';
import LoginPage from './components/MainPage/LoginPage';
import SignUpPage from './components/MainPage/SignUpPage';
import Navbar from './components/HomePage/Navbar';
import Pricing from './components/PricingPlans/Pricing';
import SingleMail from './components/Mails/SingleMail';
import ImportContact from './components/Mails/ImportContact.jsx';
import ContactMail from './components/Contact/ContactMail.jsx';
import ForgetPassword from './components/MainPage/ForgetPassword.jsx';

function App() {
  return (
    <BrowserRouter>
      <AppWithAuthCheck />
    </BrowserRouter>
  );
}

function AppWithAuthCheck() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [validEmails, setValidEmails] = useState([]);

  useEffect(() => {
    const fetchValidEmails = async () => {
      try {
        const response = await fetch('/api/send-emails'); 
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setValidEmails(data); // Assuming data is an array of valid emails
      } catch (error) {
        console.error('Error fetching valid emails:', error);
      } 
    };

    fetchValidEmails();
  }, []);

  useEffect(() => {
      const SECRET_KEY = "abhishek";
      const userCookie = Cookies.get('user');
      console.log('User  Cookie:', userCookie);

      let decrypted = null;
      if (userCookie) {
        decrypted = CryptoJS.AES.decrypt(userCookie, SECRET_KEY).toString(CryptoJS.enc.Utf8);
        decrypted = JSON.parse(decrypted);
        console.log("Decrypted data:", decrypted);
      } else {
        console.log("No user cookie found.");
      }

      console.log("Valid emails:", validEmails);

      if (validEmails.length > 0 && !validEmails.includes(decrypted)) {
        console.log("Authentication failed!");
        setIsAuthenticated(false);
        navigate('/');
      } else {
        console.log("Authentication successful!");
        setIsAuthenticated(true);
      }
    }
  , [ navigate, validEmails]);

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/home" element={<Navbar />}>
          <Route path="Pricing" element={<Pricing />} />
          <Route path="SingleMail" element={<SingleMail />} />
          <Route path="MultipleMail" element={<ImportContact />} />
          <Route path="Contact" element={<ContactMail />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;


