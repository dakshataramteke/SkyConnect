import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import upload from "../../assests/upload.png";
import Swal from "sweetalert2";
import axios from "axios";
import Mail from "./Mail.jsx"; // Import the Mail component
import Tabs from "../HomePage/Tabs.jsx";
import "./ImportContact.css";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Box from "@mui/material/Box";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const ImportContact = () => {
  const [tableData, setTableData] = useState([]);
  const [emails, setEmails] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [emailsExtracted, setEmailsExtracted] = useState(false);
  const [showMail, setShowMail] = useState(false);
  const [toEmails, setToEmails] = useState([]); // State to hold the emails to send
  const [loading, setLoading] = useState(false); // New loading state
  const [showDownward, setShowDownward] = useState(true);
  const [isFirstRowBold, setIsFirstRowBold] = useState(true); // State to control bold styling of the first row
  const [noEmailsFound, setNoEmailsFound] = useState(false); // New state to track if no emails are found
  const [showUpward, setShowUpward] = useState(false);
  const [filename, setFilename] = useState(""); // State to hold the filename
  const [showExtractedEmails, setShowExtractedEmails] = useState(false); // New state to control visibility of extracted emails
  const [showProceedButton, setShowProceedButton] = useState(false); // New state for the Proceed button
  const [proceedClicked, setProceedClicked] = useState(false); // New state to track if Proceed button is clicked

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
      const isAtTop = window.scrollY === 0; 
      setShowUpward(!isAtTop); 
      setShowDownward(!isAtBottom); 
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setFilename(file.name); 
      processFile(file);
    }
  };
  
  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFilename(file.name); 
      processFile(file);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight - 20,
      behavior: "smooth",
    });
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setTableData(json);
      setEmailsExtracted(false);
      setIsFirstRowBold(true); // Reset bold state when a new file is processed
      setShowExtractedEmails(false); // Reset extracted emails visibility
      setShowProceedButton(false); // Reset proceed button visibility
      setProceedClicked(false); // Reset proceed clicked state
    };
    reader.readAsArrayBuffer(file);
  };

  const extractEmails = () => {
    const emailArray = [];
    tableData.forEach((row) => {
      row.forEach((cell) => {
        if (typeof cell === "string" && cell.includes("@")) {
          emailArray.push(cell.trim());
        }
      });
    });
    setEmails(emailArray);
    setToEmails(emailArray); // Store all extracted emails
    setEmailsExtracted(true); // Set to true after extracting emails
    setIsFirstRowBold(false); // Remove bold styling from the first row
    setShowExtractedEmails(true); // Show extracted emails
    setShowProceedButton(true); // Show the proceed button

    // Set noEmailsFound based on whether any emails were extracted
    setNoEmailsFound(emailArray.length === 0);
    console.log("Extracted Emails: ", emailArray);
  };

  const handleSaveEmails = async () => {
    if (!emails.length) {
      Swal.fire({
        title: "Error",
        text: "No Mail to Save",
        icon: "error",
      });
      return;
    }

    const processedEmails = emails.map((email) => email.trim());

    if (processedEmails.length === 0) {
      Swal.fire({
        title: "Error",
        text: "No valid mail to save",
        icon: "error",
      });
      return;
    }

    setIsSaving(true);
    setLoading(true); // Start loading

    // Retrieve the user's email from local storage
    const username = localStorage.getItem("userEmail");

    try {
      const response = await axios.post(
        "http://localhost:8080/save-emails",
        {
          emails: processedEmails,
          username: username, // Send the username along with the emails
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, 
        }
      );

      if (response.status === 200) {
        setEmails([]);
        setToEmails(emails); // Set the emails to be sent (both valid and invalid)
        setShowMail(true); // Show the Mail component
      }
    } catch (error) {
      console.error("Error saving emails:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to save mails",
        icon: "error",
      });
    } finally {
      setTimeout(() => {
        setLoading(false); 
        setIsSaving(false); 
      }, 2000); 
    }
  };

  const handleProceed = () => {
    setProceedClicked(true); // Set the state to indicate that Proceed was clicked
    handleSaveEmails(); // Call the save emails function
  };

  return (
    <>
      <section className="full_background import_background">
        <Tabs />
        <div className="container shadow-none" style={{ marginTop: "1rem" }}>
          <h2 className="text-center title">Multiple Mail Wave</h2>
          <p className="text-center" style={{ padding: "0 2rem", lineHeight: "2rem" }}>
            Sending Multiple Messages And Information To Organization.
          </p>
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              border: "2px dashed #007bff",
              backgroundColor: "rgb(185, 211, 245)",
              height: "200px",
              cursor: "pointer",
              borderRadius: "10px",
              padding: "10px",
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <img src={upload} alt="Upload Icon" style={{ width: "50px" }} />
              <p className="mb-1">Drag & Drop files here</p>
              <p>or</p>
              <label htmlFor="fileInput" className="btn btn-outline-primary">
                Browse Files
              </label>
              <input
                type="file"
                id="fileInput"
                accept=".xlsx, .xls, .csv"
                style={{ display: "none" }}
                onChange={handleFileInput}
              />
              <p className="m-0 " style={{ fontSize: '0.895rem' }}>{filename}</p>
            </div>
          </div>
        
          {tableData.length > 0 && !showExtractedEmails && !proceedClicked && ( // Add condition to check if proceed was clicked
            <div className="table-responsive mt-4 table_section">
              <div className="mt-3 text-center mb-3">
                <h1 className="fw-bold fs-6">Table Data</h1>
              </div>
              <table className="table">
                <thead style={{ textAlign: "center" }}>
                  <tr>
                    {emailsExtracted ? (
                      <th style={{ textAlign: "center", border: "none" }} colSpan={6}>
                        Emails
                      </th>
                    ) : (
                      <></>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex === 0 && isFirstRowBold ? "bold-row" : ""}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="text-start">
                          <span className={cell === undefined}>
                            {cell !== undefined ? cell : "N/A"} {/* Display "N/A" for missing fields */}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-center">
                {!emailsExtracted && ( // Only show the button if emails have not been extracted
                  <button className="btn btn-primary mt-3 mb-2" onClick={extractEmails}>
                    Extract Emails
                  </button>
                )}
              </div>
            </div>
          )}

          {showExtractedEmails && !proceedClicked && ( // Add condition to check if proceed was clicked
            <div className="mt-4 text-center">
              <h3>Extracted Emails:</h3>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr className="text-center" style={{border:"2px solid #3d80c4"}}>
                      <th colSpan={"4"} style={{border:"2px solid #3d80c4"}}>Email </th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.reduce((rows, email, index) => {
                      if (index % 4 === 0) {
                        rows.push([]); // Start a new row
                      }
                      rows[rows.length - 1].push(email); // Add email to the current row
                      return rows;
                    }, []).map((row, rowIndex) => (
                      <tr key={rowIndex} style={{border:"2px solid #3d80c4"}}>
                        {row.map((email, emailIndex) => (
                          <td key={emailIndex} style={{border:'none'}}>{email}</td>
                        ))}
                        {/* Fill empty cells if the row has less than 4 emails */}
                        {Array.from({ length: 4 - row.length }).map((_, emptyIndex) => (
                          <td key={emptyIndex} style={{border:'none'}}></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {noEmailsFound && ( // Show message if no emails are found
            <div className="text-center mt-3">
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <h2>There are No Emails in the Uploaded File</h2>
                <p className="mt-3">Please upload another file that contains emails.</p>
                <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>
          )}

          {emails.length > 0 && !showExtractedEmails && !proceedClicked && ( // Add condition to check if proceed was clicked
            <div className="mt-4 text-center">
              <textarea
                value={emails.join(", ")}
                onChange={(e) =>
                  setEmails(e.target.value.split(",").map((email) => email.trim()))
                }
                className="form-control d-none"
                rows="6"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontWeight: "bold",
                  backgroundColor: "#e8eff7",
                }}
              />
            </div>
          )}

          {showProceedButton && !proceedClicked && ( // Add condition to check if proceed was clicked
            <div className="text-center my-4">
              <button className="btn btn-primary" onClick={handleProceed}>
                Proceed
              </button>
            </div>
          )}

          <div className="d-flex justify-content-center fixed_Arrow">
            <div className="scrollArrows">
              {showUpward && (
                <div className={`upwardArrow ${!showUpward ? 'hidden' : ''}`} onClick={scrollToTop}>
                  <ArrowUpwardIcon />
                </div>
              )}
              {showDownward && (
                <div className={`downwardArrow ${!showDownward ? 'hidden' : ''}`} onClick={scrollToBottom}>
                  <ArrowDownwardIcon />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {showMail && <Mail emails={toEmails} />}
    </>
  );
};

export default ImportContact;