// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./HomePage";
import AllCampaigns from "./AllCampaigns";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";


const App = () => {
  return (
    <Router>
      <div className="app-container">
        <main className="main-content"> {/* Semantic HTML */}
          <Routes>
            <Route path="/" element={<><Header /><Home /><Footer /></>} />
            <Route path="/campaigns" element={<><Header /><AllCampaigns /><Footer /></>} />
            <Route path="/about" element={<><Header /><AboutUs /><Footer /></>} />
            <Route path="/contact" element={<><Header /><ContactUs /><Footer /></>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} /> 
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
