import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient.js';
import formatTime from '../utils/formatTime.js';
import { Link, useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({
        email: "",
        otp: ""
    })
    const [otpSentStatus, setOtpSentStatus] = useState(false);
    const [waitStatus, setWaitStatus] = useState(false);
    const [expiresAt, setExpiresAt] = useState(null);
    const [now, setNow] = useState(Date.now());

    const timer = expiresAt
        ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000))
        : 0;

    useEffect(() => {
        if (!expiresAt) {
            return undefined;
        }

        const interval = setInterval(() => {
            if (Date.now() >= new Date(expiresAt).getTime()) {
                setExpiresAt(null);
            } else {
                setNow(Date.now());
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    function updateFieldData(fieldName, newValue) {
        setUserDetails(prevDetails => ({
            ...prevDetails,
            [fieldName]: newValue
        }))
    }

    async function sendOtp() {
        if (!userDetails.email) {
            alert("Please enter your Email...");
            return;
        }
        try {
            setWaitStatus(true);
            const res = await axiosClient.post('/user/forgot-password/', { email: userDetails.email });
            if (res.status === 200) {
                setOtpSentStatus(true);
                setExpiresAt(res.data.expiresAt);
                alert(res.data.message);
                updateFieldData('otp', "");
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                alert(err.response.data.message);
            }
        } finally {
            setWaitStatus(false);
        }
    }
    async function verifyOtp() {
        if (!userDetails.otp) {
            alert("OTP Required!.");
            return;
        }
        try {
            const res = await axiosClient.post('/user/verify-otp', userDetails);
            if (res.status === 200) {
                alert(res.data.message);
                sessionStorage.setItem('resetEmail', userDetails.email);
                navigate('/reset-password');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                alert(err.response.data.message);
            }
        }
    }

    return (
        <>
            <div className="d-flex" style={{ height: '100vh', backgroundColor: '#e8f1fb' }}>
                <div className="left-half w-50 d-flex align-items-center" style={{ maxHeight: '100%', overflow: 'hidden' }}>
                    <img src="/auth2.jpg" alt="auth-system" style={{ width: '80%', marginLeft: '10%' }} />
                </div>
                <div className="right-half w-50 d-flex align-items-center">
                    <div className='w-75 forgot-password'>
                        <h1 className='heading' style={{ marginBottom: '3%' }}>Forgot Password</h1>
                        <p style={{ textAlign: 'center', marginBottom: '10%', color: 'blue', fontSize: '1.1em' }}>Enter your user account's verified email address and we will send you a OTP for password reset.</p>
                        <Form>
                            <Form.Group className="mb-2" controlId="formBasicEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control disabled={otpSentStatus} type="email" placeholder="Enter email" className='form-field' name='email'
                                    value={userDetails.email} onChange={(e) => { updateFieldData('email', e.target.value) }} />
                            </Form.Group>
                            {otpSentStatus ? (
                                <>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label className='mt-2'>OTP</Form.Label>
                                        <div className='timer'>
                                            <p>{timer > 0 ? formatTime(timer) : "Expired"}</p>
                                        </div>
                                        <Form.Control type="text" placeholder="Enter Otp" className='form-field' name='otp' value={userDetails.otp} onChange={(e) => updateFieldData('otp', e.target.value)} />
                                    </Form.Group>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Button variant="primary" type="button" onClick={verifyOtp}>Verify Otp</Button>
                                        <Button disabled={waitStatus} variant="primary" type="button" onClick={sendOtp} hidden={timer > 0} >
                                            {waitStatus ? "Resending..." : "Resend OTP"}
                                        </Button>
                                    </div>
                                </>
                            ) : waitStatus ? (
                                <Button disabled variant="primary" type="button">Sending OTP...</Button>
                            ) : (
                                <Button variant="primary" type="button" onClick={sendOtp}>Send Otp</Button>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;