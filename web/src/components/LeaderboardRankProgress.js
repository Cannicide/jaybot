// Derived from default MUI CircularProgressWithLabel template

import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function LeaderboardRankProgress(props) {

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" value={(Number(props.xp) / Number(props.maxxp)) * 100} {...props} />
            <Box
                sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                }}
            >
                <Typography variant="caption" component="div" color={/*color="text.secondary"*/"#24eaa8"}>
                    {`${Math.round(props.level)}`}
                </Typography>
            </Box>
        </Box>
    );
};