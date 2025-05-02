// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./HomePage";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content"> {/* Semantic HTML */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} /> 
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
