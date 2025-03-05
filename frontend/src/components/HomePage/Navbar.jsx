import { React, useState } from "react";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ClearIcon from "@mui/icons-material/Clear";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { Link, NavLink } from "react-router-dom";
import { Outlet, useLocation } from "react-router";
import logo from "../../assests/skylogo.png";
import Home from "../HomePage/Home";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import LogoutIcon from '@mui/icons-material/Logout';
import "./Navbar.css";
import Swal from 'sweetalert2';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleLinkClick = () => {
    setIsOpen(false); // Close the navbar when a link is clicked
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No, keep me logged in'
    });
  
    if (result.isConfirmed) {
      // Perform logout action here
      // logout(); // Uncomment this line if you have a logout function
      window.location.href = '/'; // Redirect to login page
    }
  };
  const location = useLocation();

  return (
    <>
      <header className="header">
        <nav className="navbar navbar-expand-lg navbar_wrapper fixed-top p-0">
          <div className="container">
            <Link className="navbar-brand">
              <img src={logo} alt="logo" className="logo" />
            </Link>

            <div className="social_icons order-lg-3">
              <ul className="ul_links">
                <li>
                  <a
                    href="https://www.facebook.com/skyvisonitsolutions/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FacebookIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/skyvisionitsolution/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <InstagramIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/company/sky-vision-it-solutions-official/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LinkedInIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@amitganuwala"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <YouTubeIcon />
                  </a>
                </li>
              </ul>
            </div>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded={isOpen}
              aria-label="Toggle navigation"
              onClick={handleToggle}
            >
              <span className="nav_toggle">
                {isOpen ? <ClearIcon /> : <ClearAllIcon />}
              </span>
            </button>

            <div
              className={`collapse navbar-collapse ${isOpen ? "show" : ""} order-lg-2`}
              id="navbarNav"
            >
              <ul className="navbar-nav">
                <li
                  className="nav-item"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link text-white ${
                        isActive || isHovered ? "activeLink" : ""
                      }`
                    }
                    to="/home"
                    end
                    onClick={handleLinkClick} 
                  >
                    Home
                  </NavLink>
                </li>
                <li
                  className="nav-item"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link text-white ${
                        isActive || isHovered ? "activeLink" : ""
                      }`
                    }
                    to="Pricing" // Ensure this points to the correct route
                    end
                    onClick={handleLinkClick}
                  >
                    Pricing
                  </NavLink>
                </li>
                <li
                  className="nav-item"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link text-white ${
                        isActive || isHovered ? "activeLink" : ""
                      }`
                    }
                    to="/home/Contact" // Ensure this points to the correct route
                    end
                    onClick={handleLinkClick}
                  >
                    Contact
                  </NavLink>
                </li>

                <li
                  className="nav-item logout_btn d-md-none py-2"
                >
                 <Link href="#" onClick={handleLogout} >
                  Log Out <LogoutIcon/>
                 </Link>
                </li>
              </ul>
            </div>
            <div className="d-lg-block d-none text-white order-lg-4 ms-5" title="Log Out" onClick={handleLogout} style={{cursor:"pointer"}}>
              <PowerSettingsNewIcon />
            </div>
          </div>
        </nav>
      </header>
      <Outlet />
      {location.pathname === "/home" && <Home />}
    </>
  );
};
export default Navbar;
