import List from '@mui/material/List';

import { LeaderboardRankEntry, LeaderboardRankHeader } from './LeaderboardRankEntry';

export default function RankLeaderboard({ users, isMonthly }) {
    return (
        <List>
            <LeaderboardRankHeader />
            {users.map((user, i) => 
                <LeaderboardRankEntry key={i} pid={user?.playerId} avatar={user?.playerAvatar} username={user?.playerUsername} xp={isMonthly ? user?.xpMonthly : user?.xp} level={isMonthly ? user?.levelMonthly : user?.level} messages={user?.messages} index={i} />
            )}
        </List>
    );
}