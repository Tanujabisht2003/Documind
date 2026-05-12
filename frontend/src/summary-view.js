import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

export default function SummaryView({ data }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card
          sx={{
            borderRadius: 2,
            border: '1px solid #E1E6EF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
          variant='outlined'
        >
          <CardHeader
            title='Main Points'
            subheader='Key concepts extracted from your document'
            sx={{
              paddingBottom: 0,
              '& .MuiCardHeader-title': {
                fontSize: '22px',
              },
              '& .MuiCardHeader-subheader': {
                color: 'rgba(0, 0, 0, 0.5)',
              },
            }}
          />
          <CardContent sx={{ p: 0 }}>
            <Typography sx={{ p: 0 }}>
              <ul style={{ marginBottom: 0 }}>
                {data.summary?.mainPoints.map((point) => (
                  <li>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            borderRadius: 2,
            border: '1px solid #E1E6EF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
          variant='outlined'
        >
          <CardHeader
            title='Key Insights'
            subheader='The core message of the document'
            sx={{
              paddingBottom: 0,
              '& .MuiCardHeader-title': {
                fontSize: '22px',
              },
              '& .MuiCardHeader-subheader': {
                color: 'rgba(0, 0, 0, 0.5)',
              },
            }}
          />
          <CardContent sx={{ pb: 0 }}>
            <Typography sx={{ mb: 0 }}>{data.summary?.keyInsights}</Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            borderRadius: 2,
            border: '1px solid #E1E6EF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
          variant='outlined'
        >
          <CardHeader
            title='Recommendations'
            subheader='Suggested actions based on the document'
            sx={{
              paddingBottom: 0,
              '& .MuiCardHeader-title': {
                fontSize: '22px',
              },
              '& .MuiCardHeader-subheader': {
                color: 'rgba(0, 0, 0, 0.5)',
              },
            }}
          />
          <CardContent sx={{ p: 0 }}>
            <Typography sx={{ p: 0 }}>
              <ul style={{ marginBottom: 0 }}>
                {data.summary?.recommendations.map((recommendation) => (
                  <li>
                    <span>{recommendation.statement}</span>
                  </li>
                ))}
              </ul>
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
}