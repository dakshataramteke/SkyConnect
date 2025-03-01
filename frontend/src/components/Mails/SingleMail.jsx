import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import axios from "axios";
import Swal from "sweetalert2";
import PreviewMail from "./PreviewMail";
import "react-quill/dist/quill.snow.css";
import Tabs from "../HomePage/Tabs";
import "./Mail.css";

const SingleMail = () => {
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

  useEffect(() => {
    // Retrieve the user's name from local storage
    const storedUserName = localStorage.getItem("Login User");
    // console.log("Stored  "+storedUserName);
    if (storedUserName) {
      setUserName(storedUserName); // Set the user's name in state
      console.log("Stored Single List : "+storedUserName);
    }
  }, []);
  // Update both value and editorHtml
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValue((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Quill's onChange will update editorHtml
  const handleQuillChange = (content, delta, source, editor) => {
    const htmlContent = editor.getHTML();
    setEditorHtml(htmlContent); // Keep track of the editor's content in HTML
    setValue((prevState) => ({
      ...prevState,
      message: htmlContent, // Update the message state to be the HTML
    }));
    setError(""); // Clear error specific to the message field
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate email and message content
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = formRef.current;

    // Validate single email
    const emailList = [value.to.trim()];

    if (emailList.some((email) => !isValidEmail(email))) {
      Swal.fire({
        title: "Error",
        text: "Please enter a valid email address.",
        icon: "error",
      });
      return;
    }

    if (!validateSingleMail()) {
      event.stopPropagation();
      Swal.fire({
        title: "Error",
        text: "Please fill in all required fields correctly.",
        icon: "error",
      });
      return;
    }

    sendEmail();
  };

  const sendEmail = async (bannerData) => {
    setLoading(true); // Start loading
    setProgress(0); // Reset progress

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
        <div style=" margin-top: 1rem; display:flex; justify-content:center">
          ${
            bannerData.bannerUrl
              ? `<img src="${bannerData.bannerUrl}" alt="Banner" style="width: 90%; height: auto; border-radius: 0.325rem; margin: 0 auto" />`
              : `<span></span>`
          }
        </div>
        <div style="margin: 1.25rem 0; padding: 0 1.5rem;">  
          <div>${value.message || "No message provided."}</div>
        </div>
        ${
          bannerData.buttonName
            ? `
          <div style="text-align: center; margin-top: 2rem; ">
            <a href="${bannerData.buttonUrl}" style="text-decoration: none;">
              <button style="background-color: #e8a303; border: none; border-radius: 1.25rem; padding: 0.75rem 1.5rem; cursor: pointer; font-weight: bold;"
              };  >
                ${bannerData.buttonName}
              </button>
            </a>
          </div>
        `
            : ""
        }
        <div style="margin: 1rem 0 1rem 1rem";>
          <p>Best regards,</p>
          <h5 style="color: #4358f9; padding: 0 0 1.5rem 0 ">${userName}</h5> 
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
            Sending single messages and information to organizations.
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
                        To: <span style={{ color: "red" }}> *</span>
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
                      <label htmlFor="to" className="form-label">
                        From : <span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        type="text"
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
                      <label htmlFor="Password" className="form-label ">
                        Password: <span style={{ color: "red" }}> *</span>
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
                      <label htmlFor="subject" className="form-label ">
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

                    <div className="mb-4 d-flex align-items-center">
                      <label htmlFor="message" className="form-label">
                        Message: <span style={{ color: "red" }}> *</span>
                      </label>
                      <ReactQuill
                        theme="snow"
                        style={{ height: "150px", width: "100%" }}
                        name="message"
                        value={value.message}
                        onChange={handleQuillChange}
                        required
                      />
                      {error && <div className="text-danger">{error}</div>}
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
