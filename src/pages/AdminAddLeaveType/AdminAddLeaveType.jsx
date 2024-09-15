import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../Components/Sidebar';

import axios from "../../services/AxiosConfiguration"
import { useNavigate } from 'react-router-dom';

import Loading from "../../Components/LoadingAnimation/Loading";

function AddNewLeaveType() {
  const [leaveType, setLeaveType] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [leaveCreditAvailable, setLeaveCreditAvailable] = useState(0);
  const [restorationPeriod, setRestorationPeriod] = useState("");
  const [purpose, setPurpose] = useState("");

  const [listOfDetails, setListOfDetails] = useState([]);
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(0);

  const [isChecked, setIsChecked] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [typeOfLeaves, setTypeOfLeaves] = useState({});
  const [typeOfLeaveId, setTypeOfLeaveId] = useState(0);

  const navigate = useNavigate();

  const leaveTypeHandler = (event) => {
    setLeaveType(event.target.value);
  }
  const descriptionHandler = (event) => {
    setDescription(event.target.value);
  }
  const requirementsHandler = (event) => {
    setRequirements(event.target.value);
  }
  const leaveCreditAvailableHandler = (event) => {
    setLeaveCreditAvailable(event.target.value);
  }
  const restorationHandler = (event) => {
    setRestorationPeriod(event.target.value);
  }
  const purposeHandler = (event) => {
    setPurpose(event.target.value);
  }
  const detailsOfLeaveHandler = (value) => {
    setListOfDetails(prevDetail => [...prevDetail, value])
    setDetails("");
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const url = "/users/categories";
        const response = await axios.get(url);
        setCategories(response.data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const url = "/users/admin/type-of-leaves";
        const response = await axios.get(url);
        setTypeOfLeaves(response.data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setCategory("");
    setListOfDetails([]);
  }, [isChecked]);

  const submitHandler = async () => {
    try {
      const url = "/users/admin/type-of-leaves/add-type-of-leave";
      const response = await axios.post(url, {
        "leave-type": leaveType,
        description,
        requirements,
        "type-of-restoration": purpose,
        "default-duration": leaveCreditAvailable,
        "restoration-period": restorationPeriod,
        'type-of-leave-producer-id': typeOfLeaveId,
        category,
        "category-id": categoryId,
        "details-of-category": listOfDetails
      });

      if (response.status === 201) {
        navigate("/admin/leave-type");
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return (
      <>
        <Loading />
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Add New Leave Type</title>
      </Helmet>

      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar />

        {/* Main Content */}
        <main className="w-full lg:w-3/4 p-10 bg-gray-100">
          <h1 className="text-3xl font-bold mb-8">Leave Types Section</h1>

          <div className="bg-white p-8 shadow-lg rounded-md">
            <h2 className="text-2xl font-bold mb-6">Add New Leave Type</h2>
            <p className="mb-6">Please fill out the form below to add a new leave type.</p>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Leave Type</label>
                <input onChange={(event) => leaveTypeHandler(event)} type="text" className="border w-full p-2 rounded" placeholder="Enter leave type (e.g., Vacation Leave)" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <input onChange={(event) => descriptionHandler(event)} type="text" className="border w-full p-2 rounded" placeholder="Enter description (e.g., Rule XVI, Omnibus Rules...)" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Requirements</label>
                <input onChange={(event) => requirementsHandler(event)} type="text" className="border w-full p-2 rounded" placeholder="Enter requirements (e.g., Medical Certificate)" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Leave Credit Available</label>
                <input onChange={(event) => leaveCreditAvailableHandler(event)} type="text" className="border w-full p-2 rounded" placeholder="Available Leave Credits (e.g, 5 Sick Leave)" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Restoration Period</label>
                <select className="border w-full p-2 rounded" onChange={(event) => restorationHandler(event)}>
                  <option>Choose..</option>
                  <option value="1">Every Month</option>
                  <option value="2">Every 2 Months</option>
                  <option value="3">Every 3 Months</option>
                  <option value="4">Every 4 Months</option>
                  <option value="5">Every 5 Months</option>
                  <option value="6">Every 6 Months</option>
                  <option value="7">Every 7 Months</option>
                  <option value="8">Every 8 Months</option>
                  <option value="9">Every 9 Months</option>
                  <option value="10">Every 10 Months</option>
                  <option value="11">Every 11 Months</option>
                  <option value="12">Every 12 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Credit producer</label>
                <select className="border w-full p-2 rounded" onChange={(event) => setTypeOfLeaveId(event.target.value)}>
                  <option>Choose..</option>
                  {Array.isArray(typeOfLeaves) && typeOfLeaves.map((element, index) => (
                    <option key={index} value={element.id}>{element['leave-type']}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Purpose:</label>
                <select className="border w-full p-2 rounded" onChange={(event) => purposeHandler(event)}>
                  <option>Choose..</option>
                  <option value="ACCRUED_LEAVE_WITH_ANNUAL_RESET">Adding and Yearly restoration</option>
                  <option value="USE_IT_OR_LOSE_IT">No Adding and Yearly restoration</option>
                  <option value="CARRYOVER_LEAVE_WITH_LAST_RESTORATION">For Restoration</option>
                </select>
              </div>

              <div className='border p-4 space-y-4'>
                <label className="block text-sm font-bold mb-2">Details of Leave:</label>
                <div className='space-y-4'>
                  <select className='w-full p-2 border' disabled={isChecked} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Choose category</option>
                    {Array.isArray(categories) && categories.map((element, index) => (
                      <option key={index} value={element.id}>{element.category}</option>
                    ))}
                  </select>
                  <div className='flex justify-start gap-2 items-center'>
                    <input type="checkbox" onChange={() => setIsChecked(value => !value)} />
                    <h1>Create new</h1>
                  </div>
                  <input disabled={!isChecked} className='w-full h-9 border p-2' placeholder='Category' type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <div className='space-y-2'>
                  <input className='w-full h-9 border p-2' placeholder='specific details' type="text" value={details} onChange={(e) => setDetails(e.target.value)} />
                  <button onClick={() => detailsOfLeaveHandler(details)} className='w-20 h-7 rounded bg-yellow-500 text-white font-bold' type='button'>add</button>
                </div>
                <div className='border p-4'>
                  {Array.isArray(listOfDetails) && listOfDetails.map((element, index) => (
                    <h1 key={index}>{element}</h1>
                  ))}
                </div>
              </div>

              <button type='button' onClick={submitHandler} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full mt-6">
                Submit
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default AddNewLeaveType;
