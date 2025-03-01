import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css'; 

const Tabs = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  // State to hold the active tab
  const [activeTab, setActiveTab] = useState("SingleMail"); // Default to SingleMail

  // Effect to synchronize state with session storage and set active tab based on URL
  useEffect(() => {
    const storedTab = sessionStorage.getItem("activeTab");
    
    // Determine the active tab based on the current path
    if (location.pathname === '/home/SingleMail') {
      setActiveTab("SingleMail");
    } else if (location.pathname === '/home/MultipleMail') {
      setActiveTab("MultipleMail");
    } else if (location.pathname === '/home') {
      setActiveTab("SingleMail"); // Default to SingleMail when at /home
    } else {
      setActiveTab(storedTab || "SingleMail"); // Fallback to stored tab or default
    }

    // Update session storage whenever activeTab changes
    sessionStorage.setItem("activeTab", activeTab);
  }, [location.pathname]); // Run effect when the pathname changes

  // Function to handle tab change
  const handleSingleMailClick = () => {
    setActiveTab("SingleMail"); // Set active tab to SingleMail
    navigate('/home/SingleMail'); // Navigate to SingleMail
  };

  const handleMultipleMailClick = () => {
    setActiveTab("MultipleMail"); // Set active tab to MultipleMail
    navigate('/home/MultipleMail'); // Navigate to MultipleMail
  };

  return (
    <>
      <section className="homesection_wrapper">
      <div className="container">
        <div className="row">
        
          <div className="tabs_lines col-6 d-flex justify-content-center align-items-center ">
          <ul className="nav nav-pills">
            <li className="nav-item mt-3 mt-md-0">
              <a
                className={` nav-link ${activeTab === "SingleMail" ? "active" : ""}`}
                onClick={handleSingleMailClick}
              >
                Single Mail
              </a>
            </li>
          
          </ul>
          </div>
          <div className="tabs_lines col-6 d-flex justify-content-center align-items-center ">
          <ul className="nav nav-pills">
          <li className="nav-item mt-3 mt-md-0">
              <a
                className={` nav-link ${activeTab === "MultipleMail" ? "active" : ""}`}
                onClick={handleMultipleMailClick}
              >
                Multiple Mail
              </a>
            </li>
          </ul>
          
          </div>
        </div>
      </div>
  
      </section>
    </>
  );
}

export default Tabs;