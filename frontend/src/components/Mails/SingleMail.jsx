import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import axios from "axios";
import Swal from "sweetalert2";
import PreviewMail from "./PreviewMail";
import "react-quill/dist/quill.snow.css";
import Tabs from "../HomePage/Tabs";
import "./Mail.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router";

const SingleMail = () => {
  let navigate = useNavigate();
  const [value, setValue] = useState({
    to: "",
    from: "",
    password: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [notSentCount, setNotSentCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");
  const formRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const storedUserName = localStorage.getItem("Login User");
    if (storedUserName) {
      setUserName(storedUserName);
      console.log("Stored Single List : " + storedUserName);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValue((prevState) => ({
      ...prevState,
      [name]: value.trimStart(),
    }));
  };

  const handlePasswordVisibilityToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleQuillChange = (html) => {
    setEditorHtml(html);
    setValue((prevState) => ({
      ...prevState,
      message: html,
    }));
    if (error) {
      setError("");
    }
  };

  const validateSingleMail = () => {
    const form = formRef.current;

    if (
      !form.checkValidity() ||
      !editorHtml.trim() ||
      editorHtml === "<p><br></p>"
    ) {
      form.classList.add("was-validated");

      if (!editorHtml.trim() || editorHtml === "<p><br></p>") {
        setError("The message field cannot be empty.");
      }

      return false;
    }
    return true;
  };

  const handleKeyPress = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  
  const handleSubmit = (event) => {
    event.preventDefault();
    // const form = formRef.current;
  
    // Validate the form
    if (!validateSingleMail()) {
      event.stopPropagation();
      Swal.fire({
        title: "Error",
        text: "Please fill in all required fields correctly.",
        icon: "error",
      });
      return;
    }
  
    // Proceed to send the email
    sendEmail();
  };

  const sendEmail = async (bannerData) => {
    setLoading(true);
    setProgress(0);

    const emailList = value.to
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);
    const emailCount = emailList.length;

    if (emailCount === 0) {
      Swal.fire({
        title: "Error",
        text: "Please enter at least one valid email address.",
        icon: "error",
      });
      setLoading(false);
      return;
    }

    if (editorHtml.trim() === "" || editorHtml === "<p><br></p>") {
      setError("The message cannot be empty.");
      setLoading(false);
      return;
    }

    const emailPayload = {
      toList: emailList,
      from: value.from,
      password: value.password,
      subject: value.subject,
      htmlContent: `
      <div style="width: 500px; margin: auto; background-color: whitesmoke">
        <div style="background-color: ${
          bannerData.selectedColor ? bannerData.selectedColor : "white"
        }; border-radius: 0.5rem 0.5rem 0 0; padding: 0.25rem 1rem; height:55px">
          ${
            bannerData.logoUrl
              ? `<img src="${bannerData.logoUrl}" alt="" style="width: 53px; height: 53px; border-radius: 50%; background-size:contain" />`
              : `<span></span>`
          }
        </div>
        <div style="text-align: center; color: black;">
          <h3>${bannerData.companyName}</h3>
        </div>
        <div style="text-align: center; margin-top: 1rem; display:flex; justify-content:center">
          ${
            bannerData.bannerUrl
              ? `<img src="${bannerData.bannerUrl}" alt="" style="width: 90%; height: auto; border-radius: 0.325rem;" />`
              : `<span></span>`
          }
        </div>
        <div style="margin: 2rem 0; padding: 0 1.5rem;">  
          <div>${value.message}</div>
        </div>
        ${
          bannerData.buttonUrl || bannerData.buttonName
            ? `
          <div style="text-align: center; margin-top: 3rem;">
            <a href="${bannerData.buttonUrl}" style="text-decoration: none;">
              <button style="background-color: orange;  color: white; border: none; border-radius: 1.25rem; padding: 0.75rem 1.5rem; cursor: pointer; font-weight: bold;">
                ${bannerData.buttonName || "Button"} 
            </a>
          </div>
        `
            : ""
        }
        <div style="margin: 1.5rem;">
          <p>Best regards,</p>
          <h5 style="color: #4358f9; padding:0 0 1.5rem;">${userName}</h5>
        </div>
      </div>
    `,
    };

    console.log("Sending email with payload:", emailPayload);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 100 / emailCount;
        }
        return prev;
      });
    }, 500);

    try {
      let deliveredCount = 0;
      let undeliveredCount = 0;

      for (const email of emailList) {
        try {
          await axios.post("http://localhost:8080/SingleMail", {
            ...emailPayload,
            toList: email,
          });
          deliveredCount++;
        } catch (error) {
          undeliveredCount++;
          console.error("Error sending email to:", email, error);
        }
      }

      setSentCount(deliveredCount);
      setNotSentCount(undeliveredCount);
      Swal.fire({
        title: "Success",
        html: `Total send Attempt: <strong style="color: green; font-size: 20px;">${deliveredCount}</strong><br>
               Total mail Failed: <strong style="color: red; font-size: 20px;">${undeliveredCount}</strong>`,
        icon: "success",
      }).then(() => {
        formRef.current.classList.remove("was-validated");

        setValue({
          to: "",
          from: "",
          password: "",
          subject: "",
          message: "",
        });
        setSentCount(0);
        setNotSentCount(0);
        navigate("/home");
      });
    } catch (err) {
      console.error("Error sending email:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to send email.",
        icon: "error",
      });
    } finally {
      clearInterval(interval);
      setLoading(false);
      setProgress(100);
    }
  };

  return (
    <>
      <section className="full_background">
        <Tabs />
        <div className="container p-3">
          <h2 className="text-center title">Single Mail Wave</h2>
          <p
            className="text-center"
            style={{ padding: "0 2rem", lineHeight: "2rem" }}
          >
            Sending Single Messages And Information To Organizations.
          </p>
          <div className="row form_body">
            <div
              className="col-12 col-md-4 banner_Mail"
              style={{
                borderTopLeftRadius: "0.725rem",
                borderBottomLeftRadius: "0.725rem",
              }}
            ></div>
            <div
              className="col-12 col-md-8 p-4 mb-5 mb-md-0"
              style={{
                backgroundColor: "white",
                borderRadius: "0 0.625rem 0.625rem 0",
              }}
            >
              <form
                ref={formRef}
                className="needs-validation"
                noValidate
                onSubmit={handleSubmit}
              >
                <div className="row form_data">
                  <div className="col-12 col-md-11">
                    <div className="my-4 d-flex align-items-center">
                      <label htmlFor="to" className="form-label">
                        To{" "}
                        <span style={{ color: "red", marginLeft: "4px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <div className="d-flex flex-column w-100">
                      <input
                        type="email"
                        className="form-control"
                        id="to"
                        placeholder="Enter recipients email address"
                        name="to"
                        value={value.to}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        required
                      />
                      <div className="invalid-feedback">
                        Please provide a valid email address.
                      </div>
                      </div>
                    
                    </div>
            
                     <div className="mb-4 d-flex align-items-center">
                      <label htmlFor="from" className="form-label">
                        From{" "}
                        <span style={{ color: "red", marginLeft: "4px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <div className="d-flex flex-column w-100">
                      <input
                    
                        type="email"
                        className="form-control "
                        id="from"
                        placeholder="Enter sender email address"
                        name="from"
                        value={value.from}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        
                        required
                      />
                      <div className="invalid-feedback" >
                        Please provide a valid email address.
                      </div>
                      </div>
                    </div>

         
                    <div className="mb-4 d-flex align-items-center">
                      <label htmlFor="Password" className="form-label ">
                        Password:{" "}
                        <span
                          style={{
                            color: "red",
                            marginLeft: "4px",
                            position: "relative",
                          }}
                        >
                          {" "}
                          *
                        </span>
                      </label>
                      <div className="d-flex flex-column w-100">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control position-relative"
                        id="Password"
                        placeholder="Enter Your Password"
                        name="password"
                        value={value.password}
                        onChange={handleChange}
                        required
                        pattern="^[a-zA-Z0-9]*$"
                      />
                      <span
                        className="input-group-text eyeshow"
                        onClick={handlePasswordVisibilityToggle}
                        style={{
                          cursor: "pointer",
                          backgroundColor: "white",
                          position: "absolute",
                          right: "2.5%",
                          top:"37%",
                          border: "none",
                          padding:"0"
                        }}
                       
                      >
                        { showPassword ? (
                          <VisibilityIcon className="show_eye" />
                        ) : (
                          <VisibilityOffIcon className="hide_eye"/>
                        )}
                      </span>
                 
                      <div className="invalid-feedback">Please provide a valid password.</div>
                      </div>
                    
                 
                    </div>

           
                    <div className="mb-4 d-flex align-items-center">
                      <label htmlFor="subject" className="form-label ">
                        Subject{" "}
                        <span style={{ color: "red", marginLeft: "4px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <div className="d-flex flex-column w-100">
                      <input
                        type="text"
                        className="form-control"
                        id="subject"
                        placeholder="Enter Subject"
                        name="subject"
                        value={value.subject}
                        onChange={handleChange}
                        required
                        pattern="^[a-zA-Z0-9 ]*$"
                      />
                      <div className="invalid-feedback">
                        Please provide a subject.
                      </div>
                      </div>

                     
                    </div>

                    <div className="mb-4 d-flex align-items-center">
                      <label htmlFor="message" className="form-label">
                        Message{" "}
                        <span style={{ color: "red", marginLeft: "4px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <div className="d-flex flex-column w-100">
                      <ReactQuill
                        theme="snow"
                        style={{ height: "150px", width: "100%" }}
                        name="message"
                        value={value.message}
                        onChange={handleQuillChange}
                        required
                      />
                      {error && (
                        <div
                          className="text-danger"
                          style={{ fontSize: "14px", marginLeft: "5px" }}
                        >
                          {error}
                        </div>
                      )}
                      </div>
                     
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <PreviewMail
        value={value}
        sendEmail={sendEmail}
        sentCount={sentCount}
        notSentCount={notSentCount}
        validateSingleMail={validateSingleMail}
        progress={progress}
        loading={loading}
      />
    </>
  );
};

export default SingleMail;