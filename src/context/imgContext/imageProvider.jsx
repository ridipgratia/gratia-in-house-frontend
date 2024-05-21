import React from 'react';
import { ImageContext } from './imageContext';

const ImageProvider = ({ children }) => {
    const serverUrl = 'https://api.attendancetested.gratiatechnology.com/uploads/';

    return (
        <ImageContext.Provider value={{ serverUrl }}>
            {children}
        </ImageContext.Provider>
    );
};

export default ImageProvider;