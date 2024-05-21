import React from 'react'
import "./Error.css"
import { useNavigate } from "react-router-dom"

const Error = () => {
    const navigate = useNavigate()
    return (
        <>
            <div className='error_container'>
                <div className='error_div'>
                    <h1 className='error_heading'>404</h1>
                    <h2 className='error_text'>You are not Authorised For This Page.</h2>
                    <button onClick={() => navigate("/home")} className='error_back_btn'>Back To Home</button>
                </div>
            </div>
        </>
    )
}

export default Error