import Button from '@mui/material/Button';
import './slide-view.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import { useState } from 'react';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

export default function SlideView() {
  const navigate = useNavigate();
  const { fileName } = useParams();
  const location = useLocation();
  const parsedData = location.state || {};
  const slideNotes = parsedData?.notes || [];
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const slideRefs = useRef([]);

  const exportAllSlidesToPDF = async (slides) => {
    setLoading(true);
    const pdf = new jsPDF('landscape', 'px', [1280, 720]);

    for (let i = 0; i < slides.length; i++) {
      const slideElement = document.getElementById(`slide-${i}`);
      const canvas = await html2canvas(slideElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
    }

    pdf.save(`${fileName}`);
    setLoading(false);
  };

    return (
      <div className='parent'>
        <div className='child1'>
          <div className='subchild1'>
            <Button
              onClick={() => navigate(-1)}
              sx={{
                height: '4vh',
                justifyContent: 'start',
                display: 'flex',
                gap: '2px',
              }}
            >
              <ArrowBackIcon
                sx={{
                  width: 18,
                  height: 20,
                  color: '#0E131B',
                }}
              />
              <span className='back-btn'>Back</span>
            </Button>
            <div className='box'>
              <div className='name'>{fileName}</div>
              <div>
                <Button
                  fullWidth
                  variant='contained'
                  sx={{ height: 30,textTransform: 'none', fontSize: 14,fontWeight: '600' }}
                  onClick={() => exportAllSlidesToPDF(slideNotes)}
                >
                  Export <DownloadIcon />
                </Button>
              </div>
            </div>
          </div>
          {/* scroll bar */}
          <div className='subchild2'>
            {slideNotes.map((note, index) => (
              <div key={index} className='small_slide'>
                <div className='index_id'>{index + 1}</div>
                <div
                  className={`content ${
                    selectedIndex === index ? 'active-slide' : ''
                  }`}
                  onClick={() => {
                    setSelectedIndex(index);

                    slideRefs.current[index]?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                >
                  <h2 className='tit'>{note.title}</h2>
                  <ul className='dot'>
                    {note.content.map((opt, i) => (
                      <li className='point' key={i}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='child2'>
          <div className='slide'>
            {slideNotes.map((note, index) => (
              /* Render all slides with IDs */
              <div
                key={index}
                id={`slide-${index}`}
                ref={(el) => (slideRefs.current[index] = el)}
                className='large_slide'
              >
                <div className='large_title'>
                  <h2>{note.title}</h2>
                </div>
                <div>
                  <ul className='large_content'>
                    {note.content.map((opt, i) => (
                      <li className='large_point' key={i}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/*  if loading is true then a window will apear when we click export pdf button */}
        {loading && (
          <div className='cover'>
            <div className='loader_box'>
              <CircularProgress aria-label='Loading…' />;
              <p className='loader_name'>Exporting Pdf</p>
            </div>
          </div>
        )}
      </div>
    );
}