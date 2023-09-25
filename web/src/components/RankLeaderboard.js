import List from '@mui/material/List';

import { LeaderboardRankEntry, LeaderboardRankHeader } from './LeaderboardRankEntry';

const inferMonthlyMessages = (xp) => {
    return Math.floor((xp ?? 0) / 15);
}

export default function RankLeaderboard({ users, isMonthly }) {
    return (
        <List sx={{ width: "100%" }}>
            <LeaderboardRankHeader />
            {users.map((user, i) => 
                <LeaderboardRankEntry key={i} pid={user?.playerId} avatar={user?.playerAvatar} username={user?.playerUsername} xp={isMonthly ? user?.xpMonthly : user?.xp} level={isMonthly ? user?.levelMonthly : user?.level} messages={isMonthly ? inferMonthlyMessages(user?.xpMonthly) : user?.messages} index={i} isMonthly={isMonthly} />
            )}
        </List>
    );
}