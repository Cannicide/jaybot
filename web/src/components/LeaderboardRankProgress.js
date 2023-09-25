// Derived from default MUI CircularProgressWithLabel template

import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { rankTheme } from '../theme';

export default function LeaderboardRankProgress(props) {
    const percent = (Number(props.xp) / Number(props.maxxp)) * 100;
    let barColor = "success";
    if (Math.floor(percent) <= 25) barColor = "error";
    else if (Math.floor(percent) <= 50) barColor = "warning";

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
                variant="determinate"
                value={100}
                sx={{
                color: () => rankTheme.background
                }}
                {...props}
            />
            <CircularProgress
                variant="determinate"
                value={percent}
                color={barColor}
                sx={{
                    position: "absolute",
                    left: 0
                }}
                {...props}
            />
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
                <Typography variant="caption" component="div" color={rankTheme.color} fontWeight="bold">
                    {`${Math.round(props.level)}`}
                </Typography>
            </Box>
        </Box>
    );
};