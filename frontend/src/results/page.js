import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Zoom from '@mui/material/Zoom';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import './page.css';
import SummaryView from '../summary-view';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import QuizView from '../quiz-view';

const BootstrapTooltip = styled(({ className, ...props }) => (
  <Tooltip describeChild {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);
  const { fileName } = useParams();
  const location = useLocation();
  const response = location.state || {};
  const parsedData = response.data || {};
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate(`/results/${fileName}/slide`, {
      state: parsedData,
    });
  }
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className='result'>
      <div className='result1'>
        <div className='header'>
          <DescriptionOutlinedIcon
            sx={{
              fontSize: 20,
              color: 'green',
            }}
          />
          <p>{fileName}</p>
        </div>
        <div>
          <Button
            onClick={handleSubmit}
            // className='slide'
            variant='outlined'
            // sx={{padding: 0}}
            // size='small'
          >
            <BootstrapTooltip
              describeChild
              title='Create slides'
              placement='bottom'
              arrow
              slots={{
                transition: Zoom,
              }}
            >
              {/* <div className='button'> */}
              <PictureAsPdfIcon
                sx={{
                  fontSize: 25,
                  color: 'blue',
                  display: 'flex',
                  // alignItems: 'center',
                  // justifyContent:'center'
                }}
              />
              {/* <span>Slides</span> */}
              {/* </div> */}
            </BootstrapTooltip>
          </Button>
        </div>
      </div>
      <div className='result2'>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='basic tabs example'
          // indicatorColor='Primary'
          // textColor='inherit'
          variant='fullWidth'
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label='Summary' {...a11yProps(0)} />
          <Tab label='Quiz' {...a11yProps(1)} />
        </Tabs>
        <div className='result3'>
          <CustomTabPanel value={value} index={0}>
            <SummaryView data={parsedData} />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <QuizView data={parsedData} />
          </CustomTabPanel>
        </div>
      </div>
    </div>
  );
}
