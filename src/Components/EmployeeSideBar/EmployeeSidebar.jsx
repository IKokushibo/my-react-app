import React, { useState } from 'react';
import DB from './db.svg';
import Apply from './UserWhite.svg';
import Credit from './User_Card_ID.svg';
import History from './File_Blank.svg';
import Lock from "../lock.svg";
import Logout from "./logout.svg";
import { useNavigate } from 'react-router-dom';
import axios from '../../services/AxiosConfiguration';

function Sidebar1() {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Manage loading state
  const [isError, setIsError] = useState(false); // Manage error state
  const [error, setError] = useState(null);

  const isClickedHandler = () => {
    setIsClicked(!isClicked);
  };

  const navigateDashboard = () => {
    window.location.href = '/employee/landing-page';
  };

  const navigateApplyLeave = () => {
    window.location.href = '/employee/apply-leave';
  };

  const navigateHistory = () => {
    window.location.href = '/employee/leave-history';
  };

  const navigateCredits = () => {
    window.location.href = '/employee/leave-credits';
  };

  const navigateLandingPage = () => {
    window.location.href = '/employee/landing-page';
  };

  const navigateChangePassword = () => {
    window.location.href = '/account/change-password';
  };

  const logoutHandler = async () => {
    try {
      setIsLoading(true);
      const url = '/users/log-out';
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

  return (
    <>
      {/* Sidebar */}
      <aside className="w-25% max-w-337.25px bg-blue-500 text-white p-8">
        <h1 onClick={navigateLandingPage} className="text-4xl font-bold mb-20 text-center">
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
