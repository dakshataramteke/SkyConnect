import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import axios from "axios";
import Swal from "sweetalert2";
import PreviewMail from "./PreviewMail";
import { useLocation } from "react-router-dom"; // Import useLocation for routing

import "./Mail.css";

const Mail = ({ emails }) => {
  const location = useLocation(); // Get the location object
  const formRef = useRef(null); // Create a reference for the form

  const [value, setValue] = useState({
    to: emails.join(", "), // Initialize the to field with the passed emails
    from: "",
    password: "",
    subject: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [sentCount, setSentCount] = useState(0); // Count of sent emails
  const [notSentCount, setNotSentCount] = useState(0); // Count of not sent emails
  const [progress, setProgress] = useState(0); // Progress state
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for progress
  const [editorHtml, setEditorHtml] = useState("");

  useEffect(() => {
    // Retrieve the user's name from local storage
    const storedUserName = localStorage.getItem("Login User");
    if (storedUserName) {
      setUserName(storedUserName); // Set the user's name in state
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValue((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleQuillChange = (content, delta, source, editor) => {
    const htmlContent = editor.getHTML();
    setEditorHtml(htmlContent);
    setValue((prevState) => ({
      ...prevState,
      message: htmlContent,
    }));

    // Clear the error if the editor content is valid
    if (htmlContent.trim() && htmlContent !== "<p><br></p>") {
      setError("");
    }
  };

  const validateSingleMail = () => {
    const form = formRef.current;

    // Check for standard input validation
    const isFormValid = form.checkValidity();
    const isQuillValid = editorHtml.trim() && editorHtml !== "<p><br></p>";

    // Apply was-validated class if needed
    if (!isFormValid || !isQuillValid) {
      form.classList.add("was-validated");

      // Handle Quill validation
      if (!isQuillValid) {
        setError("The message field cannot be empty.");
      } else {
        setError(""); // Clear the error if Quill is valid
      }

      return false;
    }

    return true;
  };

  const sendEmail = async (bannerData) => {
    setLoading(true); // Start loading
    setProgress(0); // Reset progress

    // Split the "to" field by commas and trim whitespace
    const emailList = value.to
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);
    const emailCount = emailList.length; // Count of emails to send

    const emailPayload = {
      toList: emailList,
      from: value.from,
      password: value.password,
      subject: value.subject,
      htmlContent: `
      <div style="width: 500px; margin: auto; background-color: whitesmoke">
        <div style="background-color: ${
          bannerData.selectedColor ? bannerData.selectedColor : "white"
        }; border-radius: 0.5rem 0.5rem 0 0; padding: 0.25rem 1rem;">
          ${
            bannerData.logoUrl
              ? `<img src="${bannerData.logoUrl}" alt="Company Logo" style="width: 53px; height: 53px; border-radius: 50%;" />`
              : `<span style="width:0; height:0"></span>`
          }
        </div>
        <div style="text-align: center; color: black;">
          <h3>${bannerData.companyName}</h3>
        </div>
        <div style="text-align: center; margin-top: 1rem; display:flex; justify-content:center">
          ${
            bannerData.bannerUrl
              ? `<img src="${bannerData.bannerUrl}" alt="Banner" style="width: 90%; height: auto; border-radius: 0.325rem;" />`
              : `<span></span>`
          }
        </div>
        <div style="margin: 2rem 0; padding: 0 1.5rem;">  
          <div>${value.message || "No message provided."}</div>
        </div>
        ${
          bannerData.buttonName
            ? `
          <div style="text-align: center; margin-top: 3rem;">
            <a href="${bannerData.buttonUrl}" style="text-decoration: none;">
              <button style="background-color: ${
                bannerData.selectedbuttonColor || "initial"
              }; color: white; border: none; border-radius: 1.25rem; padding: 0.75rem 1.5rem; cursor: pointer; font-weight: bold;">
                ${bannerData.buttonName}
              </button>
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

    console.log("Sending email with payload:", emailPayload); // Log the payload

    try {
      let deliveredCount = 0; // Count of successfully sent emails
      let undeliveredCount = 0; // Count of failed emails

      // Regular expression for validating email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      for (let i = 0; i < emailCount; i++) {
        const email = emailList[i];

        // Validate email format
        if (!emailRegex.test(email)) {
          console.error("Invalid email format:", email);
          undeliveredCount++; // Increment undelivered count
          continue; // Skip sending this email
        }

        try {
          await axios.post("http://localhost:8080/contact", {
            ...emailPayload,
            toList: email,
          });
          deliveredCount++; // Increment delivered count
          setSentCount((prevCount) => prevCount + 1);

          // Update progress based on the number of emails sent
          const progressPercentage = Math.round(((i + 1) / emailCount) * 100);
          setProgress(progressPercentage);
        } catch (error) {
          undeliveredCount++; // Increment undelivered count
          console.error("Error sending email to:", email, error);
        }
      }

      setNotSentCount(undeliveredCount); // Update not sent count
      Swal.fire({
        title: "Success",
        html: `Total send Attempt: <strong style="color: green; font-size: 20px;">${deliveredCount}</strong><br>
               Total mail Failed: <strong style="color: red; font-size: 20px;">${undeliveredCount}</strong>`,
        icon: "success",
      }).then(() => {
        formRef.current.classList.remove("was-validated");
        // Clear the form data
        setValue({
          to: "",
          from: "",
          password: "",
          subject: "",
          message: "",
        });
        setSentCount(0); // Update sent count
        setNotSentCount(0);
      });
    } catch (err) {
      console.error("Error sending email:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to send email.",
        icon: "error",
      });
    } finally {
      setLoading(false); // Stop loading
      setProgress(100); // Set progress to 100% after completion
    }
  };

  return (
    <>
      <section className="full_background multiple_wrapper">
        <div className="container p-3">
          <h2 className="text-center title">Multiple Mail Wave</h2>
          <div className="row form_body">
            <div
              className="col-12 col-md-4 banner_Mail"
              style={{
                borderTopLeftRadius: "0.725rem",
                borderBottomLeftRadius: "0.725rem",
              }}
            ></div>
            <div
              className="col-12 col-md-8 p-md-4 pt-0"
              style={{
                backgroundColor: "white",
                borderRadius: "0 0.625rem 0.625rem 0",
              }}
            >
              <form ref={formRef} className="needs-validation" noValidate>
                <div className="row form_data">
                  <div className="col-12 col-md-11 ">
                    <div className="my-md-3 my-4 d-flex align-items-center">
                      <label htmlFor="to" className="form-label">
                        To : <span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="to"
                        placeholder="name@gmail.com"
                        name="to"
                        value={value.to}
                        onChange={handleChange}
                        required
                      />
                      <div className="invalid-feedback">
                        Please provide a valid email address.
                      </div>
                    </div>
                    <div className="mb-4 d-flex align-items-center">
                      <label htmlFor="from" className="form-label">
                        From : <span style={{ color: "red" }}> *</span>{" "}
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="from"
                        placeholder="name@gmail.com"
                        name="from"
                        value={value.from}
                        onChange={handleChange}
                        required
                      />
                      <div className="invalid-feedback">
                        Please provide a valid email address.
                      </div>
                    </div>

                    <div className="mb-4 d-flex align-items-center">
                      <label htmlFor="Password" className="form-label">
                        Password : <span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="Password"
                        placeholder="Enter your Password"
                        name="password"
                        value={value.password}
                        onChange={handleChange}
                        required
                      />
                      <div className="invalid-feedback">
                        Please provide a password.
                      </div>
                    </div>
                    <div className="mb-4 d-flex align-items-center">
                      <label htmlFor="subject" className="form-label">
                        Subject: <span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="subject"
                        placeholder="Enter Subject"
                        name="subject"
                        value={value.subject}
                        onChange={handleChange}
                        required
                      />
                      <div className="invalid-feedback">
                        Please provide a subject.
                      </div>
                    </div>

                    <div className="mb-5 d-flex align-items-center">
                      <label htmlFor="message" className="form-label">
                        Message :<span style={{ color: "red" }}> *</span>
                      </label>
                      <ReactQuill
                        theme="snow"
                        style={{ height: "150px", width: "100%" }}
                        name="message"
                        value={value.message}
                        onChange={handleQuillChange}
                      />
                      {/* Show error message */}
                      {error && (
                        <div
                          className="invalid-feedback"
                          style={{ display: "block" }}
                        >
                          {error}
                        </div>
                      )}
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
      />
    </>
  );
};

export default Mail;