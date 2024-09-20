import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../Components/Sidebar';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate, useParams } from 'react-router-dom';

import axios from "../../services/AxiosConfiguration"

import Loading from '../../Components/LoadingAnimation/Loading';

function LeaveDetails() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [description, setDescription] = useState('');
  const [disapprovalReasonB, setDisapprovalReasonB] = useState('');
  const [disapprovalReasonD, setDisapprovalReasonD] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [daysWithPay, setDaysWithPay] = useState(0);
  const [daysWithoutPay, setDaysWithoutPay] = useState(0);
  const [others, setOthers] = useState("");
  const sigCanvasHR = useRef({});
  const sigCanvasSupervisor = useRef({});
  const sigCanvasManager = useRef({});
  const sigCanvasGM = useRef({});

  const [leave, setLeave] = useState();
  const [actions, setActions] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [isError, setIsError] = useState(false);

  const [typeOfLeaves, setTypeOfLeaves] = useState([]);
  const [userLeaves, setUserLeaves] = useState([]);
  const [fourTypeOfLeaves, setFourTypeOfLeaves] = useState([]);

  const [hrDecision, setHrDecision] = useState("PENDING");
  const [departmentHeadDecision, setDepartmentHeadDecision] = useState("PENDING");
  const [supervisorDecision, setSupervisorDecision] = useState("PENDING");
  const [generalManagerDecision, setGeneralManagerDecision] = useState("PENDING");

  const [lessThisApplication, setLessThisApplication] = useState(0);

  const [user, setUser] = useState({});

  // actions
  const [hrAction, setHrAction] = useState();
  const [supervisorAction, setSupervisorAction] = useState();
  const [departmentHeadAction, setDepartmentHeadAction] = useState();
  const [generalManagerAction, setGeneralManagerAction] = useState();

  const [deduction, setDeduction] = useState(0);
  const [balance, setBalance] = useState(0);

  const [isMounted, setIsMounted] = useState(false);

  const navigate = useNavigate();

  // this signature is for submitting signature
  const [signature, setSignature] = useState("");

  const { id } = useParams();

  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAction('');
    setDescription('');
  };

  const handleAction = () => {
    submitGeneralManagerDecision(sigCanvasGM);
    closeModal();
  };

  const clearSignature = (sigCanvas) => {
    sigCanvas.current.clear()
    setSignature(null);
  };

  const saveSignature = (sigCanvas) => {
    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    setSignature(signatureData);
  };

  const getCanvasWidthForGeneralManager = () => {
    return Math.min(window.innerWidth * 0.8, 650);
  };

  const getCanvasWidth = () => {
    return Math.min(window.innerWidth * 0.8, 780);
  };

  useEffect(() => {
    const getLeaveApplication = async () => {
      setIsLoading(true);
      try {
        const url1 = `/users/leaves/${id}`;
        const response1 = await axios.get(url1);
        setLeave(response1.data);
        setLessThisApplication(response1.data['working-days-applied'])
        setActions(response1.data.actions);
        const userId = response1.data.user['user-id'];

        const url2 = `/users/remaining-leaves/${userId}`;
        const response2 = await axios.get(url2);
        setUserLeaves(response2.data);

        const url3 = "/users/me";
        const response3 = await axios.get(url3);
        setUser(response3.data);
      } catch (error) {
        setError(error);
        setIsError(true);
      }
      setIsLoading(false);
    }
    getLeaveApplication();
  }, [isMounted]);

  useEffect(() => {
    if(leave){
      const userLeaves = leave.user.userLeaveList;
      for(let i = 0; i < userLeaves.length; i++){
        if(leave['type-of-leave-id'] === userLeaves[i]['type-of-leave'].id){
         setBalance(userLeaves[i]['remaining-leave'] - ((lessThisApplication + Number(deduction))));
         break;
        }
      }
    }
  }, [leave, lessThisApplication, deduction]);

  useEffect(() => {
    if (actions.length > 0) {
      actions.forEach(action => {
        switch (action.role) {
          case "HR":
            setHrAction(action);
            setHrDecision(action.decision)
            setLessThisApplication(action['less-this-application'])
            setDeduction(action.deduction)
            break;
          case "SUPERVISOR":
            setSupervisorAction(action);
            setSupervisorDecision(action.decision)
            break;
          case "DEPARTMENT_HEAD":
            setDepartmentHeadAction(action);
            setDepartmentHeadDecision(action.decision)
            break;
          case "GENERAL_MANAGER":
            setGeneralManagerAction(action);
            setGeneralManagerDecision(action.decision)
            break;
          default:
            break;
        }
      });
    }
  }, [actions])

  const commonLeaveToShow = userLeaves.filter(
    leave => leave['type-of-leave']['type-of-restoration'] === "ACCRUED_LEAVE_WITH_ANNUAL_RESET" ||
      leave['type-of-leave']['type-of-restoration'] === "USE_IT_OR_LOSE_IT"
  );



  const submitHrDecision = async (sigCanvas) => {
    try {
      setIsLoading(true);
      const url = "/users/admin/apply-leave/sign";
      if (hrAction) {
        const response = await axios.post(url, {
          "reason-of-rejection": disapprovalReasonB,
          "less-this-application": lessThisApplication,
          "signature-base64": hrAction.signature,
          "leave-request-id": id,
          "decision": hrDecision,
          "deduction-for-under-time": deduction
        });
        if (response.status === 201) {
          alert(response.data);
        }
      } else {
        const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        const response = await axios.post(url, {
          "reason-of-rejection": disapprovalReasonB,
          "less-this-application": lessThisApplication,
          "signature-base64": signature,
          "leave-request-id": id,
          "decision": hrDecision,
          "deduction-for-under-time": deduction
        });
        if (response.status === 201) {
          alert(response.data);
        }
      }
    } catch (error) {
      console.log(error)
      setIsError(true);
      setError(error);
    }
    setIsLoading(false);
    setIsMounted(value => !value);
  }

  const submitDepartmentHeadDecision = async (sigCanvas) => {
    try {
      setIsLoading(true);
      if (departmentHeadAction) {
        const noValue = 0;
        const url = "/users/admin/apply-leave/sign";
        const response = await axios.post(url, {
          "reason-of-rejection": "",
          "less-this-application": noValue,
          "signature-base64": departmentHeadAction.signature,
          "leave-request-id": id,
          "decision": departmentHeadDecision
        });
        if (response.status === 201) {
          alert(response.data);
        }
      } else {
        const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        const noValue = 0;
        const url = "/users/admin/apply-leave/sign";
        const response = await axios.post(url, {
          "reason-of-rejection": "",
          "less-this-application": noValue,
          "signature-base64": signature,
          "leave-request-id": id,
          "decision": departmentHeadDecision
        });
        if (response.status === 201) {
          alert(response.data);
        }
      }
    } catch (error) {
      setIsError(true);
      setError(error);
    }
    setIsLoading(false);
    setIsMounted(value => !value);
  }

  const submitSupervisorDecision = async (sigCanvas) => {
    try {
      setIsLoading(true);
      if (supervisorAction) {
        const noValue = 0;
        const url = "/users/admin/apply-leave/sign";
        const response = await axios.post(url, {
          "reason-of-rejection": "",
          "less-this-application": noValue,
          "signature-base64": supervisorAction.signature,
          "leave-request-id": id,
          "decision": supervisorDecision
        });

        if (response.status === 201) {
          alert(response.data);
        }
      } else {
        const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        const noValue = 0;
        const url = "/users/admin/apply-leave/sign";
        const response = await axios.post(url, {
          "reason-of-rejection": "",
          "less-this-application": noValue,
          "signature-base64": signature,
          "leave-request-id": id,
          "decision": supervisorDecision
        });

        if (response.status === 201) {
          alert(response.data);
        }
      }

      if (response.status === 201) {
        alert(response.data);
      }
    } catch (error) {
      setIsError(true);
      setError(error);

    }
    setIsLoading(false);
    setIsMounted(value => !value);
  }

  const submitGeneralManagerDecision = async (sigCanvas) => {
    try {
      setIsLoading(true);
      const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      const noValue = 0;
      const url = "/users/admin/apply-leave/sign";
      const response = await axios.post(url, {
        "reason-of-rejection": disapprovalReasonD,
        "less-this-application": noValue,
        "signature-base64": signature,
        "leave-request-id": id,
        "decision": generalManagerDecision
      });
      if (response.status === 201) {
        const responseForFinalDecision = await axios.post(`/users/admin/leave/${id}/decide`,
          {
            "days-with-pay": daysWithPay,
            "days-without-pay": daysWithoutPay,
            others,
            "disapproved-due-to": disapprovalReasonD
          });
        console.log(responseForFinalDecision);
      }
    } catch (error) {
      isError(true);
      setError(error);
    }
    setIsLoading(false);
    setIsMounted(value => !value);
  }

  if (isLoading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  if (isError) {
    const status = error.status;

    if (status === 403) {
      alert(error.response.data.message)
    } else if (status === 400) {
      alert(error.response.data.message)
    } else if (status === 401) {
      alert("Session expired");
      navigate("/login-admin");
    } else if (error.code === "ERR_NETWORK") {
      alert("Network Error");
    } if (status === 404) {
      navigate("/admin/pending-leave-type");
      return;
    }
    setIsError(value => !value);
  }

  return (
    <>
      <Helmet>
        <title>Leave Details {signature ? signature : ""}</title>
      </Helmet>

      <div className="flex h-screen bg-pageBg1">
        <Sidebar />

        {/* Main Content */}
        <main className="w-4/5 p-10">
          <h1 className="text-3xl font-bold mb-8">Leave Details</h1>

          <div className="bg-white p-8 shadow-lg rounded-md">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Employee ID: <span className="font-normal">{leave ? leave.user['employee-id'] : ""}</span></h2>
              <h2 className="text-xl font-semibold mb-2">Employee Name: <span className="font-normal text-blue-500 cursor-pointer">{leave ? leave.user['first-name'] + " " + leave.user['last-name'] : ""}</span></h2>
              <h2 className="text-xl font-semibold mb-2">Gender: <span className="font-normal">{leave ? leave.user.gender : ""}</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold">Employee Email:</h2>
                <p>{leave ? leave.user.username : ""}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Employee Contact:</h2>
                <p>{leave ? leave.user['contact-number'] : ""}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Leave Type:</h2>
                <p>{leave ? leave['type-of-leave'] : ""}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Leave From:</h2>
                <p>{leave ? leave['start-at'] : ""}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Leave Upto:</h2>
                <p>{leave ? leave['end-at'] : ""}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Leave Applied:</h2>
                <p>{leave ? leave['date-of-filing'] : ""}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Status:</h2>
                {leave ? <p className={leave['leave-status'] === 'PENDING' ? 'text-yellow-500' : leave['leave-status'] === 'APPROVED' ? 'text-green-500' : 'text-red-500'}>{leave['leave-status']}</p> : <p></p>}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold">Admin Remark:</h2>
              {leave ? <p className={leave['leave-status'] === 'PENDING' ? 'text-yellow-500' : leave['leave-status'] === 'APPROVED' ? 'text-green-500' : 'text-red-500'}>{leave['leave-status']}</p> : <p></p>}
            </div>


            <div className={`flex justify-end ${user.role !== "GENERAL_MANAGER" ? "hidden" : ""}`}>
              <button
                onClick={openModal}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Set Action
              </button>
            </div>
          </div>

          {/* Details of Action UI */}
          <div className={`${leave && (leave['leave-status'] === "DECLINED" || leave['leave-status'] === "APPROVED") ? 'hidden' : ''} mt-12 bg-white p-8 shadow-lg rounded-md`}>
            <h1 className="text-3xl font-bold mb-8">Details of Action</h1>
            {/* Certification of Leave Credits */}
            <div className="mb-8 p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">A. CERTIFICATION OF LEAVE CREDITS</h3>
              <div className="mb-4">
                <p className="mb-2 font-bold">
                  As of {currentDateTime.toLocaleDateString()} {currentDateTime.toLocaleTimeString()}
                </p>

                <table className="w-full border border-gray-300">
                  <thead className='w-full'>
                    <tr className="bg-gray-200 w-full">
                      <th className="border border-gray-300 px-4 py-2 text-center"> </th>
                      {Array.isArray(commonLeaveToShow) && commonLeaveToShow.map((element, index) => (
                        <th key={index} className="border border-gray-300 px-4 py-2 text-center">
                          {element['type-of-leave']['leave-type']}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Total Earned</td>
                      {Array.isArray(commonLeaveToShow) && commonLeaveToShow.map((element, index) => (
                        <td key={index} className="border border-gray-300 px-4 text-center py-2">
                          {element['remaining-leave']}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Less this application</td>
                      <td colSpan="4" className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          disabled={user.role !== "HR"}
                          value={lessThisApplication}
                          onChange={(e) => setLessThisApplication(e.target.value)}
                          className="border text-center p-1 rounded w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Balance</td>
                      {Array.isArray(commonLeaveToShow) && commonLeaveToShow.map((element, index) => (
                        <td key={index} className="border border-gray-300 px-4 text-center py-2">
                          {leave['type-of-leave-id'] === element['type-of-leave'].id ? (element['remaining-leave'] - lessThisApplication < 0 ? 0 : element['remaining-leave'] - lessThisApplication) : element['remaining-leave']}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className='p-6 space-x-4'>
                <label >Deduction</label>
                <input
                  value={deduction}
                  onChange={(e) => setDeduction(e.target.value)}
                  className='h-8 border rounded p-2' type="text"
                  disabled={user.role !== "HR"}
                />
                {balance < 0 ? <h1 className='text-red-700'>* Insufficient credit</h1> : ""}
              </div>


              {/* HR Officer Signature */}
              <div className="mb-8 p-6 border rounded-lg">
                <div className="flex items-center justify-between">
                  {/* Flexbox for Signature Label and Dropdown */}
                  <div className="flex items-center space-x-4">
                    {/* Label for signature */}
                    <label className="text-lg font-semibold">
                      Signature (HR Offier):
                    </label>

                    {/* Dropdown for Supervisor Decision */}
                    <div className="flex items-center ">
                      <label className="mr-2 font-bold">Status:</label>
                      <select
                        value={hrDecision}
                        disabled={user.role !== "HR" || balance < 0}
                        onChange={(e) => setHrDecision(e.target.value)}
                        className="border rounded p-2 mb-1"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="DECLINED">Declined</option>
                      </select>
                    </div>
                  </div>

                  {/* Label for status with color */}
                  {hrAction ? <div>
                    {hrAction.decision === "PENDING" && (
                      <span className="text-yellow-500 font-semibold">
                        Pending
                      </span>
                    )}
                    {hrAction.decision === "APPROVED" && (
                      <span className="text-green-500 font-semibold">
                        Approved
                      </span>
                    )}
                    {hrAction.decision === "DECLINED" && (
                      <span className="text-red-500 font-semibold">
                        Declined
                      </span>
                    )}
                  </div> : <div>
                    {hrDecision === "PENDING" && (
                      <span className="text-yellow-500 font-semibold">
                        Pending
                      </span>
                    )}
                    {hrDecision === "APPROVED" && (
                      <span className="text-green-500 font-semibold">
                        Approved
                      </span>
                    )}
                    {hrDecision === "DECLINED" && (
                      <span className="text-red-500 font-semibold">
                        Declined
                      </span>
                    )}
                  </div>}
                </div>

                {hrAction ? <img src={hrAction.signature} /> : <SignatureCanvas
                  ref={sigCanvasHR}
                  penColor="black"
                  canvasProps={{
                    width: getCanvasWidth(),
                    height: 200,
                    className: "border w-full p-2 rounded",
                  }}
                />}
                <div className="mt-2 flex space-x-4">
                  <button
                    type="button"
                    onClick={() => clearSignature(sigCanvasHR)}
                    className="bg-gray-500 text-white font-bold py-2 px-4 rounded"
                    disabled={user.role !== "HR"}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => submitHrDecision(sigCanvasHR)}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                    disabled={user.role !== "HR"}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="mb-8 p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">B. RECOMMENDATION</h3>
              <div className="mb-4">
                <p>For approval</p>
                <p>For disapproval due to:</p>
                <textarea
                  value={disapprovalReasonB}
                  disabled={user.role !== "HR"}
                  onChange={(e) => setDisapprovalReasonB(e.target.value)}
                  className="border rounded w-full p-2 mt-2"
                  placeholder="Add reason for disapproval here..."
                  rows={3}
                />
              </div>

              {/* Supervisor Signature */}
              <div className="mb-8 p-6 border rounded-lg">
                <div className="flex items-center justify-between">
                  {/* Flexbox for Signature Label and Dropdown */}
                  <div className="flex items-center space-x-4">
                    {/* Label for signature */}
                    <label className="text-lg font-semibold">
                      Signature (Immediate Supervisor):
                    </label>

                    {/* Dropdown for Supervisor Decision */}
                    <>
                      <div className="flex items-center ">
                        <label className="mr-2 font-bold">Status:</label>
                        <select
                          disabled={user.role !== "SUPERVISOR"}
                          value={supervisorDecision}
                          onChange={(e) => setSupervisorDecision(e.target.value)}
                          className="border rounded p-2 mb-1"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="DECLINED">Declined</option>
                        </select>
                      </div>
                    </>
                  </div>

                  {/* Label for status with color */}
                  {supervisorAction ? <>
                    <div>
                      {supervisorAction.decision === "PENDING" && (
                        <span className="text-yellow-500 font-semibold">
                          Pending
                        </span>
                      )}
                      {supervisorAction.decision === "APPROVED" && (
                        <span className="text-green-500 font-semibold">
                          Approved
                        </span>
                      )}
                      {supervisorAction.decision === "DECLINED" && (
                        <span className="text-red-500 font-semibold">
                          Declined
                        </span>
                      )}
                    </div>
                  </> : <>
                    <div>
                      {supervisorDecision === "PENDING" && (
                        <span className="text-yellow-500 font-semibold">
                          Pending
                        </span>
                      )}
                      {supervisorDecision === "APPROVED" && (
                        <span className="text-green-500 font-semibold">
                          Approved
                        </span>
                      )}
                      {supervisorDecision === "DECLINED" && (
                        <span className="text-red-500 font-semibold">
                          Declined
                        </span>
                      )}
                    </div>
                  </>}

                </div>

                {supervisorAction ? <>
                  <img src={supervisorAction.signature} alt="" />
                </> : <>
                  <SignatureCanvas
                    ref={sigCanvasSupervisor}
                    penColor="black"
                    canvasProps={{
                      width: getCanvasWidth(),
                      height: 200,
                      className: "border w-full p-2 rounded",
                    }}
                  />
                </>}

                <div className="mt-2 flex space-x-4">
                  <button
                    type="button"
                    onClick={() => clearSignature(sigCanvasSupervisor)}
                    className="bg-gray-500 text-white font-bold py-2 px-4 rounded"
                    disabled={user.role !== "SUPERVISOR"}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => submitSupervisorDecision(sigCanvasSupervisor)}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                    disabled={user.role !== "SUPERVISOR"}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Div. / Dept. Manager */}
              <div className="mb-8 p-6 border rounded-lg">
                <div className="flex items-center justify-between">
                  {/* Flexbox for Signature Label and Dropdown */}
                  <div className="flex items-center space-x-4">
                    {/* Label for signature */}
                    <label className="text-lg font-semibold">
                      Signature (Div. / Dept. Manager):
                    </label>

                    <div className="flex items-center ">
                      <label className="mr-2 font-bold">Status:</label>
                      <select
                        disabled={user.role !== "DEPARTMENT_HEAD"}
                        value={departmentHeadDecision}
                        onChange={(e) => setDepartmentHeadDecision(e.target.value)}
                        className="border rounded p-2 mb-1"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="DECLINED">Declined</option>
                      </select>
                    </div>
                  </div>

                  {/* Label for status with color */}
                  {departmentHeadAction ? <>
                    <div>
                      {departmentHeadAction.decision === "PENDING" && (
                        <span className="text-yellow-500 font-semibold">
                          Pending
                        </span>
                      )}
                      {departmentHeadAction.decision === "APPROVED" && (
                        <span className="text-green-500 font-semibold">
                          Approved
                        </span>
                      )}
                      {departmentHeadAction.decision === "DECLINED" && (
                        <span className="text-red-500 font-semibold">
                          Declined
                        </span>
                      )}
                    </div></> : <>
                    <div>
                      {departmentHeadDecision === "PENDING" && (
                        <span className="text-yellow-500 font-semibold">
                          Pending
                        </span>
                      )}
                      {departmentHeadDecision === "APPROVED" && (
                        <span className="text-green-500 font-semibold">
                          Approved
                        </span>
                      )}
                      {departmentHeadDecision === "DECLINED" && (
                        <span className="text-red-500 font-semibold">
                          Declined
                        </span>
                      )}
                    </div></>}
                </div>

                {departmentHeadAction ? <>
                  <img src={departmentHeadAction.signature} alt="" />
                </> : <>
                  <SignatureCanvas
                    ref={sigCanvasManager}
                    penColor="black"
                    canvasProps={{
                      width: getCanvasWidth(),
                      height: 200,
                      className: "border w-full p-2 rounded",
                    }}
                  /></>}
                <div className="mt-2 flex space-x-4">
                  <button
                    type="button"
                    onClick={() => clearSignature(sigCanvasManager)}
                    className="bg-gray-500 text-white font-bold py-2 px-4 rounded-md"
                    disabled={user.role !== "DEPARTMENT_HEAD"}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => submitDepartmentHeadDecision(sigCanvasManager)}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md"
                    disabled={user.role !== "DEPARTMENT_HEAD"}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Approval/Disapproval */}
            <div className="mb-8 p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">C. APPROVED FOR:</h3>
              <div className="pl-4">
                <div className="flex items-center mb-2">
                  <label htmlFor="daysWithPay" className="mr-4 w-40">
                    Days with pay:
                  </label>
                  <input
                    type="number"
                    id="daysWithPay"
                    value={daysWithPay}
                    onChange={(e) => setDaysWithPay(e.target.value)}
                    className="border p-1 rounded w-24"
                    disabled={user.role !== "GENERAL_MANAGER"}
                  />
                </div>
                <div className="flex items-center mb-2">
                  <label htmlFor="daysWithoutPay" className="mr-4 w-40">
                    Days without pay:
                  </label>
                  <input
                    type="number"
                    id="daysWithoutPay"
                    value={daysWithoutPay}
                    disabled={user.role !== "GENERAL_MANAGER"}
                    onChange={(e) => setDaysWithoutPay(e.target.value)}
                    className="border p-1 rounded w-24"
                  />
                </div>
                <div className="flex items-center mb-2">
                  <label htmlFor="others" className="mr-4 w-40">
                    Others (Specify):
                  </label>
                  <input
                    type="text"
                    id="others"
                    value={others}
                    disabled={user.role !== "GENERAL_MANAGER"}
                    onChange={(e) => setOthers(e.target.value)}
                    className="border p-1 rounded w-24"
                  />
                </div>
              </div>
            </div>

            {/* Final Approval/Disapproval */}

            <div className="mb-8 p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                D. DISAPPROVED DUE TO:
              </h3>
              <textarea
                value={disapprovalReasonD}
                disabled={user.role !== "GENERAL_MANAGER"}
                onChange={(e) => setDisapprovalReasonD(e.target.value)}
                className="border rounded w-full p-2"
                placeholder="Add reason for disapproval here..."
                rows={3}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modal for setting action */}
      {
        isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Set Action</h2>
              <select
                className="w-full p-2 border rounded mb-4"
                value={generalManagerDecision}
                onChange={(e) => setGeneralManagerDecision(e.target.value)}
              >
                <option value="">Select Action</option>
                <option value="APPROVED">Approve</option>
                <option value="DECLINED">Declined</option>
              </select>
              {/* General Manager*/}
              <div className="mb-8 p-6 border rounded-lg">
                <div className="flex items-center justify-between">
                  {/* Flexbox for Signature Label and Dropdown */}
                  <div className="flex items-center space-x-4">
                    {/* Label for signature */}
                    <label className="text-lg font-semibold">
                      Signature (General Manager):
                    </label>
                  </div>
                </div>

                <SignatureCanvas
                  ref={sigCanvasGM}
                  penColor="black"
                  canvasProps={{
                    width: getCanvasWidthForGeneralManager(),
                    height: 250,
                    className: "border w-full p-2 rounded",
                  }}
                />
                <div className="mt-2 flex space-x-4">
                  <button
                    type="button"
                    onClick={() => clearSignature(sigCanvasGM)}
                    className="bg-gray-500 text-white font-bold py-2 px-4 rounded"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button onClick={closeModal} className="bg-gray-500 text-white py-2 px-4 rounded">
                  Cancel
                </button>
                <button onClick={handleAction} className="bg-blue-500 text-white py-2 px-4 rounded">
                  Submit
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}

export default LeaveDetails;
