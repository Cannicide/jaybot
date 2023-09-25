import { ListItem, ListItemAvatar, ListItemText, ListItemIcon, Avatar, Skeleton, Chip, ListSubheader, useMediaQuery } from '@mui/material';
import { abbreviateNumber } from 'discord-arts-zhorde/src/Utils/imageUtils';
import LeaderboardRankProgress from './LeaderboardRankProgress';
import { rankTheme } from '../theme';

const rankUtils = {
    getXpTotalAtLevel(level) {
        // Apply derivation of Mee6 formula to get xp at level
        return Math.floor((5 * level / 6) * (2 * level + 13) * (level + 7));
    },
    getXpFromCurrentToNextLevel(currentLevel) {
        // Get xp needed to get from level A to level A + 1 (used in rank card progress bar)
        return rankUtils.getXpTotalAtLevel(currentLevel + 1) - rankUtils.getXpTotalAtLevel(currentLevel);
    },

    getXpProgressTowardsNextLevel(currentXp, currentLevel) {
        // Get progress towards next level (used in rank card progress bar)
        return currentXp - rankUtils.getXpTotalAtLevel(currentLevel);
    },
};

const rankColors = [
    "rankGold",
    "rankSilver",
    "rankBronze"
];

const rankBgs = [
    "rankGoldBackground",
    "rankSilverBackground",
    "rankBronzeBackground"
];

const listStyle = {
    bgcolor: rankTheme.secondary,
    marginTop: "15px",
    borderRadius: "25px"
};

const listNumberIconStyle = {
    justifyContent: "center"
};

const listNumber2ndExtraStyle = (isMonthly) => ({
    ...listNumberIconStyle,
    color: isMonthly ? rankTheme.info : rankTheme.primary,
    marginRight: "17px"
});

const listNumber1stExtraStyle = (isMonthly) => ({
    ...listNumber2ndExtraStyle(isMonthly),
    minWidth: "65px",
    marginRight: "2px"
});

const getListNumberChipStyle = index => ({
    minWidth: 32,
    paddingLeft: "5px",
    paddingRight: "5px",
    fontWeight: "bold",
    ...(index < 3 ? { bgcolor: rankTheme[rankBgs[index]], color: rankTheme[rankColors[index]] } : {}),
    "& span": {
        textOverflow: "clip",
        paddingLeft: 0,
        paddingRight: 0
    }
});

const getListHeaderStyle = (bgcolor) => ({
    ...listStyle,
    bgcolor,
    display: "flex",
    flexDirection: "row",
    borderRadius: 0,
    opacity: 0.9,
    transform: "translateY(-2px)"
});

const listHeaderCompact = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    ...getListNumberChipStyle(3),
    marginLeft: "5px"
}

const listHeaderExpand = {
    ...listHeaderCompact,
    justifyContent: "left",
    maxWidth: "100%",
    flex: 1,
    marginLeft: "10px"
}

export function LeaderboardRankEntry({ pid, avatar, username, xp, level, messages, index, isMonthly }) {

    const isLarge = useMediaQuery(rankTheme.provider.breakpoints.up('md'));
    const largeComps = (
        <>
            <ListItemIcon sx={listNumber1stExtraStyle(isMonthly)}>
                {abbreviateNumber(messages)}
            </ListItemIcon>
            <ListItemIcon sx={listNumber2ndExtraStyle(isMonthly)}>
                {abbreviateNumber(xp)}
            </ListItemIcon>
        </>
    );

    // const hasId = avatar?.match(/(?<=cdn\.discordapp\.com\/avatars\/)[0-9]{18}/g)?.[0];
    const TextPlaceholder = () => (<span style={{visibility:"hidden"}}>100</span>);

    return pid ?
            (<ListItem key={pid} sx={listStyle}>
                <ListItemIcon sx={listNumberIconStyle}>
                    <Chip label={abbreviateNumber(index + 1)} sx={getListNumberChipStyle(index)} />
                </ListItemIcon>
                 <ListItemAvatar>
                     <Avatar src={avatar} sx={{ bgcolor: rankTheme.smoothBlack, color: isMonthly ? rankTheme.info : rankTheme.primary }} />
                 </ListItemAvatar>
                 <ListItemText
                     primary={username}
                     sx={{
                        "& span": {
                            textOverflow: "ellipsis",
                            overflowX: "hidden",
                            maxWidth: 160
                        }
                     }}
                 />
                 {isLarge ? largeComps : ""}
                 <LeaderboardRankProgress xp={rankUtils.getXpProgressTowardsNextLevel(xp, level)} maxxp={rankUtils.getXpFromCurrentToNextLevel(level)} level={level} />
            </ListItem>) :
            (<ListItem key={"a" + index} sx={listStyle}>
                <ListItemIcon sx={listNumberIconStyle}>
                    <Skeleton variant="circular">
                        <Chip label={abbreviateNumber(index + 1)} sx={getListNumberChipStyle(index)} />
                    </Skeleton>
                </ListItemIcon>
                <ListItemAvatar>
                    <Skeleton variant="circular">
                        <Avatar/>
                    </Skeleton>
                </ListItemAvatar>
                <ListItemText sx={{marginRight: 2}}>
                    <Skeleton variant="rectangular" />
                </ListItemText>
                {isLarge ? 
                    <ListItemIcon sx={listNumber1stExtraStyle(isMonthly)}>
                        <Skeleton variant="rectangular">
                            <TextPlaceholder />
                        </Skeleton>
                    </ListItemIcon>
                : ""}
                {isLarge ? 
                    <ListItemIcon sx={listNumber2ndExtraStyle(isMonthly)}>
                        <Skeleton variant="rectangular">
                            <TextPlaceholder />
                        </Skeleton>
                    </ListItemIcon>
                : ""}
                <Skeleton variant="circular">
                    <LeaderboardRankProgress xp="0" maxxp="0.1" level="0" />
                </Skeleton>
            </ListItem>);
};

export function LeaderboardRankHeader({ bg }) {

    const isLarge = useMediaQuery(rankTheme.provider.breakpoints.up('md'));

    return (
        <ListSubheader sx={getListHeaderStyle(bg)}>
            <div style={listHeaderCompact}>
                Rank
            </div>
            <div style={listHeaderExpand}>
                User
            </div>
            {isLarge ? <div style={listHeaderCompact}>
                Messages
            </div> : ""}
            {isLarge ? <div style={{...listHeaderCompact, marginRight: "15px"}}>
                XP
            </div> : ""}
            <div style={listHeaderCompact}>
                Level
            </div>
        </ListSubheader>
    );
};