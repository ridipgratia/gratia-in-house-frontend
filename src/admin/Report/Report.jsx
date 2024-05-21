import React, { useState, useEffect } from 'react'
import './Report.css'
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import axiosInstance from '../../utils/axios';
import MoonLoader from "react-spinners/ClipLoader";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { BsArrowRightCircle } from "react-icons/bs";
import { TbUserCircle } from "react-icons/tb";
import toast, { Toaster } from 'react-hot-toast';
import * as ExcelJS from 'exceljs';
import { Select } from 'antd';
import { useImage } from "../../context/imgContext/imageContext"
import { Empty } from 'antd';

const Report = () => {
    const { Option } = Select;
    const [getStartDate, setGetStartDate] = useState(new Date().toISOString().substring(0, 10));
    const [getEndDate, setGetEndDate] = useState(new Date().toISOString().substring(0, 10));
    const [loadingData, setLoadingData] = useState(false);
    const [getAttendHistory, setGetAttendHistory] = useState([])
    // console.log("hello", getAttendHistory)
    const [userType, setUserType] = useState("All Users")
    // console.log(userType)
    const [userDropdownList, setUserDropdownList] = useState([])

    const { serverUrl } = useImage();


    // -------------------------GET ALL USERS FOR DROPDOWN LIST-----------------------------
    const allUsersList = () => {
        axiosInstance
            .post("/all-employee")
            .then((response) => {
                // console.log(response.data.users)
                setUserDropdownList(response.data?.users)
            })
            .catch((err) => {
                toast.error(err?.message)
            });
    }

    useEffect(() => {
        allUsersList()
        getAttendanceHistory()
    }, [])

    // --------------------------get attendance history-------------------------
    const getAttendanceHistory = () => {
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
                setLoadingData(true);
                const req = {
                    start_date: getStartDate,
                    end_date: getEndDate
                };
                axiosInstance
                    .post("/find-attendance", req)
                    .then((response) => {
                        // console.log(response)
                        if (response.data?.status === 200) {
                            setGetAttendHistory(response?.data?.attendances)
                            setLoadingData(false);
                        } else {
                            toast.error(response.data?.message)
                            setLoadingData(false);
                        }
                    })
                    .catch((err) => {
                        setLoadingData(false);
                        toast.error(err?.message)
                    });
            }
        } else {
            // -----------------------------single user attendance history api call---------------------
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
                setLoadingData(true);
                const req = {
                    user_id: userType,
                    start_date: getStartDate,
                    end_date: getEndDate
                };
                axiosInstance
                    .post("/attendance-by-user", req)
                    .then((response) => {
                        // console.log("single user", response)
                        if (response.data?.status === 200) {
                            setGetAttendHistory(response?.data?.attendances)
                            setLoadingData(false);
                        } else {
                            toast.error(response.data?.message)
                            setLoadingData(false);
                        }
                    })
                    .catch((err) => {
                        setLoadingData(false);
                        toast.error(err?.message)
                    });
            }

        }

    }
    // ----------------------------------generate excelsheet of attendace history-------------------------
    const generateExcel = async () => {
        if (getStartDate === "" && getEndDate === "") {
            toast.error("No Data In Table.");
        } else if (getAttendHistory?.length === 0) {
            toast.error("No Data In Table.");
        }
        else {
            try {
                // ---------------made some changes here for excel data-----------------
                const jsonData = getAttendHistory;


                // Create a new workbook
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sheet 1');

                // Set headers
                const headers = ['Emp ID', 'First Name', 'Last Name', 'Status', 'Message', 'In Date', 'In Time', 'In Office', 'Out Date', 'Out Time', 'Out Office', 'In Distance', 'Out Distance', 'Working Hrs'];
                const headerRow = worksheet.getRow(1);
                worksheet.getRow(1).values = headers;
                headerRow.font = { bold: true };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '197419' }, // Green background color
                };

                // Set data rows
                jsonData.forEach((attendance, index) => {
                    const rowIndex = index + 2;
                    const { in_date, in_time, in_office, out_date, out_time, out_office, status, msg, user, in_distance, out_distance, working_hours } = attendance;
                    const { first_name, last_name, emp_id } = user;
                    const values = [emp_id, first_name, last_name, status, msg, in_date, in_time, in_office, out_date, out_time, out_office, in_distance, out_distance, working_hours];
                    const dataRow = worksheet.getRow(rowIndex).values = values;
                    dataRow.alignment = { vertical: 'middle', horizontal: 'center' }; // Center alignment
                });


                // Set column widths
                worksheet.columns.forEach((column) => {
                    column.width = 27;
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
                link.download = 'attendance.xlsx';
                link.click();

                // Cleanup
                URL.revokeObjectURL(url);
                // setGetAttendHistory([])

            } catch (error) {
                toast.error('Error generating Excel file:', error);
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
                                        {
                                            userDropdownList.length > 0 && userDropdownList.map((val, index) => (
                                                <Option value={val?.id} key={index} style={{ textTransform: 'capitalize' }}>{val?.first_name} {val?.last_name}</Option>
                                            ))
                                        }
                                    </Select>
                                </div>
                                <div className='report-search-main-div'>
                                    {
                                        userType === "All Users" ?
                                            <>
                                                <p className='to_class'>from</p>
                                                <div className='report_search_box'>
                                                    <input type="date" value={getStartDate} onChange={(e) => setGetStartDate(e.target.value)} />
                                                </div>
                                                <p className='to_class'>to</p>
                                                <div className='report_search_box'>
                                                    <input type="Date" value={getEndDate} onChange={(e) => setGetEndDate(e.target.value)} />
                                                </div>
                                                <div className='go_btn_div'>
                                                    <button className='go_btn' onClick={getAttendanceHistory}><BsArrowRightCircle /></button>
                                                </div>
                                            </> : <>
                                                <p className='to_class'>from</p>
                                                <div className='report_search_box'>
                                                    <input type="date" value={getStartDate} onChange={(e) => setGetStartDate(e.target.value)} />
                                                </div>
                                                <p className='to_class'>to</p>
                                                <div className='report_search_box'>
                                                    <input type="Date" value={getEndDate} onChange={(e) => setGetEndDate(e.target.value)} />
                                                </div>
                                                <div className='go_btn_div'>
                                                    <button className='go_btn' onClick={getAttendanceHistory}><BsArrowRightCircle /></button>
                                                </div>
                                            </>
                                    }
                                </div>

                                <div className='report_add_div'>
                                    <button onClick={generateExcel}><span className='dash_download_icon'><FaCloudDownloadAlt /></span>Download</button>
                                </div>
                            </div>
                            {/* ------------------------------------------------------------- */}

                            {/* ------------------------------custom table--------------------- */}
                            <div className='dashboard_atten_report_page_container'>
                                <div className='atten-report-list-head'>
                                    <span>Name</span>
                                    <span>ID</span>
                                    <span>Designation</span>
                                    <span>Date</span>
                                    <span>In Time</span>
                                    <span>Status</span>
                                    <span>Message</span>
                                    <span>Out Time</span>
                                    <span>Working Hrs</span>
                                </div>
                                <div className='atten-report-list-body'>
                                    {loadingData === true ?
                                        <div className='holiday_loader_loading'>
                                            <MoonLoader
                                                color='blue'
                                                size={70}
                                                aria-label="Loading Spinner"
                                                data-testid="loader"
                                            />
                                        </div> :
                                        getAttendHistory.length > 0 ? getAttendHistory.map((data, index) => (
                                            <div key={index} className='atten-report-list-data'>
                                                <span className='admin_emp_full_name'>{data?.user?.first_name} {data?.user?.last_name}</span>
                                                <span className='emp_id_field'>{data?.user.emp_id}</span>
                                                <span className='report-table-message'>{data?.user?.designation}</span>
                                                <span>{data?.in_date}</span>
                                                <span>{data?.in_time}</span>
                                                <span className='report-status-green'>{data?.status}</span>
                                                <span className='report-table-message-span'>{data?.msg === "" ? "null" : `${data?.msg}`} </span>
                                                <span>{data?.out_time === "" ? "null" : `${data?.out_time}`}</span>
                                                <span>{data?.out_time === "" ? "null" : `${data?.working_hours} hrs`}</span>
                                            </div>
                                        )) :
                                            <span className='no_data_div'>
                                                <Empty />
                                            </span>
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

export default Report