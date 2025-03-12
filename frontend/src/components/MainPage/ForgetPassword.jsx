import { React, useState, useEffect } from "react"; // Import useEffect
import "./LoginPage.css";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link } from "react-router-dom";
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router";

const ForgetPassword = () => {
  let navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userEmail, setUserEmail] = useState(''); // State for user email

  useEffect(() => {
    const email = localStorage.getItem('userEmail'); // Extract email from local storage
    if (email) {
      setUserEmail(email);
    }
    console.log("forget email is :",email)
  }, []);

  const handlePasswordVisibilityToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleConfirmPasswordVisibilityToggle = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === confirmPassword) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Your password has been reset successfully.',
      });
      navigate('/');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Passwords do not match. Please try again.',
      });
    }
  };

  return (
    <>
      <div className="container forget_Page">
        <div className="row my-5 forget_psw">
          <div className="col-12 col-md-6 my-2 forget_cols p-5">
            <h2 className='my-5 text-center'>Forgot your Password <EnhancedEncryptionIcon className="fs-2 mb-2 ms-2 text-primary" /></h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control py-4"
                  id="exampleInputPassword1"
                  placeholder='New password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="input-group-text eyeshow"
                  onClick={handlePasswordVisibilityToggle}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    position: "absolute",
                    right: "50px",
                    top: '40%',
                    zIndex: 11,
                    border: "none"
                  }}
                >
                  {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </span>
              </div>
              <div className="mb-3">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control py-4"
                  id="exampleInputConfirmPassword1"
                  placeholder='Confirm password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                  className="input-group-text eyeshow"
                  onClick={handleConfirmPasswordVisibilityToggle}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    position: "absolute",
                    right: "50px",
                    top: "53%",
                    zIndex: 11,
                    border: "none"
                  }}
                >
                  {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </span>
              </div>
              <div className='d-flex justify-content-center '>
                <button type="submit" className="btn mt-4">Reset Password</button><br />
              </div>
              <div className="text-end mt-4">
                <Link to={"/"} className="mt-5">Back to Login Page</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgetPassword;