import React, { useState } from 'react';
import DB from './db.svg';
import Apply from './UserWhite.svg';
import Credit from './User_Card_ID.svg';
import History from './File_Blank.svg';
import Lock from "../lock.svg";
import Logout from "./logout.svg";
import { useNavigate } from 'react-router-dom';
import axios from '../../services/AxiosConfiguration';
import Loading from "../../Components/LoadingAnimation/Loading"; // Import Loading component

function Sidebar1() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Manage loading state
  const [isError, setIsError] = useState(false); // Manage error state
  const [error, setError] = useState(null);

  const navigateDashboard = () => {
    navigate('/employee/landing-page');
  };

  const navigateApplyLeave = () => {
    navigate('/employee/apply-leave');
  };

  const navigateHistory = () => {
    navigate('/employee/leave-history');
  };

  const navigateCredits = () => {
    navigate('/employee/leave-credits');
  };

  const navigateChangePassword = () => {
    navigate('/account/change-password');
  };

  const logoutHandler = async () => {
    try {
      setIsLoading(true);
      const url = '/users/auth/logout'; // Adjust this URL to match your actual API endpoint
      const response = await axios.post(url);
      if (response.status === 200) {
        localStorage.removeItem('accessToken');
        navigate('/login-user');
      }
    } catch (error) {
      setError(error);
      setIsError(true);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <Loading />; // Display loading animation if the logout request is still processing
  }

  if (isError) {
    const status = error?.response?.status;
    if (status === 401) {
      alert("Session expired");
      localStorage.removeItem("accessToken");
      navigate('/login-user');
    } else if (error.code === "ERR_NETWORK") {
      alert("Network Error. Please try again.");
    }
  }

  return (
    <>
      {/* Sidebar */}
      <aside className="w-25% max-w-337.25px bg-blue-500 text-white p-8">
        <h1 onClick={navigateDashboard} className="text-4xl font-bold mb-20 text-center">
          Employee Leave Management
        </h1>

        <nav>
          <ul>
            <li className="ml-2 mb-5">
              <button onClick={navigateDashboard} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={DB} alt="" />
                <span className="text-xl ml-1">Dashboard</span>
              </button>
            </li>
            <li className="mb-5">
              <button onClick={navigateApplyLeave} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={Apply} alt="" />
                <span className="text-xl">Apply Leave</span>
              </button>
            </li>
            <li className="mb-5">
              <button onClick={navigateHistory} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={History} alt="" />
                <span className="text-xl">Leave History</span>
              </button>
            </li>
            <li className="mb-5">
              <button onClick={navigateCredits} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={Credit} alt="" />
                <span className="text-xl">Leave Credits Remaining</span>
              </button>
            </li>
            <li className="mb-5">
              <button onClick={navigateChangePassword} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={Lock} className="size-7" alt="" />
                <span className="text-xl">Change Password</span>
              </button>
            </li>
            <li className="mb-5">
              <button onClick={logoutHandler} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={Logout} className="size-7" alt="" />
                <span className="text-xl">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar1;
