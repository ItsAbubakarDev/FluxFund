import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context"; // New import
import Header from "./header";
import Footer from "./Footer";
import Home from "./homePage";
import AllCampaigns from "./AllCampaigns";
import CreateCampaign from "./CreateCampaign";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";
import LoginPage from "./LoginPage";
import SignupPage from "./signupPage";

const App = () => {
  return (
    <Web3Provider> {/* New wrapper */}
      <Router>
        <div className="app-container">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<><Header /><Home /><Footer /></>} />
              <Route path="/campaigns" element={<><Header /><AllCampaigns /><Footer /></>} />
              <Route path="/create" element={<CreateCampaign />} />
              <Route path="/about" element={<><Header /><AboutUs /><Footer /></>} />
              <Route path="/contact" element={<><Header /><ContactUs /><Footer /></>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Web3Provider>
  );
};

export default App;