// import React, { useEffect, useState } from "react";
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
// import CircularProgress from "@mui/material/CircularProgress";
// import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
// import Pagination from "@mui/material/Pagination";
// import Stack from "@mui/material/Stack";
// import Box from "@mui/material/Box";
// import "./ContactMail.css";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Mail from "../Mails/Mail.jsx";
// import axios from "axios";
// import myImage from '../../assests/logo.jpg'; 
// import datanotFound from '../../assests/datanotfound.jpg';

// const ContactMail = () => {
//   const [emails, setEmails] = useState([]);
//   const [selectedEmails, setSelectedEmails] = useState([]);
//   const [toEmails, setToEmails] = useState([]);
//   const [sentEmails, setSentEmails] = useState([]);
//   const [showMail, setShowMail] = useState(false);
//   const [selectAll, setSelectAll] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showSelectedEmails, setShowSelectedEmails] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [searchInput, setSearchInput] = useState("");
//   const [showSearchInput, setShowSearchInput] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const emailsPerPage = 30;
//   const [showUpward, setShowUpward] = useState(false);
//   const [showDownward, setShowDownward] = useState(true);
//   const [filteredEmails, setFilteredEmails] = useState([]);

//   const handleScroll = () => {
//     const scrollY = window.scrollY;
//     const windowHeight = window.innerHeight;
//     const documentHeight = document.documentElement.scrollHeight;

//     setShowUpward(scrollY > 0);
//     setShowDownward(scrollY + windowHeight < documentHeight);
//   };

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const scrollToBottom = () => {
//     window.scrollTo({
//       top: document.documentElement.scrollHeight,
//       behavior: "smooth",
//     });
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       const username = localStorage.getItem("userEmail");
//       try {
//         const response = await axios.get("http://localhost:8080/contactMails", {
//           params: { email: username },
//           withCredentials: true,
//         });

//         const fetchedData = response.data;

//         if (Array.isArray(fetchedData)) {
//           const emailList = fetchedData.flatMap((item) =>
//             item.email.split(",").map((email) => ({
//               email: email.trim(),
//               date: item.dates
//                 ? new Date(item.dates.split("/").reverse().join("-")).toISOString()
//                 : null,
//             }))
//           );
//           setEmails(emailList);
//           setFilteredEmails(emailList); // Initialize filtered emails
//           window.addEventListener("scroll", handleScroll);
//         } else {
//           console.error("Fetched data is not an array:", fetchedData);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     const updatedFilteredEmails = emails.filter((item) => {
//       const emailDate = item.date ? new Date(item.date) : null;
//       const selectedDate = startDate ? new Date(startDate) : null;
//       return (
//         item.email.toLowerCase().includes(searchInput.toLowerCase()) &&
//         (!selectedDate ||
//           (emailDate && emailDate.toDateString() === selectedDate.toDateString()))
//       );
//     });
//     setFilteredEmails(updatedFilteredEmails);
//     setCurrentPage(1); // Reset to first page on filter change
//   }, [searchInput, startDate, emails]);

//   const handleCheckboxChange = (email) => {
//     setSelectedEmails((prevSelected) => {
//       const newSelectedEmails = prevSelected.includes(email)
//         ? prevSelected.filter((selectedEmail) => selectedEmail !== email)
//         : [...prevSelected, email];

//       setShowSelectedEmails(newSelectedEmails.length > 0);
//       return newSelectedEmails;
//     });
//   };

//   const handleSelectAllChange = () => {
//     if (selectAll) {
//       setSelectedEmails([]);
//       setShowSelectedEmails(false);
//     } else {
//       const allEmails = filteredEmails.map((item) => item.email);
//       setSelectedEmails(allEmails);
//       setShowSelectedEmails(true);
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleSubmit = () => {
//     setLoading(true);
//     setToEmails(selectedEmails);
//     setSentEmails((prevSent) => [...prevSent, ...selectedEmails]);

//     setTimeout(() => {
//       setShowMail(true);
//       setLoading(false);
//     }, 1000);
//   };

//   const handleTextareaChange = (e) => {
//     const inputEmails = e.target.value.split(",").map((email) => email.trim());
//     const uniqueEmails = [...new Set([...sentEmails, ...inputEmails])];
//     setSelectedEmails(uniqueEmails);
//   };

//   // Pagination logic
//   const indexOfLastEmail = currentPage * emailsPerPage;
//   const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
//   const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);
//   const currentEmails = filteredEmails.slice(indexOfFirstEmail, indexOfLastEmail);

//   const toggleDatePicker = () => {
//     if (showSearchInput) {
//       setShowSearchInput(false); // Close search input if it's open
//     }
//     setShowDatePicker(!showDatePicker);
//   };

//   const handleSearchInputChange = (e) => {
//     setSearchInput(e.target.value);
//     setCurrentPage(1); // Reset to first page on search
//   };

//   const handleSearchInputToggle = () => {
//     if (showDatePicker) {
//       setShowDatePicker(false); // Close date picker if it's open
//     }
//     setShowSearchInput(!showSearchInput);
//   };

//   return (
//     <section className="contact_maildata">
//       <div className="container">
//         <div className="row mt-5">
//           <div className="col mt-3 mt-md-5 contact_alldata">
//             <h2 className="text-center">All Emails Data</h2>
//             <p className="text-center py-2">
//               This feature is designed to streamline the management of email communications.
//             </p>
//             <ul className="list-group">
//               <li className="list-group-item p-0">
//                 <div className="row" style={{ backgroundColor: "#4ca2ff", padding: '0.925rem' }}>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="selectAllCheckbox"
//                       onChange={handleSelectAllChange}
//                       checked={selectAll}
//                     />
//                     <label className="form-check-label" htmlFor="selectAllCheckbox"></label>
//                   </div>
//                   <div className="col text-center text-white" onClick={handleSearchInputToggle}>
//                     <b>
//                       Email{" "}
//                       {showSearchInput ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
//                     </b>
//                   </div>
//                   <div className="col text-end text-white" style={{ paddingRight: "4rem" }} onClick={toggleDatePicker}>
//                     <b>
//                       Date{" "}
//                       {showDatePicker ? <ArrowDropUpIcon className="arrowdrop" /> : <ArrowDropDownIcon />}
//                     </b>
//                   </div>
//                 </div>

//                 {showSearchInput && (
//                   <div className="search-input-container">
//                     <input
//                       type="text"
//                       value={searchInput}
//                       onChange={handleSearchInputChange}
//                       placeholder="Search email..."
//                       className="form-control"
//                     />
//                   </div>
//                 )}

//                 {showDatePicker && (
//                   <div className="date-picker-container">
//                     <div>
//                       <img src={myImage} height={'180px'} width={'180px'} className="logoimg" />
//                     </div>
//                     <DatePicker
//                       selected={startDate}
//                       onChange={(date) => {
//                         setStartDate(date); // Update the selected date
//                         setShowDatePicker(false); // Hide the date picker
//                       }}
//                       inline
//                     />
//                   </div>
//                 )}
//               </li>

//               {currentEmails.length > 0 ? (
//                 currentEmails.map((item, index) => (
//                   <li key={index} className="list-group-item">
//                     <div className="row text-muted p-3">
//                       <div className="form-check">
//                         <input
//                           className="form-check-input"
//                           type="checkbox"
//                           id={`flexCheckDefault${index}`}
//                           onChange={() => handleCheckboxChange(item.email)}
//                           checked={selectedEmails.includes(item.email)}
//                         />
//                       </div>
//                       <div className="col text-start">{item.email}</div>
//                       <div className="col text-end" style={{ paddingRight: "3.545rem" }}>
//                         {item.date.split("").slice(0, 10).join("")}
//                       </div>
//                     </div>
//                   </li>
//                 ))
//               ) : (
//                 <li className="list-group-item text-center text-muted">
//                   <img src={datanotFound} alt="No data found" style={{ width: '200px', height: 'auto' }} />
//                 </li>
//               )}
//             </ul>
//           </div>

//           <div className="d-flex justify-content-center my-3">
//             <Stack spacing={2}>
//               <Pagination
//                 count={totalPages} // Set the total number of pages based on filtered emails
//                 page={currentPage} // Current page
//                 onChange={(event, value) => setCurrentPage(value)} // Handle page change
//                 color="primary"
//               />
//             </Stack>
//           </div>

//           <div className="row">
//             <div className="col-12 py-3">
//               {showSelectedEmails && (
//                 <>
//                   <div className=" list-group mx-auto d-none">
//                     {selectedEmails.length > 0 && (
//                       <textarea
//                         value={selectedEmails.join(", ")}
//                         onChange={handleTextareaChange}
//                         className="form-control"
//                         rows="6"
//                         style={{
//                           whiteSpace: "pre-wrap",
//                           wordBreak: "break-word",
//                           fontWeight: "bold",
//                           backgroundColor: "#e8eff7",
//                         }}
//                       />
//                     )}
//                   </div>
//                   <div className="py-3 d-flex justify-content-center">
//                     <button
//                       className="btn btn-primary"
//                       disabled={selectedEmails.length === 0 || loading}
//                       type="button"
//                       onClick={handleSubmit}
//                     >
//                       {loading ? "loading..." : "Proceed"}
//                     </button>
//                   </div>
//                   {loading && (
//                     <Box
//                       sx={{
//                         display: "flex",
//                         justifyContent: "center",
//                         marginTop: "1px",
//                       }}
//                     >
//                       <CircularProgress size="30px" />
//                     </Box>
//                   )}
//                 </>
//               )}
//             </div>
//             <div className="d-flex justify-content-center fixed_Arrow">
//               <div className="scrollArrows">
//                 {showUpward && (
//                   <div className="upwardArrow" onClick={scrollToTop}>
//                     <ArrowUpwardIcon />
//                   </div>
//                 )}
//                 {showDownward && (
//                   <div className="downwardArrow" onClick={scrollToBottom}>
//                     <ArrowDownwardIcon />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {showMail && <Mail emails={toEmails} />}
//     </section>
//   );
// };

// export default ContactMail;



import React, { useEffect, useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import "./ContactMail.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Mail from "../Mails/Mail.jsx";
import axios from "axios";
import myImage from '../../assests/logo.jpg'; 
import datanotFound from '../../assests/datanotfound.jpg';

const ContactMail = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [toEmails, setToEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [showMail, setShowMail] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSelectedEmails, setShowSelectedEmails] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 30;
  const [showUpward, setShowUpward] = useState(false);
  const [showDownward, setShowDownward] = useState(true);
  const [filteredEmails, setFilteredEmails] = useState([]);

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    setShowUpward(scrollY > 0);
    setShowDownward(scrollY + windowHeight < documentHeight);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const username = localStorage.getItem("userEmail");
      try {
        const response = await axios.get("http://localhost:8080/contactMails", {
          params: { email: username },
          withCredentials: true,
        });

        const fetchedData = response.data;

        if (Array.isArray(fetchedData)) {
          const emailList = fetchedData.flatMap((item) =>
            item.email.split(",").map((email) => ({
              email: email.trim(),
              date: item.dates
                ? new Date(item.dates.split("/").reverse().join("-")).toISOString()
                : null,
            }))
          );
          setEmails(emailList);
          setFilteredEmails(emailList); // Initialize filtered emails
          window.addEventListener("scroll", handleScroll);
        } else {
          console.error("Fetched data is not an array:", fetchedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updatedFilteredEmails = emails.filter((item) => {
      const emailDate = item.date ? new Date(item.date) : null;
      const selectedDate = startDate ? new Date(startDate) : null;
      return (
        item.email.toLowerCase().includes(searchInput.toLowerCase()) &&
        (!selectedDate ||
          (emailDate && emailDate.toDateString() === selectedDate.toDateString()))
      );
    });
    setFilteredEmails(updatedFilteredEmails);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchInput, startDate, emails]);

  const handleCheckboxChange = (email) => {
    setSelectedEmails((prevSelected) => {
      const newSelectedEmails = prevSelected.includes(email)
        ? prevSelected.filter((selectedEmail) => selectedEmail !== email)
        : [...prevSelected, email];

      setShowSelectedEmails(newSelectedEmails.length > 0);
      return newSelectedEmails;
    });
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedEmails([]);
      setShowSelectedEmails(false);
    } else {
      const allEmails = filteredEmails.map((item) => item.email);
      setSelectedEmails(allEmails);
      setShowSelectedEmails(true);
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = () => {
    setLoading(true);
    
    // Create a unique list of emails
    const uniqueEmails = [...new Set(selectedEmails)];
    
    setToEmails(uniqueEmails);
    setSentEmails((prevSent) => [...new Set([...prevSent, ...uniqueEmails])]); // Ensure sentEmails also has unique emails

    setTimeout(() => {
      setShowMail(true);
      setLoading(false);
    }, 1000);
  };

  const handleTextareaChange = (e) => {
    const inputEmails = e.target.value.split(",").map((email) => email.trim());
    const uniqueEmails = [...new Set([...sentEmails, ...inputEmails])];
    setSelectedEmails(uniqueEmails);
  };

  // Pagination logic
  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);
  const currentEmails = filteredEmails.slice(indexOfFirstEmail, indexOfLastEmail);

  const toggleDatePicker = () => {
    if (showSearchInput) {
      setShowSearchInput(false); // Close search input if it's open
    }
    setShowDatePicker(!showDatePicker);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSearchInputToggle = () => {
    if (showDatePicker) {
      setShowDatePicker(false); // Close date picker if it's open
    }
    setShowSearchInput(!showSearchInput);
  };

  return (
    <section className="contact_maildata">
      <div className="container">
        <div className="row mt-5">
          <div className="col mt-3 mt-md-5 contact_alldata">
            <h2 className="text-center">All Emails Data</h2>
            <p className="text-center py-2">
              This feature is designed to streamline the management of email communications.
            </p>
            <ul className="list-group">
              <li className="list-group-item p-0">
                <div className="row" style={{ backgroundColor: "#4ca2ff", padding: '0.925rem' }}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAllCheckbox"
                      onChange={handleSelectAllChange}
                      checked={selectAll}
                    />
                    <label className="form-check-label" htmlFor="selectAllCheckbox"></label>
                  </div>
                  <div className="col text-center text-white" onClick={handleSearchInputToggle}>
                    <b>
                      Email{" "}
                      {showSearchInput ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    </b>
                  </div>
                  <div className="col text-end text-white" style={{ paddingRight: "4rem" }} onClick={toggleDatePicker}>
                    <b>
                      Date{" "}
                      {showDatePicker ? <ArrowDropUpIcon className="arrowdrop" /> : <ArrowDropDownIcon />}
                    </b>
                  </div>
                </div>

                {showSearchInput && (
                  <div className="search-input-container">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={handleSearchInputChange}
                      placeholder="Search email..."
                      className="form-control"
                    />
                  </div>
                )}

                {showDatePicker && (
                  <div className="date-picker-container">
                    <div>
                      <img src={myImage} height={'180px'} width={'180px'} className="logoimg" />
                    </div>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => {
                        setStartDate(date); // Update the selected date
                        setShowDatePicker(false); // Hide the date picker
                      }}
                      inline
                    />
                  </div>
                )}
              </li>

              {currentEmails.length > 0 ? (
                currentEmails.map((item, index) => (
                  <li key={index} className="list-group-item">
                    <div className="row text-muted p-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`flexCheckDefault${index}`}
                          onChange={() => handleCheckboxChange(item.email)}
                          checked={selectedEmails.includes(item.email)}
                        />
                      </div>
                      <div className="col text-start">{item.email}</div>
                      <div className="col text-end" style={{ paddingRight: "3.545rem" }}>
                        {item.date.split("").slice(0, 10).join("")}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-center text-muted">
                  <img src={datanotFound} alt="No data found" style={{ width: '200px', height: 'auto' }} />
                </li>
              )}
            </ul>
          </div>

          <div className="d-flex justify-content-center my-3">
            <Stack spacing={2}>
              <Pagination
                count={totalPages} // Set the total number of pages based on filtered emails
                page={currentPage} // Current page
                onChange={(event, value) => setCurrentPage(value)} // Handle page change
                color="primary"
              />
            </Stack>
          </div>

          <div className="row">
            <div className="col-12 py-3">
              {showSelectedEmails && (
                <>
                  <div className=" list-group mx-auto d-none">
                    {selectedEmails.length > 0 && (
                      <textarea
                        value={selectedEmails.join(", ")}
                        onChange={handleTextareaChange}
                        className="form-control"
                        rows="6"
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          fontWeight: "bold",
                          backgroundColor: "#e8eff7",
                        }}
                      />
                    )}
                  </div>
                  <div className="py-3 d-flex justify-content-center">
                    <button
                      className="btn btn-primary"
                      disabled={selectedEmails.length === 0 || loading}
                      type="button"
                      onClick={handleSubmit}
                    >
                      {loading ? "loading..." : "Proceed"}
                    </button>
                  </div>
                  {loading && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "1px",
                      }}
                    >
                      <CircularProgress size="30px" />
                    </Box>
                  )}
                </>
              )}
            </div>
            <div className="d-flex justify-content-center fixed_Arrow">
              <div className="scrollArrows">
                {showUpward && (
                  <div className="upwardArrow" onClick={scrollToTop}>
                    <ArrowUpwardIcon />
                  </div>
                )}
                {showDownward && (
                  <div className="downwardArrow" onClick={scrollToBottom}>
                    <ArrowDownwardIcon />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showMail && <Mail emails={toEmails} />}
    </section>
  );
};

export default ContactMail;