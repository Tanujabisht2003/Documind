import './App.css';
import DocuMindlogo from './assets/DocuMindlogo.png';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '@mui/material/Button';
import LinearProgressWithLabel from './progress';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import BasicTabs from './results/page';
import SlideView from './slide-view';

function App() {
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        'application/pdf': ['.pdf'],
      },
      multiple: false,
    });
  const files = acceptedFiles.map(file => file.name);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setError('Please select a file to process.');
      return;
    }
    setUploading(true);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 60) return prev;
        return prev + Math.random() * 10 + Math.random() * 5;
      });
    }, 200);

    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    formData.append('name', acceptedFiles[0].name);
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/parse-pdf`, formData,
    );
      if (res.status !== 200) {
        setError("Failed to upload file. Please try again.");
        clearInterval(progressInterval);
        setUploading(false);
        return;
      }
      setProgress(100);
      clearInterval(progressInterval);
      setTimeout(() => {
        navigate(`/results/${acceptedFiles[0].name}`, {
          state: res.data,
        });
      }, 800);
    } catch (e) {
      console.error("❌ Upload failed:", e);
      clearInterval(progressInterval);
      setError("Oops! Something went wrong while processing your file. Please try again.");
    //   // ✅ Fix: Reset states only on error
      setUploading(false);
      setProgress(0);
    //   setFile(null);
    }
  };

  
  return (
    <Routes>
      <Route
        path='/'
        element={
          <div className='outer'>
            <div>
              <img
                src={DocuMindlogo}
                alt='logo'
                style={{ width: '100px', height: '100px' }}
              />
            </div>
            <div className='inner1'>
              <h1>Upload Your Document</h1>
              <p className='text1'>PDF files only up to 10MB</p>
              <div
                className={`inner2 ${
                  isDragActive
                    ? 'drag-active'
                    : files.length > 0
                    ? 'uploaded'
                    : ''
                }`}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <div className='small1'>
                    <FileUploadOutlinedIcon
                      sx={{
                        fontSize: 60,
                        color: 'grey',
                      }}
                    />
                    <p>Drop the files here !</p>
                  </div>
                ) : files.length > 0 ? (
                  <div className='small2'>
                    <div>
                      <DescriptionOutlinedIcon
                        sx={{
                          fontSize: 60,
                          color: 'green',
                        }}
                      />
                      <CheckCircleOutlinedIcon
                        sx={{
                          // fontSize: 20,
                          color: 'green',
                          position: 'absolute',
                          top: '155px',
                          left: '403px',
                        }}
                      />
                    </div>
                    <div className='small2'>
                      <p>{files}</p>
                      <p className='text3'>• Ready to process</p>
                    </div>
                  </div>
                ) : (
                  <div className='small1'>
                    <FileUploadOutlinedIcon
                      sx={{
                        fontSize: 60,
                        color: 'grey',
                      }}
                    />
                    <p>
                      Drag 'n' drop some files here, or click to select files
                    </p>
                  </div>
                )}
              </div>
              {files.length > 0 && (
                <div>
                  {uploading && (
                    <div className='text4'>
                      <div className=''>
                        <span>Processing your document...</span>
                      </div>
                      <LinearProgressWithLabel value={progress} />
                      <div className=''>
                        <div className='' />
                        {progress < 30 && 'Analyzing document structure...'}
                        {progress >= 30 &&
                          progress < 60 &&
                          'Extracting key information...'}
                        {progress >= 60 &&
                          progress < 90 &&
                          'Generating learning materials...'}
                        {progress >= 90 && 'Almost ready!'}
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={handleSubmit}
                    disabled={files.length === 0 || uploading}
                    sx={{ width: 750, borderRadius: 2 }}
                    variant='contained'
                  >
                    {uploading ? (
                      <p className='button'>Processing....</p>
                    ) : (
                      <p className='button'> Process Document </p>
                    )}
                  </Button>
                </div>
              )}
              <p className='text2'>
                🔒 Your files are securely processed and never shared with third
                parties
              </p>
            </div>
          </div>
        }
      />
      <Route path='/results/:fileName' element={<BasicTabs />} />
      <Route path='/results/:fileName/slide' element={<SlideView />} />
    </Routes>
  );
}

export default App;
