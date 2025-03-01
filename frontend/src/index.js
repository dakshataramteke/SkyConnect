import React ,{useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Loader from './loader.js';
 
const Root = () => {
  const [loading, setLoading] = useState(true);

  // Simulate a loading process (e.g., fetching data)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after 5 seconds
    }, 4000);

    return () => clearTimeout(timer); 
  }, []);

  if (loading) {
    return <Loader />; 
  }

  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
   <Root />
  </React.StrictMode>
);

reportWebVitals();
