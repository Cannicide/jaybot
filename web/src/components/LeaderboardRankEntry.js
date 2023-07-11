import { ListItem, ListItemAvatar, ListItemText, ListItemIcon, Avatar, Skeleton, Chip, ListSubheader, useMediaQuery } from '@mui/material';
import { abbreviateNumber } from 'discord-arts-zhorde/src/Utils/imageUtils';
import LeaderboardRankProgress from './LeaderboardRankProgress';
import { rankTheme } from '../theme';

const rankUtils = {
    getXpTotalAtLevel(level) {
        // Apply derivation of Mee6 formula to get xp at level
        return Math.floor((5 * level / 6) * (2 * level + 13) * (level + 7));
    }
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

const listNumber2ndExtraStyle = {
    ...listNumberIconStyle,
    color: rankTheme.primary,
    marginRight: "17px"
}

const listNumber1stExtraStyle = {
    ...listNumber2ndExtraStyle,
    minWidth: "65px",
    marginRight: "2px"
}

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
    opacity: 0.9
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

export function LeaderboardRankEntry({ pid, avatar, username, xp, level, messages, index }) {

    const isLarge = useMediaQuery(rankTheme.provider.breakpoints.up('md'));
    const largeComps = (
        <>
            <ListItemIcon sx={listNumber1stExtraStyle}>
                {abbreviateNumber(messages)}
            </ListItemIcon>
            <ListItemIcon sx={listNumber2ndExtraStyle}>
                {abbreviateNumber(xp)}
            </ListItemIcon>
        </>
    );

    const hasId = !avatar?.match(/(?<=cdn\.discordapp\.com\/avatars\/)[0-9]{18}/g)?.[0];
    const TextPlaceholder = () => (<span style={{visibility:"hidden"}}>100</span>);

    return pid ?
            (<ListItem key={pid} sx={listStyle}>
                <ListItemIcon sx={listNumberIconStyle}>
                    <Chip label={abbreviateNumber(index + 1)} sx={getListNumberChipStyle(index)} />
                </ListItemIcon>
                 <ListItemAvatar>
                     <Avatar src={avatar} alt={username} sx={hasId ? { bgcolor: rankTheme.info, color: rankTheme.smoothBlack } : {}}>
                        {username.charAt(0)}
                     </Avatar>
                 </ListItemAvatar>
                 <ListItemText
                     primary={username}
                 />
                 {isLarge ? largeComps : ""}
                 <LeaderboardRankProgress xp={xp} maxxp={rankUtils.getXpTotalAtLevel(level + 1)} level={level} />
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
                    <ListItemIcon sx={listNumber1stExtraStyle}>
                        <Skeleton variant="rectangular">
                            <TextPlaceholder />
                        </Skeleton>
                    </ListItemIcon>
                : ""}
                {isLarge ? 
                    <ListItemIcon sx={listNumber2ndExtraStyle}>
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