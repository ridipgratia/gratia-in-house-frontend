import React, { useEffect } from 'react'
import "./FProfile.css"
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/auth/authContext"
import { useAttend } from '../../context/attendance/attenContext';
import { FaEdit } from "react-icons/fa";
import axiosInstance from "../../utils/axios"
import { useNavigate } from 'react-router-dom'
import { CiEdit } from "react-icons/ci";
import { FiEdit } from "react-icons/fi";

import { useImage } from "../../context/imgContext/imageContext"


const FProfile = () => {
    const { userData } = useAuth();
    // console.log(userData)
    const navigate = useNavigate();

    const { uploadProfileImg, setUploadProfileImg } = useAttend();
    const { serverUrl } = useImage();

    useEffect(() => {
        const req = {
            emp_id: userData.emp_id,
        };
        axiosInstance.post("/get-profile-url", req)
            .then((response) => {
                setUploadProfileImg(response.data.data.user_image)
            })
            .catch((err) => {
                console.log(err)
            });

    }, [uploadProfileImg])




    return (
        <>
            <div className='faculty-history-container'>
                <div className='faculty-history-topbar'>
                    <Navbar />
                </div>
                <div className='faculty-history-container-child'>
                    <div className='faculty-history-sidebar'>
                        <Sidebar />
                    </div>

                    {/* //dashboard */}
                    <div className='faculty-history-right-div'>
                        <div className='faculty_profile_details_container'>
                            <div className='user_profile_img_container'>
                                <div className='user_profile_img_name_div'>
                                    <div className='faculty_profile_image_div'>
                                        {uploadProfileImg === null ? <span><FaUserCircle /></span> : <img src={`${serverUrl}${uploadProfileImg}`} alt="user_img" />}
                                    </div>
                                    <div className='user_name_desig_div'>
                                        <p>{userData?.first_name} {userData?.last_name}</p>
                                        <p>{userData?.designation}</p>
                                    </div>
                                </div>
                                <div className='user_profile_edit_btn_div'>
                                    <button onClick={() => navigate("/profile/edit")}><CiEdit className='edit_icon' />Edit</button>
                                    <button onClick={() => navigate("/profile/edit")}><FiEdit /></button>
                                </div>
                            </div>
                            <div className='user_profile_data_container'>
                                <h4 style={{ fontWeight: '600' }}>Personal information</h4>
                                {/* -------------------------for mobile size------------- */}
                                <div className='faculty_profile_personal_details_div'>
                                    <p><span>Emp ID : </span><span>{userData?.emp_id}</span></p>
                                    <p><span>Name : </span><span style={{ textTransform: "capitalize" }}>{userData?.first_name} {userData?.last_name}</span></p>
                                    <p><span>DOB : </span><span>{userData?.dob}</span></p>
                                    <p><span>Gender : </span><span style={{ textTransform: 'capitalize' }}>{userData?.gender}</span></p>
                                    <p><span>Phone : </span><span>{userData?.phone_no}</span></p>
                                    <p><span>Date of joining : </span><span>{userData?.date_of_joining}</span></p>
                                    <p ><span>Designation : </span><span style={{ textTransform: 'capitalize' }}>{userData?.designation}</span></p>
                                    <p><span>Office : </span><span>{userData?.office}</span></p>
                                    <p><span>Email : </span><span>{userData?.email}</span></p>
                                    <p><span>Status : </span><span style={{ color: '#4FCE5D' }}>{userData?.status}</span></p>
                                </div>
                                {/* --------------------------for desktop----------------------- */}
                                <div className='user_profile_data_container_for_desktop'>
                                    <div>
                                        <p>Name</p>
                                        <p style={{ textTransform: 'capitalize' }}>{userData?.first_name} {userData?.last_name}</p>
                                    </div>
                                    <div>
                                        <p>Employee ID</p>
                                        <p>{userData?.emp_id}</p>
                                    </div>
                                    <div>
                                        <p>Date Of Joining</p>
                                        <p>{userData?.date_of_joining}</p>
                                    </div>
                                    <div>
                                        <p>Designation</p>
                                        <p style={{ textTransform: 'capitalize' }}>{userData?.designation}</p>
                                    </div>
                                    <div>
                                        <p>Office</p>
                                        <p>{userData?.office}</p>
                                    </div>
                                    <div>
                                        <p>Status</p>
                                        <p style={{ color: '#4FCE5D' }}>{userData?.status}</p>
                                    </div>
                                    <div>
                                        <p>Date Of Birth</p>
                                        <p>{userData?.dob}</p>
                                    </div>
                                    <div>
                                        <p>Gender</p>
                                        <p style={{ textTransform: 'capitalize' }}>{userData?.gender}</p>
                                    </div>
                                    <div>
                                        <p>Phone No.</p>
                                        <p>{userData?.phone_no}</p>
                                    </div>
                                    <div>
                                        <p>Email</p>
                                        <p>{userData?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </>

    )
}

export default FProfile