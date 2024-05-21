import React, { useState, useRef, useEffect } from 'react'
import "./FPUpdated.css"
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import axiosInstance from '../../utils/axios';
import { useAuth } from "../../context/auth/authContext"
import { useAttend } from '../../context/attendance/attenContext';
import toast, { Toaster } from 'react-hot-toast';
import { FaUserCircle } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import { MdPhotoCamera } from "react-icons/md";
import CircularProgress from '@mui/material/CircularProgress';

import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

import { useImage } from "../../context/imgContext/imageContext"

const FPUpdated = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const { userData, handleUserData } = useAuth()
    const { uploadProfileImg, setUploadProfileImg } = useAttend();
    const [updateUserFirstName, setUpdateUserFirstName] = useState(userData.first_name)
    const [updateUserLastName, setUpdateUserLastName] = useState(userData.last_name)
    const [updatePhone, setUpdatePhone] = useState(userData.phone_no)
    const [updateUserDesignation, setUpdateUserDesignation] = useState(userData.designation)

    const { serverUrl } = useImage();

    // --------------------------------profile upload fun----------------------------------
    const imgRef = useRef(null)
    const handleClickProfileImg = () => {
        imgRef.current.click();
    };

    const handleChangeProfileImg = (event) => {
        const imgUploaded = event.target.files[0];
        const formData = new FormData();
        formData.append('user_image', imgUploaded);
        formData.append('emp_id', userData.emp_id);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };
        axiosInstance.post("/profile-img", formData, config).then((response) => {
            setUploadProfileImg(response.data.data.user_image)
            toast.success("Successfully uploaded !.", {
                duration: 3000,
                position: 'bottom-center',
                className: "facultyToast"
            });
        }
        ).catch((err) => {
            console.log(err)
            toast.error(err.response.data.message, {
                duration: 3000,
                position: 'bottom-center',
                className: "facultyToast"
            });
        })

    };
    // --------------------------------update profile data fun-------------------------
    const updateUserProfileDataFun = () => {
        setLoading(true)
        const req = {
            id: userData.user_id,
            first_name: updateUserFirstName,
            last_name: updateUserLastName,
            contact_no: updatePhone,
            designation: updateUserDesignation,
        };
        axiosInstance
            .post("/update", req)
            .then((response) => {
                if (response.data?.status === 200) {
                    const { user } = response.data
                    const updatedNewData = {
                        ...userData,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        phone_no: user.contact_no,
                        designation: user.designation,
                    }
                    handleUserData(updatedNewData)
                    setLoading(false)
                    toast.success("Successfully updated !");
                } else {
                    setLoading(false)
                    toast.success("Something went wrong !");
                }
            })
            .catch((err) => {
                setLoading(false)
                toast.error(err.response.data.error);
            });
    }

    // -----------------------search user profile exist or not-----------------
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

        <div className='updated-user-data-container'>
            <div className='updated-top-component'>
                <Navbar />
            </div>
            <div className='updated-bottom-component'>
                <div className='updated-left-sidebar'>
                    <Sidebar />
                </div>
                <div className='updated-right-content'>
                    <div className='update_user_profile_container'>
                        <div className='user-edit-back-btn-div'>
                            <span onClick={() => navigate("/profile&1")}><FaArrowLeftLong /></span>
                        </div>
                        <div className='update_user_profile_main'>
                            <div className='update_user_image_div'>
                                <div className='faculty_profile_image_div'>
                                    {uploadProfileImg === null ? <span><FaUserCircle /></span> : <img src={`${serverUrl}${uploadProfileImg}`} alt="user_img" />}

                                    <div className='profile_camera_div'>
                                        <span onClick={handleClickProfileImg}><MdPhotoCamera /></span>
                                        <input
                                            type="file"
                                            ref={imgRef}
                                            onChange={handleChangeProfileImg}
                                            style={{ display: 'none' }} />
                                    </div>
                                </div>
                            </div>
                            <div className='update_user_profile_data_div'>
                                <div className='update_user_data_input_div'>
                                    <label>First Name</label>
                                    <input type="text" value={updateUserFirstName} onChange={(e) => setUpdateUserFirstName(e.target.value)} />
                                </div>
                                <div className='update_user_data_input_div'>
                                    <label>Last Name</label>
                                    <input type="text" value={updateUserLastName} onChange={(e) => setUpdateUserLastName(e.target.value)} />
                                </div>
                                <div className='update_user_data_input_div'>
                                    <label>Designation</label>
                                    <input type="text" value={updateUserDesignation} onChange={(e) => setUpdateUserDesignation(e.target.value)} />
                                </div>

                                <div className='update_user_data_input_div'>
                                    <label>Phone</label>
                                    <input type="text" value={updatePhone} onChange={(e) => setUpdatePhone(e.target.value)} maxLength="10" />
                                </div>
                                {userData.address && <div className='update_user_data_input_div'>
                                    <label>Address</label>
                                    <input type="text" value={updateAddress} onChange={(e) => setUpdateAddress(e.target.value)} />
                                </div>}

                            </div>
                            <div className='update_user_profile_btn_div'>
                                <Button variant="outlined" color="error" size="medium" onClick={() => navigate("/profile&1")}>Cancel</Button>
                                <Button variant="contained" size="medium" onClick={updateUserProfileDataFun}>
                                    {loading === true ? <CircularProgress color="inherit" size={15} /> : "save"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster />
        </div>
        // -------------------------------------------------------------------------------------

    )
}

export default FPUpdated