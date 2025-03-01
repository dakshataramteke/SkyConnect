
import React, { useEffect, useState } from 'react';
import './Pricing.css';
import axios from 'axios';
import image from '../../assests/skylogo.png';
import '../../index.css';

const Pricing = () => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  const getData = async (data) => {
    console.log("Local payment data: " + JSON.stringify(data));
    setLoading(false);
    return fetch(`http://localhost:8080/api/payment`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .catch((err) => console.log(err));
  };

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data: { key_id } } = await axios.get('http://localhost:8080/api/getkey');
        setKey(key_id);
      } catch (error) {
        console.error('Error fetching key:', error);
      }
    };

    fetchKey();
  }, []);

  const checkoutHandler = async (amount, planName) => {
    try {
      const username = localStorage.getItem('Login User'); // Retrieve username from local storage
      const currentDate = Date.now(); // Get current date in milliseconds
      const response = await axios.post('http://localhost:8080/api/checkout', { amount, planName, username, date: currentDate }); // Include date in the request body
      console.log('Checkout response:', response.data);
  
      if (response.data && response.data.id) {
        const { id, amount: orderAmount } = response.data;
  
        const options = {
          key,
          amount: orderAmount,
          currency: 'INR',
          name: 'Emails',
          description: 'Emails for Your Business to grow more easily',
          image: image,
          order_id: id,
          callback_url: 'http://localhost:8080/api/paymentverification',
          prefill: {
            name: 'NELLI SURESH',
            email: 'divya1267@gmail.com',
            contact: '7515209223'
          },
          notes: {
            address: 'Razorpay Corporate Office',
            plan: planName, // Pass the plan name
            date: new Date().toISOString().split('T')[0], // Pass today's date
          },
          theme: {
            color: '#528FF0'
          },
        };
  
        const razor = new window.Razorpay(options);
        razor.open();
  
        // Add an event listener for the payment success
        razor.on('payment.success', async (paymentData) => {
          const paymentVerificationData = {
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_signature: paymentData.razorpay_signature,
            plan: planName,
            date: new Date().toISOString().split('T')[0],
          };
  
          // Send the payment verification data to the backend
          await axios.post('http://localhost:8080/api/paymentverification', paymentVerificationData, {
            headers: {
              username: username // Pass the username in headers
            }
          });
        });
      } else {
        console.error('Order is undefined in the response:', response.data);
        alert('There was an issue processing your order. Please try again later.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('An error occurred during checkout. Please try again later.');
    }
  };

  return (
    <>
      <section className="pricing_Wrapper">
        <div className="container">
          <div className='text-center' style={{ lineHeight: '2.5' }}>
            <h2 className='title'>Pricing Plans</h2>
            <h3>Streamline Your Email Campaigns with Dummy Mails</h3>
            <p>Powerful, User-Friendly and Scalable Email Solution.</p>
          </div>
          <div className="row">
            <div className="col-12 col-md-3 card_border">
              <h2>Beginner</h2>
              <h5>Start a Trial</h5>
              <h1 className='price'> $ 3</h1>
              <ul className='ul_tabs'>
                <li> Duration : 7 Days</li>
                <li> Daily 10 emails free</li>
                <li> No Hidden Fees</li>
                <li> 100+ Video Tutorials</li>
                <li> No Tools</li>
              </ul>
              <button className="btn get_started mt-2 bg-primary" onClick={() => checkoutHandler(3, 'Beginner')}>Pay with Razorpay</button>
            </div>

            <div className="col-12 col-md-3 card_border active_section" style={{ backgroundColor: '#cfe4fa' }}>
              <button className='btn Popular_btn'>Popular</button>
              <h2>Intermediate</h2>
              <h5>For Small Business Team</h5>
              <h1 className='price'> $ 5 </h1>
              <ul className='ul_tabs'>
                <li> Duration : 3 Month</li>
                <li> Daily 100 emails </li>
                <li> No Hidden Fees</li>
                <li> 100+ Video Tutorials</li>
                <li> 2 Tools</li>
              </ul>
              <button className="btn get_started mt-2 me-1" style={{ backgroundColor: '#ffce1c', color: '#000000' }} onClick={() => checkoutHandler(5, 'Intermediate')}>Pay with Razorpay</button>
            </div>

            <div className="col-12 col-md-3 card_border">
              <h2>Advance</h2>
              <h5>Unlimited Possibilities</h5>
              <h1 className='price'> $ 25</h1>
              <ul className='ul_tabs'>
                <li> Duration : 1 Year</li>
                <li> Unlimited Features</li>
                <li> No Hidden Fees</li>
                <li> Unlimited Videos</li>
                <li> Unlimited Tools</li>
              </ul>
              <button className="btn get_started mt-2 bg-primary" onClick={() => checkoutHandler(25, 'Advance')}>Pay with Razorpay</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;


