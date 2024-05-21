import React, { useState, useEffect } from 'react'
import './Activity.css'
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import axiosInstance from '../../utils/axios';
import MoonLoader from "react-spinners/ClipLoader";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { BsArrowRightCircle } from "react-icons/bs";
import { TbUserCircle } from "react-icons/tb";
import toast, { Toaster } from 'react-hot-toast';
import * as ExcelJS from 'exceljs';
import { Select, Empty } from 'antd';

import { useImage } from "../../context/imgContext/imageContext"


const Activity = () => {
    const { Option } = Select;
    const [getStartDate, setGetStartDate] = useState("");
    const [getEndDate, setGetEndDate] = useState("");
    const [loadingData, setLoadingData] = useState(false);
    const [getAttendHistory, setGetAttendHistory] = useState([])
    const [userDetails, setUserDetails] = useState({})
    const [getAllUsersActivities, setGetAllUsersActivities] = useState([])
    const [getAllUsersDetails, setGetAllUsersDetails] = useState({})

    const [userType, setUserType] = useState("All Users")
    const [userDropdownList, setUserDropdownList] = useState([])
    const { serverUrl } = useImage();

    // -------------------------GET ALL USERS FOR DROPDOWN LIST-----------------------------
    const allUsersList = () => {
        axiosInstance
            .post("/all-employee")
            .then((response) => {
                // console.log(response.data.users)
                setUserDropdownList(response.data.users)
            })
            .catch((err) => {
                toast.error(err?.message)
            });
    }

    useEffect(() => {
        allUsersList()
    }, [])

    // --------------------------get attendance activity history-------------------------
    const getAttendanceActivity = async () => {
        if (userType === "All Users") {
            if (getStartDate === "") {
                toast.error("Select start date.", {
                    duration: 3000,
                    position: 'bottom-center',
                    className: "facultyToast"
                });
            } else if (getEndDate === "") {
                toast.error("Select end date.", {
                    duration: 3000,
                    position: 'bottom-center',
                    className: "facultyToast"
                });
            } else if (getStartDate > getEndDate) {
                toast.error("Select Valid Date.", {
                    duration: 3000,
                    position: 'bottom-center',
                    className: "facultyToast"
                });
            } else {
                const req = {
                    start_date: getStartDate,
                    end_date: getEndDate
                };
                try {
                    const all_activity_data = await axiosInstance.post('/activity-on-date', req);
                    // all_activity_data.data.date_wise_data.map((data, index) => (
                    //     data[0].map((next_data_1, index_1) => (
                    //         next_data_1.map((next_data_2, index_2) => (
                    //             console.log(next_data_2.activity)
                    //         ))
                    //     ))
                    // ))
                    if (all_activity_data.data.res_data.status == 200) {
                        // console.log(all_activity_data.data.date_wise_data[0][0][0][0].date);
                        // console.log(all_activity_data.data.date_wise_data[0][1].first_name);
                        setGetAllUsersActivities(all_activity_data.data.date_wise_data);
                    } else {
                        setGetAllUsersActivities([])
                        setLoadingData(false);
                        toast.error(all_activity_data.data.res_data.message);
                    }
                } catch (err) {
                    setLoadingData(false);
                    toast.error(err?.message)
                }
                // setLoadingData(true);
                // axiosInstance
                //     .post("/activity-on-date", req)
                //     .then((response) => {
                //         console.log(response)
                //         setTimeout(() => {
                //             setGetAllUsersActivities(response.data)
                //             // setData_1(response.data[0])
                //             // setLoadingData(false);
                //         }, 500);
                //     })
                //     .catch((err) => {
                //         setLoadingData(false);
                //         toast.error(err?.message)
                //     });
            }
        } else {
            // -----------------------------single user activity history api call---------------------
            if (getStartDate === "") {
                toast.error("Select start date.", {
                    duration: 3000,
                    position: 'bottom-center',
                    className: "facultyToast"
                });
            } else if (getEndDate === "") {
                toast.error("Select end date.", {
                    duration: 3000,
                    position: 'bottom-center',
                    className: "facultyToast"
                });
            } else if (getStartDate > getEndDate) {
                toast.error("Select Valid Date.", {
                    duration: 3000,
                    position: 'bottom-center',
                    className: "facultyToast"
                });
            } else {
                const req = {
                    user_id: userType,
                    start_date: getStartDate,
                    end_date: getEndDate
                };
                try {
                    setLoadingData(true);
                    const activity_by_user = await axiosInstance.post('/activity-by-user', req);
                    if (activity_by_user.data.res_data.status == 200) {
                        setUserDetails(activity_by_user.data?.employee_data);
                        setGetAttendHistory(activity_by_user.data?.date_wise_data)
                    } else {
                        toast.error(activity_by_user.data.res_data.message)
                        setGetAttendHistory([])
                    }
                    setLoadingData(false);
                } catch (err) {
                    setLoadingData(false);
                    toast.error(err?.message)
                }
                // setLoadingData(true);
                // axiosInstance
                //     .post("/activity-by-user", req)
                //     .then((response) => {
                //         console.log("data return from backnd", response)
                //         setTimeout(() => {
                //             setGetAttendHistory(response.data?.date_wise_data)
                //             setUserDetails(response.data?.employee_data)
                //             // setData_1(response.data[0])
                //             setLoadingData(false);
                //         }, 500);
                //     })
                //     .catch((err) => {
                //         setLoadingData(false);
                //         toast.error(err?.message)
                //     });
            }

        }

    }
    // ----------------------------------generate excelsheet fun-------------------------
    const generateExcel = async () => {
        if (getStartDate === "" && getEndDate === "") {
            toast.error("No Data In Table.")
        } else if (getAttendHistory.length === 0) {
            toast.error("No Data In Table.");
        }
        else {
            const req = {
                start_date: getStartDate,
                end_date: getEndDate
            };
            try {
                // Fetch data from the API
                const response = await axiosInstance.post('/activity-on-date', req);
                const jsonData = response.data;
                // Create a new workbook
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sheet 1');
                // Set headers
                const headers = ['Emp ID', 'First Name', 'Last Name', 'Designation', 'Date', 'Activity'];
                const headerRow = worksheet.getRow(1);
                worksheet.getRow(1).values = headers;
                headerRow.font = { bold: true };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '2db83d' }, // Yellow background color
                };

                // Set data rows
                jsonData.forEach((activityData, index) => {
                    const rowIndex = index + 2;
                    const { date, activity, user } = activityData;
                    const { first_name, last_name, emp_id, designation } = user;
                    const values = [emp_id, first_name, last_name, designation, date, activity];
                    const dataRow = worksheet.getRow(rowIndex).values = values;
                    dataRow.alignment = { vertical: 'middle', horizontal: 'center' }; // Center alignment
                });


                // Set column widths
                worksheet.columns.forEach((column) => {
                    column.width = 27; // Set column width to 15
                });

                // Set row heights
                worksheet.eachRow((row) => {
                    row.height = 20; // Set row height to 20
                });

                // Generate the Excel file
                const buffer = await workbook.xlsx.writeBuffer();

                // Create a Blob from the buffer
                const blob = new Blob([buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });

                // Create a download link and click it
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'activity.xlsx';
                link.click();

                // Cleanup
                URL.revokeObjectURL(url);
                // setGetAttendHistory([])

            } catch (error) {
                console.error('Error generating Excel file:', error);
            }
        }
    };

    // -------------------------------------------------------------------------------------

    return (
        <div className='admin-emp-list-container'>
            <div className='admin-emp-list-container-top-div'>
                <Navbar />
            </div>
            <div className='admin-emp-list-container-bottom-div'>
                <div className='admin-emp-list-div-left'>
                    <Sidebar />
                </div>

                {/* ------------------------------------------------------ */}
                <div className='admin-emp-list-div-right'>
                    <div className='admin-home-detail-container'>
                        <div className='dash_report_container'>
                            <div className='report_search_container'>
                                <div className='report_dropdown_div'>
                                    <Select defaultValue={userType} value={userType} onChange={(e) => setUserType(e)} style={{ display: 'block', textTransform: 'capitalize' }}>
                                        <Option value="All Users">All Users</Option>
                                        <Option
                                            value="disabled" disabled>Single User</Option>
                                        {
                                            userDropdownList.length > 0 && userDropdownList.map((val, index) => (
                                                <Option value={val?.id} key={index} style={{ textTransform: 'capitalize' }}>{val?.first_name} {val?.last_name}</Option>
                                            ))
                                        }
                                    </Select>
                                </div>
                                {/* ----------------------------------------- */}
                                <div className='report-search-main-div'>
                                    {
                                        userType === "All Users" ?
                                            <>
                                                <p className='to_class'>from</p>
                                                <div className='report_search_box'>
                                                    <input type="date" onChange={(e) => setGetStartDate(e.target.value)} />
                                                </div>
                                                <p className='to_class'>to</p>
                                                <div className='report_search_box'>
                                                    <input type="Date" onChange={(e) => setGetEndDate(e.target.value)} />
                                                </div>
                                                <div className='go_btn_div'>
                                                    <button className='go_btn' onClick={getAttendanceActivity}><BsArrowRightCircle /></button>
                                                </div>
                                            </> : <>
                                                <p className='to_class'>from</p>
                                                <div className='report_search_box'>
                                                    <input type="date" onChange={(e) => setGetStartDate(e.target.value)} />
                                                </div>
                                                <p className='to_class'>to</p>
                                                <div className='report_search_box'>
                                                    <input type="Date" onChange={(e) => setGetEndDate(e.target.value)} />
                                                </div>
                                                <div className='go_btn_div'>
                                                    <button className='go_btn' onClick={getAttendanceActivity}><BsArrowRightCircle /></button>
                                                </div>
                                            </>
                                    }
                                </div>
                                {/* ------------------------------------------ */}

                                <div className='report_add_div'>
                                    <button onClick={generateExcel}><span className='dash_download_icon'><FaCloudDownloadAlt /></span>Download</button>
                                </div>
                            </div>
                            {/* ------------------------------------------------------------- */}

                            {/* ----------------------custom table------------------------ */}
                            <div className='dashboard_activity_report_page_container'>
                                <div className='activity-report-list-head'>
                                    <span>Name</span>
                                    <span>Designation</span>
                                    <span>Date</span>
                                    <span>Activities</span>

                                </div>
                                <div className='activity-report-list-body'>
                                    {
                                        // =============All Users table Data================
                                        userType === "All Users" ?
                                            loadingData === true ?
                                                <div className='holiday_loader_loading'>
                                                    <MoonLoader
                                                        color='blue'
                                                        size={70}
                                                        aria-label="Loading Spinner"
                                                        data-testid="loader"
                                                    />
                                                </div> :
                                                getAllUsersActivities.length > 0
                                                    ?
                                                    getAllUsersActivities.map((data, index) => (
                                                        data[0].map((next_data_1, index_1) => (
                                                            <div key={index_1} className='activity-report-list-data'>
                                                                <span>{data[1]?.first_name}</span>
                                                                <span>{data[1]?.designation}</span>
                                                                <span>{next_data_1[0]?.date}</span>
                                                                <div className='flex-div main-activity-div'>
                                                                    {
                                                                        next_data_1.map((next_data_2, index_2) => (
                                                                            <p key={index_2}><span>{index_2 + 1}</span><span>{next_data_2?.activity}</span></p>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        ))
                                                    ))
                                                    :
                                                    <span className='attend_report_empty_component'>
                                                        <Empty />
                                                    </span>


                                            // getAllUsersActivities.length > 0 ? getAllUsersActivities.map((data, index) => (
                                            //     <div key={index} className='activity-report-list-data'>
                                            //         {
                                            //             data?.map((val, index) => (
                                            //                 <>
                                            //                     <span>{`${val?.first_name}  ${val?.last_name}`}</span>
                                            //                     <span>{val?.designation}</span>
                                            //                     <span>
                                            //                         {
                                            //                             val[0]?.map((val) => {
                                            //                                 <>
                                            //                                     <span>{val?.date}</span>
                                            //                                 </>
                                            //                             })
                                            //                         }
                                            //                     </span>
                                            //                 </>
                                            //             ))
                                            //         }

                                            //         {/* <span style={{ borderRight: '1px solid lightgray' }}>
                                            //             {
                                            //                 data?.map((val, index) => (
                                            //                     index === 0 && <span key={index}>{val?.date}</span>
                                            //                 ))
                                            //             }
                                            //         </span>
                                            //         <span>
                                            //             {
                                            //                 data?.map((val, index) => (
                                            //                     <span key={index} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', borderRight: '1px solid lightgray', padding: '10px' }}>
                                            //                         <span style={{ flex: 1 }}>{val?.activity}</span>
                                            //                     </span>

                                            //                 ))
                                            //             }
                                            //         </span> */}

                                            //     </div>
                                            // )) :
                                            // <span className='attend_report_empty_component'>
                                            //     <Empty />
                                            // </span>

                                            // =============Single User table Data================
                                            : loadingData === true ?
                                                <div className='holiday_loader_loading'>
                                                    <MoonLoader
                                                        color='blue'
                                                        size={70}
                                                        aria-label="Loading Spinner"
                                                        data-testid="loader"
                                                    />
                                                </div>
                                                :
                                                getAttendHistory.length > 0
                                                    ?
                                                    getAttendHistory.map((data, index) => (

                                                        <div key={index} className='activity-report-list-data'>
                                                            <span>{userDetails.first_name + ' ' + userDetails.last_name}</span>
                                                            <span>{userDetails.designation}</span>
                                                            <span>{data[0].date}</span>
                                                            <div className='flex-div main-activity-div'>
                                                                {
                                                                    data.map((next_data, index) => (
                                                                        <p key={index}><span>{index + 1}</span><span>{next_data.activity}</span></p>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    ))
                                                    :
                                                    <span className='attend_report_empty_component'>
                                                        <Empty />
                                                    </span>
                                        // : getAttendHistory.length > 0 ? getAttendHistory.map((data, index) => (
                                        //     <div key={index} className='activity-report-list-data'>
                                        //         <span>{`${userDetails?.first_name}  ${userDetails?.last_name}`}</span>
                                        //         <span>{userDetails?.designation}</span>
                                        //         <span style={{ borderRight: '1px solid lightgray' }}>
                                        //             {
                                        //                 data?.map((val, index) => (
                                        //                     index === 0 && <span key={index}>{val?.date}</span>
                                        //                 ))
                                        //             }
                                        //         </span>
                                        //         <span>
                                        //             {
                                        //                 data?.map((val, index) => (
                                        //                     <span key={index} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', borderRight: '1px solid lightgray', padding: '10px' }}>
                                        //                         <span style={{ flex: 1 }}>{val?.activity}</span>
                                        //                     </span>

                                        //                 ))
                                        //             }
                                        //         </span>

                                        //     </div>
                                        // )) :
                                        //     <span className='attend_report_empty_component'>
                                        //         <Empty />
                                        //     </span>

                                    }

                                </div>
                            </div>
                        </div>
                    </div >
                </div >
            </div >
            <Toaster />
        </div >
    )
}

export default Activity