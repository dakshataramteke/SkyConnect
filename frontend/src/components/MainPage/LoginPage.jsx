import { React, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import "./LoginPage.css";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
// import zIndex from "@mui/material/styles/zIndex";

const LoginPage = () => {
  const SECRET_KEY = "abhishek";

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [isAgreed, setIsAgreed] = useState(false); // New state for checkbox
  const [showPassword, setShowPassword] = useState(false); 

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handlePasswordVisibilityToggle = () => {
    setShowPassword((prev) => !prev); // Toggle password visibility
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(values);

    try {
      const res = await axios.post("http://localhost:8080/login", values);
      console.log("response login is : ", res.data.name);

      if (res.status === 200) {
        console.log("response login is : ", res.data.name);
        localStorage.setItem("Login User", res.data.name);
        localStorage.setItem("userEmail", values.email);

        Swal.fire({
          title: "Successfully ",
          text: "Logged in successfully!",
          icon: "success",
        });
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(values.email),
          SECRET_KEY
        ).toString();
        Cookies.set("user", encrypted, { path: "/" });
        console.log("encrypt data", encrypted);
        navigate("/home");
      }
      setValues({
        email: "",
        password: "",
      });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        Swal.fire({
          title: "Error!",
          text: "Check UserName and Password",
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Please fill out your username and password",
          icon: "error",
        });
      }
      console.log(err);
    }
  };

  return (
    <>
      <section className="home_wrapper" style={{ backgroundColor: "#c4ccd" }}>
        <div className="container-fluid">
          <div className="row home_formPage">
            <div className="col-12 col-md-6 login_Page"></div>
            <div className="col-12 col-md-6 p-md-5 p-4 home_form">
              <div className="pg">
                <h1 className="text-center mb-4 ">Login </h1>
                <form onSubmit={handleSubmit}>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <b> Email address</b> 
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="Enter your email address"
                      aria-describedby="emailHelp"
                      autoComplete="off"
                      value={values.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label ">
                      <b>Password </b>
                    </label>
                    <div className="input-group toggleeye" style={{ width: "90%", position: "relative" }}>
      <input
        type={showPassword ? "text" : "password"}
        className="form-control"
        id="password"
        name="password"
        placeholder="Enter your password"
        value={values.password}
        onChange={handleChange}
        autoComplete="off"
        aria-describedby="password"
        style={{
          letterSpacing: "1px",
          padding: '10px',
          marginBottom: "5px",
          borderRadius: '0',
          border: 'none',
          borderBottom: "2px solid #84a6d6"
        }}
      />
      <span
        className="input-group-text eyeshow"
        onClick={handlePasswordVisibilityToggle}
        style={{
          cursor: 'pointer',
          backgroundColor: 'white',
          position: "fixed",
          right: "55px",
          zIndex: 11,
          // bottom: "8px",
          border: "none"
        }}
      >
        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
      </span>
    </div>
                  </div>
                <p className="text-end me-5 ">
                <Link to="/forget" className="text-decoration-none" style={{color: "gray"}}>forget password ?</Link>
                </p>
               
                  <div className="my-4 d-flex justify-content-center">
                    <button type="submit" className="me-2 btn btn-outline-secondary">
                      Login
                    </button>
                    <NavLink to="/signup" className="btn btn-outline-secondary ms-md-3 ms-lg-5 ms-2">
                      Register
                    </NavLink>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginPage;