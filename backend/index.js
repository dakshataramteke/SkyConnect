// === Require modules === //

const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
const connection = require('./models/db.js');   
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const config = require('./config/config.js');
const crypto = require('crypto');
// const PaytmChecksum = require('paytmchecksum');

// === Initialize the App === //
const app = express();
const port = 8080;

// === Configuration  MiddleWares === //

app.use(cors({

  origin: 'http://localhost:3000',
  // origin: 'http://192.168.1.16:3000' ,
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
}); 

// Session Middleware 
app.use(session({
  secret: "skyconnect@25",
  resave: true,
  saveUninitialized: true,
  sameSite: 'lax' ,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 
  }
}));
// === END MIDDLEWARE === //



// ==== RAZORPAY KEY ===== //
Razorpay_API_key = "rzp_test_R6NFOlSSREnTyp";
Razorpay_Secret_key = "cEnHN6HJfxi4LRgu5phXoEPh"

//Routes 

/*** 
 * 
 ==== LOGIN PAGE & SIGN UP ====
 *
 ***/

app.post('/signup', async (req, res) => {
  const { name, email, mobile, username, password, city } = req.body;

  // Check if the email already exists
  const checkEmailSql = `SELECT * FROM registration WHERE email = ?`;
  
  connection.query(checkEmailSql, [email], async (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).send("Internal Server Error");
    }

    // If results are not empty, it means the email already exists
    if (results.length > 0) {
      return res.status(400).send("Email already exists");
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const sql = `INSERT INTO registration (name, email, mobile_no, username, pass, city) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [name, email, mobile, username, hashedPassword, city];

    connection.query(sql, values, (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).send("Internal Server Error");
      }
      return res.status(201).send("User  registered successfully");
    });
  });
});


/*** 
 * 
 ======= Login Page =========
 * 
 ***/ 

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  const sql = `SELECT * FROM registration WHERE email = ?`;
  connection.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (results.length === 0) {
      console.log("No user found with this email.");
      return res.status(401).send("Invalid email or password");
    }

    const user = results[0];

    bcrypt.compare(password, user.pass, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).send("Internal Server Error");
      }

      if (!isMatch) {
        console.log("Password does not match.");
        return res.status(401).send("Invalid email or password");
      }

      // Store email in session
      req.session.userEmail = user.email;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).send("Internal Server Error");
        }

        // Send name in response
        const response = {
          message: "Logged in successfully",
          name: user.name, 
        };

        return res.status(200).json(response);
      });
    });
  });
});

// Forget Password 

app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  console.log("New Password", newPassword);
  
  try {
      // Step 5: Find user in the database
      const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (user.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Step 6: Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Step 7: Update user's password in the database
      await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
      console.log(object)
      return res.status(200).json({ message: 'Password reset successfully!' });

  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
  }
});

/*** 
 * 
 ====  Sending Mails through Nodemailer ====
 *
***/

const sendEmails = async (toList, from, password, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: from,
        pass: password,
      },
    });

    // Normalize toList: if it's a string, use it directly; if it's an array, use it as is
    const emailList = typeof toList === 'string' ? [toList] : (Array.isArray(toList) ? toList : []);

    // Log the email list for debugging
    console.log("Email list:", emailList);

    // Loop through each email address in the emailList
    for (const to of emailList) {
      // Check if the email is valid
      if (!to || typeof to !== 'string' || !to.includes('@')) {
        console.error(`Invalid email address: ${to}`);
        continue; // Skip invalid email addresses
      }

      const mailOptions = {
        from,
        to, 
        subject,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${to}`);
    }

    return { status: 200, message: "All emails sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};



/**
 * 
 * ====  For Username =====
 * 
 **/

app.get('/username', (req, res) => {
  const username = req.query.name;
  console.log("User Email from session:", username); // Log the user email
});

/*** 
 *
 *==== Contact Mails for Contact 
 *  
 ***/


app.get("/contactMails", (req, res) => {
  const email = req.query.email; 
  // const sql = `SELECT email, dates FROM excelsheetdata WHERE username = ?`;
  const sql = `SELECT email, DATE_FORMAT(dates, '%Y-%m-%d') AS dates FROM excelsheetdata WHERE username = ?`;
  connection.query(sql, email, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.json(results);
  });
});

/***
 * 
 =======  SINGLE MAIL =========
 *
 ***/

 app.post('/singleMail', async (req, res) => {
  const { toList, from, password, subject, htmlContent, username } = req.body; // Added username to the destructured body
  console.log("Received toList:", toList);

  // Check if toList is a single email
  if (typeof toList !== 'string' || !toList.includes('@') || toList.split(',').length > 1) {
    return res.status(400).send("Please provide a single valid email address.");
  }

  // Handle the email sending logic here
  try {
    const result = await sendEmails(toList.trim(), from, password, subject, htmlContent);
    
    // Check if email sending was successful
    if (result.status !== 200) {
      return res.status(result.status).send(result.message);
    }

    const currentDate = new Date(); // Get the current date and time
    const emailString = toList.trim(); // Use toList as emailString

    const sql = `INSERT INTO excelsheetdata (email, username, dates) VALUES (?, ?, ?)`;
    connection.query(sql, [emailString, username, currentDate], (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).send('Database error');
      }
      // Send a single response after successful email sending and database insertion
      res.status(200).send('Email sent and valid email inserted successfully');
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});



// Define the route to send emails for Multiple Mail
app.post('/send-emails', async (req, res) => {
  const { toList, from, password, subject, htmlContent } = req.body;

  try {
    const result = await sendEmails(toList, from, password, subject, htmlContent);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});


// Example usage in your route handler
app.post("/contact", async (req, res) => {
  const { toList, from, password, subject, htmlContent } = req.body;

  try {
    const result = await sendEmails(toList, from, password, subject, htmlContent);
    res.status(result.status).send(result.message);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


/***
 * 
 ==== DRAG and DROP Pattern ====
 *
 ***/


app.post('/save-emails', (req, res) => {

  console.log("Server is running ");
  console.log(req.body);
  const emails = req.body.emails;
  const username = req.body.username; // Get the username from the request body

  if (!Array.isArray(emails)) {
    return res.status(400).send('Invalid input: emails should be an array');
  }

  // Regular expression to validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Filter out valid emails
  const validEmails = emails.filter((email) => emailRegex.test(email.trim()));

  if (validEmails.length === 0) {
    return res.status(400).send('No valid emails to store');
  }

  const emailString = validEmails.join(', ');
  const currentDate = new Date(); // Get the current date and time

  const sql = `INSERT INTO excelsheetdata (email, username, dates) VALUES (?, ?, ?)`;
  connection.query(sql, [emailString, username, currentDate], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send('Database error');
    }
    res.status(200).send('Valid emails inserted successfully');
  });
});



/***
* 
====== Payment through Razorpay ====== 
*
***/


const instance = new Razorpay({
  key_id: Razorpay_API_key,
  key_secret: Razorpay_Secret_key,
});

// Checkout endpoint

app.post('/api/checkout', async (req, res) => {
  const amount = req.body.amount;
  const planName = req.body.planName; 
  const username = req.body.username; 
  const date = req.body.date;
  const endDate = req.body.endDate; 

  // Convert the date and endDate from milliseconds to MySQL format
  const startDate = new Date(date).toISOString().slice(0, 10).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS
  const formattedEndDate = new Date(endDate).toISOString().slice(0, 10).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS

  console.log("User   Name:", username);
  console.log("Start Date:", startDate); 
  console.log("End Date:", formattedEndDate); 
  console.log("Amount is ", amount);
  console.log("Plan Name :", planName);
  
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
    receipt: `receipt_order_${Math.random()}`, 
    notes: {
      plan: req.body.planName, 
      username: username, 
      date: startDate, 
      endDate: formattedEndDate 
    },
  };

  // Prepare the SQL query
  const sql = `INSERT INTO pricing (plan_Name, user_Name, startDate, endDate) VALUES (?, ?, ?, ? )`;
  const values = [planName, username, startDate, formattedEndDate]; 

  // Insert into the database
  connection.query(sql, values, async (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send('Database error');
    }

    try {
      const order = await instance.orders.create(options);
      // Update the order ID in the database after creating the order
      const updateSql = `UPDATE pricing SET razorpay_order_id = ? WHERE id = ?`; // Assuming you have an 'id' column
      const updateValues = [order.id, results.insertId]; // Use the last inserted ID
      connection.query(updateSql, updateValues, (updateError) => {
        if (updateError) {
          console.error('Database error during update:', updateError);
          return res.status(500).send('Database error during update');
        }
        res.status(200).json(order); // Send the order details as a response
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create order' }); // Handle errors
    }
  });
});
 app.get('/api/getkey', (req, res) => {
  res.status(200).json({ key_id: Razorpay_API_key });
});

// Payment Verification


app.post('/api/paymentverification', async (req, res) => {
  console.log(req.body);
  
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto.createHmac("sha256", Razorpay_Secret_key).update(body.toString()).digest('hex');
  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    return res.status(404).send("Payment Verification Failure");
  }

  // Prepare the SQL query
  const sql = `UPDATE pricing SET razor_PaymentId = ? WHERE razorpay_order_id = ?`;
  const values = [razorpay_payment_id, razorpay_order_id]; // Include both values

  try {
    // Use a promise-based approach for the database query
    await new Promise((resolve, reject) => {
      connection.query(sql, values, (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return reject('Database error');
        }
        resolve(results);
      });
    });

    // Send a single response after successful database insertion
    if (isAuthentic) {
      // Redirect or respond with success
      res.redirect(`http://localhost:3000/home/Pricing`);
    } else {
      res.status(404).send("Payment Verification Failure");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
app.listen(port,()=>{
    console.log(`Server is listening on port ${port}`);
})