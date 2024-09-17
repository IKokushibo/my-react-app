import React, { useState } from 'react';
import Submenu from './Submenu';
import Dashboard from './db.svg';
import Employee from './Users_Group.svg';
import Department from './ds.svg';
import Leave from './leave.svg';
import Manage from './manage.svg';
import Logout from './logout.svg';
import { useNavigate } from 'react-router-dom';
import axios from '../services/AxiosConfiguration';

function Sidebar() {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Manage loading state
  const [isError, setIsError] = useState(false); // Manage error state
  const [error, setError] = useState(null); // Store the error

  const isClickedHandler = () => {
    setIsClicked(!isClicked);
  };

  const navigateDashboard = () => {
    navigate('/admin/landing-page');
  };

  const navigateEmployee = () => {
    navigate('/admin/employee-section');
  };

  const navigateDepartment = () => {
    navigate('/admin/department-section');
  };

  const navigateLeaveType = () => {
    navigate('/admin/leave-type');
  };

  const logoutHandler = async () => {
    try {
      setIsLoading(true);
      const url = '/users/auth/logout'; // Make sure this matches your actual logout endpoint
      const response = await axios.post(url);
      console.log(response);
      if (response.status === 200) {
        localStorage.removeItem('accessToken');
        navigate('/login-admin'); // Redirect to login after successful logout
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError(error);
      setIsError(true);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="w-25% max-w-337.25px bg-blue-500 text-white p-8">
        <h1 className="text-4xl font-bold mb-20 text-center">Employee Leave Management</h1>

        <nav>
          <ul>
            <li className="mb-5">
              <button onClick={navigateDashboard} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={Dashboard} alt="Dashboard" />
                <span className="text-xl">Dashboard</span>
              </button>
            </li>
            <li className="mb-5">
              <button onClick={navigateEmployee} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={Employee} alt="Employee Section" />
                <span className="text-xl">Employee Section</span>
              </button>
            </li>
            <li className="mb-5">
              <button onClick={navigateDepartment} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={Department} alt="Department Section" />
                <span className="text-xl">Department Section</span>
              </button>
            </li>
            <li className="mb-5">
              <button onClick={navigateLeaveType} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={Leave} alt="Leave Types" />
                <span className="text-xl">Leave Types</span>
              </button>
            </li>
            <li className="mb-5">
              <button onClick={isClickedHandler} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full justify-between">
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <img src={Manage} alt="Manage Leaves" />
                      <span className="text-xl">Manage Leaves</span>
                    </div>
                    <span className={`transform ${isClicked ? 'rotate-180' : 'rotate-0'} transition-transform`}>▼</span>
                  </div>
                </div>
              </button>
              {isClicked && <Submenu />}
            </li>
            <li className="mb-5">
              <button onClick={logoutHandler} className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-md w-full">
                <img src={Logout} className="size-5" alt="Logout" />
                <span className="text-xl">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
        {isError && <p className="text-red-500">Logout failed. Please try again.</p>}
      </aside>
    </>
  );
}

export default Sidebar;
