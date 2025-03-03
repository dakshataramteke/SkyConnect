import React, { useEffect, useState } from 'react';
import './Pricing.css';
import axios from 'axios';
import image from '../../assests/skylogo.png';
import '../../index.css';

const Pricing = () => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [generatedId, setGeneratedId] = useState(0);

  useEffect(() => {
    const storedId = localStorage.getItem('generatedId');
    if (storedId) {
      setGeneratedId(Number(storedId));
    } else {
      localStorage.setItem('generatedId', 0);
    }
  }, []);

  const generateId = () => {
    const newId = generatedId + 1;
    localStorage.setItem('generatedId', newId);
    setGeneratedId(newId);
    return newId;
  };

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

  const calculateEndDate = (planName) => {
    const currentDate = new Date();
    let endDate;

    switch (planName) {
      case 'Beginner':
        endDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
        break;
      case 'Intermediate':
        endDate = new Date(currentDate.setMonth(currentDate.getMonth() + 3));
        break;
      case 'Advance':
        endDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
        break;
      default:
        endDate = currentDate;
    }

    return endDate.toISOString().split('T')[0];
  };

  const checkoutHandler = async (amount, planName) => {
    try {
      const username = localStorage.getItem('Login User'); 
      const currentDate = Date.now(); 
      const calculatedEndDate = calculateEndDate(planName); 
      const newId = generateId();

      const response = await axios.post('http://localhost:8080/api/checkout', { 
        amount, 
        planName, 
        username, 
        date: currentDate, 
        endDate: calculatedEndDate, 
        generatedId: newId 
      }); 

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
            plan: planName, 
            date: new Date().toISOString().split('T')[0], 
            endDate: calculatedEndDate, 
            generatedId: newId
          },
          theme: {
            color: '#528FF0'
          },
        };
    
        const razor = new window.Razorpay(options);
        razor.open();
    
        razor.on('payment.success', async (paymentData) => {
          const paymentVerificationData = {
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_signature: paymentData.razorpay_signature,
            plan: planName,
            date: new Date().toISOString().split('T')[0],
            endDate: calculatedEndDate, 
            generatedId: newId 
          };
    
          await axios.post('http://localhost:8080/api/paymentverification', paymentVerificationData, {
            headers: {
              username: username 
            }
          });
        });
  
        setEndDate(calculatedEndDate);
        console.log(calculatedEndDate);
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