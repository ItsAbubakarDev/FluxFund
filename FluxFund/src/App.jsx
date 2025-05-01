// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import { Navigate } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
