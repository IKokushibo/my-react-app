import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import SideBard from "../../Components/Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "../../services/AxiosConfiguration";

// components
import Loading from "../../Components/LoadingAnimation/Loading";

function EmployeeSection() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactNumberError, setContactNumberError] = useState('');

  const [isMounted, setIsMounted] = useState(false);

  const [contactNumber, setContactNumber] = useState('');
  const [position, setPosition] = useState('');
  const [departmentId, setDepartmentId] = useState(null);
  const [role, setRole] = useState('');
  const [gender, setGender] = useState('');
  const [departments, setDepartments] = useState([]);

  const [isLeaveCreditsModalOpen, setIsLeaveCreditsModalOpen] = useState(false);
  const [userLeaveId, setUserLeaveId] = useState(0);
  const [userLeaves, setUserLeaves] = useState(0);
  const [userLeaveOldCredit, setUserLeaveOldCredit] = useState("");
  const [userId, setUserId] = useState(0);
  const [credit, setCredit] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(employees);

  const navigate = useNavigate();

  const employeeSectionHandler = () => {
    navigate("/admin/add-employee");
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setContactNumber(employee.contactNumber || '');
    setPosition(employee.position || '');
    setDepartmentId(employee.departmentId || '');
    setRole(employee.role || '');
    setGender(employee.gender || '');
    setIsModalOpen(true);
  };

  const handleRemove = async (employeeId) => {
    try {
      const url = `/users/admin/delete-employee/${employeeId}`;
      await axios.delete(url);
      setIsMounted(value => !value);
    } catch (error) {
      console.error("Error removing employee:", error);
    }
  };

  const updateEmployeeHandler = async () => {
    try {
      const url = `/users/admin/employees/update-employee/${selectedEmployee["user-id"]}`;
      const response = await axios.put(url, {
        "department-id": departmentId ? departmentId : 0,
        "employee-id": selectedEmployee['employee-id'],
        "first-name": selectedEmployee['first-name'],
        "middle-name": selectedEmployee['middle-name'],
        "last-name": selectedEmployee['last-name'],
        "phone-number": selectedEmployee['contact-number'],
        position,
        role,
        gender
      });
      if (response.status === 200) {
        setIsModalOpen(false);
        setIsMounted(value => !value);
      }
    } catch (error) {
      setError(error);
      setIsError(true);
    }
  };

  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    setContactNumber(value);

    const validNumber = /^[0-9]+$/;
    if (!validNumber.test(value)) {
      setContactNumberError("Invalid contact number format");
    } else {
      setContactNumberError('');
    }
  };

  const positionHandler = (value) => {
    setPosition(value);
  };

  const roleHandler = (value) => {
    setRole(value);
  };

  const genderHandler = (value) => {
    setGender(value);
  };

  const handleManageCredits = (employee) => {
    setSelectedEmployee(employee);
    setUserId(employee['user-id'])
    setUserLeaves(employee.userLeaveList);
    setIsLeaveCreditsModalOpen(true);
  };

  const saveLeaveCreditsHandler = async () => {
    try {
      const url = `/users/admin/user-leaves/${userLeaveId}/user/${userId}/update?credit=${credit}`;
      const response = await axios.put(url);
      if (response.status === 200) {
        setIsMounted(value => !value);
        setIsLeaveCreditsModalOpen(value => !value);
        setCredit(0);
      }
    } catch (error) {
      setIsError(true);
      setError(error);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const url = "/users/admin/all-employees";
        const response = await axios.get(url);
        setEmployees(response.data);
        const deptResponse = await axios.get("/users/departments");
        setDepartments(deptResponse.data);
      } catch (error) {
        setError(error);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [isMounted]);

  useEffect(() => {
    for (let i = 0; i < userLeaves.length; i++) {
      if (userLeaves[i].id.toString() === userLeaveId) {
        setUserLeaveOldCredit(userLeaves[i]['remaining-leave']);
        break;
      }
    }
  }, [userLeaveId]);

  useEffect(() => {
    const filtered = employees.filter((employee) =>
      employee['last-name'].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, employees]);

  if (isLoading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  if (isError) {
    if (error.status === 404) {
      alert(error.response.data.message)
    }

    setIsError(value => !value);
  }

  return (
    <>
      <Helmet>
        <title>Employee Section</title>
      </Helmet>

      <div className="flex h-screen bg-pageBg1">
        <SideBard />

        {/* Main Content */}
        <main className="w-4/5 p-10">
          <h1 className="text-3xl font-bold mb-8">Employee Section</h1>

          <div className="bg-white p-8 shadow-lg rounded-md">
            <h2 className="text-2xl font-bold mb-6">List of Employees</h2>
            <div className="flex justify-between items-center mb-6 relative">
              <button
                onClick={employeeSectionHandler}
                className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700"
              >
                Add New Employee
              </button>
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="text" placeholder="Search employee here" className="border p-4 h-10" />
            </div>

            <div className="overflow-x-auto">
              {searchTerm ? <>
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-blue-500 text-white">
                      <th className="w-1/12 py-2 px-4 border-r text-center">#</th>
                      <th className="w-3/12 py-2 px-4 border-r text-center">Name</th>
                      <th className="w-2/12 py-2 px-4 border-r text-center">Employee ID</th>
                      <th className="w-2/12 py-2 px-4 border-r text-center">Role</th>
                      <th className="w-2/12 py-2 px-4 border-r text-center">Department</th>
                      <th className="w-2/12 py-2 px-4 border-r text-center">Position</th>
                      <th className="w-2/12 py-2 px-4 border-r text-center">Start Date</th>
                      <th className="w-2/12 py-2 px-4 border-r text-center">Status</th>
                      <th className="w-2/12 py-2 px-4 border-r text-center">Leave Credits</th>
                      <th className="w-2/12 py-2 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(filteredUsers) &&
                      filteredUsers.map((element, index) => (
                        <tr key={index} className="text-center">
                          <td className="py-2 px-4 border-r">{element["user-id"]}</td>
                          <td className="py-2 px-4 border-r text-left">
                            {element["first-name"] + " " + element["last-name"]}
                          </td>
                          <td className="py-2 px-4 border-r text-center">{element["employee-id"]}</td>
                          <td className="py-2 px-4 border-r text-center">{element.role}</td>
                          <td className="py-2 px-4 border-r text-center">{element.department}</td>
                          <td className="py-2 px-4 border-r text-center">{element.position}</td>
                          <td className="py-2 px-4 border-r text-center">{element["started-date"]}</td>
                          <td className="py-2 px-4 border-r text-center">{element.status ? element.status : "N/A"}</td>
                          <td className="py-2 px-4 border-r text-center">
                            <button
                              onClick={() => handleManageCredits(element)}
                              className="py-2 px-4 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-700"
                            >
                              Manage Credits
                            </button>
                          </td>
                          <td className="py-2 px-4 flex justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(element)}
                              className="bg-yellow-500 text-white font-bold py-1 px-3 rounded-md hover:bg-yellow-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemove(element["user-id"])}
                              className="bg-red-500 text-white font-bold py-1 px-3 rounded-md hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table></> : <>
                <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="w-1/12 py-2 px-4 border-r text-center">#</th>
                    <th className="w-3/12 py-2 px-4 border-r text-center">Name</th>
                    <th className="w-2/12 py-2 px-4 border-r text-center">Employee ID</th>
                    <th className="w-2/12 py-2 px-4 border-r text-center">Role</th>
                    <th className="w-2/12 py-2 px-4 border-r text-center">Department</th>
                    <th className="w-2/12 py-2 px-4 border-r text-center">Position</th>
                    <th className="w-2/12 py-2 px-4 border-r text-center">Start Date</th>
                    <th className="w-2/12 py-2 px-4 border-r text-center">Status</th>
                    <th className="w-2/12 py-2 px-4 border-r text-center">Leave Credits</th>
                    <th className="w-2/12 py-2 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(employees) &&
                    employees.map((element, index) => (
                      <tr key={index} className="text-center">
                        <td className="py-2 px-4 border-r">{element["user-id"]}</td>
                        <td className="py-2 px-4 border-r text-left">
                          {element["first-name"] + " " + element["last-name"]}
                        </td>
                        <td className="py-2 px-4 border-r text-center">{element["employee-id"]}</td>
                        <td className="py-2 px-4 border-r text-center">{element.role}</td>
                        <td className="py-2 px-4 border-r text-center">{element.department}</td>
                        <td className="py-2 px-4 border-r text-center">{element.position}</td>
                        <td className="py-2 px-4 border-r text-center">{element["started-date"]}</td>
                        <td className="py-2 px-4 border-r text-center">{element.status ? element.status : "N/A"}</td>
                        <td className="py-2 px-4 border-r text-center">
                          <button
                            onClick={() => handleManageCredits(element)}
                            className="py-2 px-4 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-700"
                          >
                            Manage Credits
                          </button>
                        </td>
                        <td className="py-2 px-4 flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(element)}
                            className="bg-yellow-500 text-white font-bold py-1 px-3 rounded-md hover:bg-yellow-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemove(element["user-id"])}
                            className="bg-red-500 text-white font-bold py-1 px-3 rounded-md hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
                </>}
            </div>
          </div>
        </main>
      </div>

      {isLeaveCreditsModalOpen && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg overflow-y-auto max-h-80% ">
            <h2 className="text-2xl font-bold mb-6">Manage Leave Credits</h2>
            <div className="space-y-6">
              <div>
                <select className="border w-full p-2 rounded" onChange={(e) => setUserLeaveId(e.target.value)}>
                  <option value="">Select user leave</option>
                  {Array.isArray(userLeaves) && userLeaves.map((element, index) => (
                    <option key={index} value={element.id}>{element['type-of-leave']['leave-type']}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Current credit</label>
                <input value={userLeaveOldCredit.toString()} disabled type="text" className="border w-full p-2 rounded" />
              </div>
              <div>
                <label>Input a new credit</label>
                <input value={credit} onChange={(e) => setCredit(e.target.value)} type="text" className="border w-full p-2 rounded" />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsLeaveCreditsModalOpen(false)}
                  className="bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveLeaveCreditsHandler}
                  className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg overflow-y-auto max-h-80% ">
            <h2 className="text-2xl font-bold mb-6">Edit Employee</h2>
            <form>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Employee ID</label>
                    <input
                      type="text"
                      value={selectedEmployee["employee-id"]}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, "employee-id": e.target.value })}
                      className="border w-full p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">First Name</label>
                    <input
                      type="text"
                      value={selectedEmployee["first-name"]}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, "first-name": e.target.value })}
                      className="border w-full p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Middle Name</label>
                    <input
                      type="text"
                      value={selectedEmployee["middle-name"]}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, "middle-name": e.target.value })}
                      className="border w-full p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Last Name</label>
                    <input
                      type="text"
                      value={selectedEmployee["last-name"]}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, "last-name": e.target.value })}
                      className="border w-full p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Email Address</label>
                    <input
                      type="email"
                      value={selectedEmployee.username}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, username: e.target.value })}
                      className="border w-full p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Contact Number</label>
                    <input
                      type="text"
                      className="border w-full p-2 rounded"
                      value={contactNumber ? contactNumber : selectedEmployee['contact-number']}
                      onChange={handleContactNumberChange}
                      placeholder="09xxxxxxxxx or +639xxxxxxxxx"
                    />
                    {contactNumberError && <p className="text-red-500 text-sm mt-1">{contactNumberError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Position</label>
                    <select className="border w-full p-2 rounded" onChange={(e) => positionHandler(e.target.value)} value={position}>
                      <option value="">Choose..</option>
                      <option value="ADMINISTRATIVE & HUMAN RESOURCES">ADMINISTRATIVE & HUMAN RESOURCES</option>
                      <option value="GENERAL SERVICES">GENERAL SERVICES</option>
                      <option value="ACCOUNTING, BUDGET & CASH MANAGEMENT">ACCOUNTING, BUDGET & CASH MANAGEMENT</option>
                      <option value="CUSTOMER ACCOUNTS & SERVICES">CUSTOMER ACCOUNTS & SERVICES</option>
                      <option value="PLANNING AND WATER RESOURCES">PLANNING AND WATER RESOURCES</option>
                      <option value="CONSTRUCTION AND MAINTENANCE">CONSTRUCTION AND MAINTENANCE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Assigned Department</label>
                    <select className="border w-full p-2 rounded" onChange={(e) => setDepartmentId(e.target.value)} value={departmentId}>
                      <option>Choose..</option>
                      {Array.isArray(departments) && departments.map((element, index) => (
                        <option key={index} value={element.id}>{element.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Role</label>
                    <select className="border w-full p-2 rounded" onChange={(e) => roleHandler(e.target.value)} value={role}>
                      <option>Choose..</option>
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="HR">HUMAN RESOURCE</option>
                      <option value="DEPARTMENT_HEAD">DEPARTMENT HEAD</option>
                      <option value="SUPERVISOR">SUPERVISOR</option>
                      <option value="GENERAL_MANAGER">GENERAL MANAGER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Gender</label>
                    <select className="border w-full p-2 rounded" onChange={(e) => genderHandler(e.target.value)} value={gender}>
                      <option>Choose..</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={updateEmployeeHandler}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default EmployeeSection;
