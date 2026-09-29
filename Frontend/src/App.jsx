import Signup from './pages/Registration'
import Login from './pages/Login'
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import './App.css'
import { Navigate, Routes, Route } from 'react-router-dom'

function ResetPasswordRoute() {
  const resetEmail = sessionStorage.getItem('resetEmail');

  return resetEmail ? <ResetPassword /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/home' element={<Home />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPasswordRoute />} />
        <Route path='*' element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
