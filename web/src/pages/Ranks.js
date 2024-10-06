import Page from "./Page";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import RankLeaderboard from "../components/RankLeaderboard";
import { Theme, rankTheme } from "../theme";

const ZhordeLogo = () => {
    const url = "https://cdn.cannicide.net/zhorde/logo.png";

    return (
        <Avatar variant="rounded" alt="ZombieHorde" src={url} sx={{ minWidth: 50, minHeight: 50, width: 100, height: 100 }}>
            ZH
        </Avatar>
    );
}

const Main = ({ children }) => (
    <div style={{background: rankTheme.smoothBlack, color: rankTheme.color, width: "100%", height: "100%", position: "fixed", top: "0", left: "0", overflowY: "auto", display: "flex", alignItems: "center", flexDirection: "column"}}>
        {children}
    </div>
);

const Section = ({ children, sx={} }) => (
    <Container maxWidth="md" sx={{ margin: "15px 0px", display: "flex", justifyContent: "center", alignItems: "center", ...sx }}>
        {children}
    </Container>
);

class Ranks extends Page {

    state = {
        lifetimeRanks: new Array(100).fill(null),
        monthlyRanks: new Array(100).fill(null),
        isMonthly: false
    }

    onMount() {
        this.getUsers();
    }

    getUUID(len) {
        const chars = "abcdefghijklmnopqrstuvwxyz1234567890@#!$%^&*-_+=";
        return new Array(len).fill(null).map(_ => chars[Math.floor(Math.random() * chars.length)]).join("");
    }

    async getUsers() {
        try {
            const lifetimeRaw = await fetch("/api/ranks/top");
            const monthlyRaw = await fetch("/api/ranks/top/monthly");

            let lifetimeRanks = await lifetimeRaw.json();
            let monthlyRanks = await monthlyRaw.json();

            lifetimeRanks = lifetimeRanks.concat(new Array(100 - lifetimeRanks.length).fill(null));
            monthlyRanks = monthlyRanks.concat(new Array(100 - monthlyRanks.length).fill(null));

            setTimeout(() => this.setState({ lifetimeRanks, monthlyRanks }), 250);
        }
        catch (err) {
            console.error(err);
        }
    }

    switchType(newType) {
        this.setState({ isMonthly: newType === "monthly" });
    }

    render() {
        const { lifetimeRanks, monthlyRanks, isMonthly } = this.state;

        return (
            <Theme theme={rankTheme.provider}>
                <Main>
                    <Section sx={{ flexDirection: "column" }}>
                        <ZhordeLogo />
                        <Divider role="presentation" sx={{ width: "100%" }}>
                            <Typography variant="h4" display="block" sx={{ textAlign: "center" }}>
                                Discord Ranks
                            </Typography>
                        </Divider>
                    </Section>
                    <Section sx={{ margin: "30px 0px" }}>
                        <ToggleButtonGroup
                            color={isMonthly ? "info" : "primary"}
                            value={isMonthly ? "monthly" : "lifetime"}
                            exclusive
                            onChange={(_, n) => this.switchType(n)}
                            aria-label="Category"
                        >
                            <ToggleButton value="lifetime">Lifetime</ToggleButton>
                            <ToggleButton value="monthly">Monthly</ToggleButton>
                        </ToggleButtonGroup>
                    </Section>
                    <Section>
                        <Box sx={{ bgcolor: rankTheme.background, padding: "0px 15px 15px 15px", borderRadius: "15px", width: "100%" }}>
                            <RankLeaderboard users={isMonthly ? monthlyRanks : lifetimeRanks} isMonthly={isMonthly} />
                        </Box>
                    </Section>
                    <Section>
                        <Typography variant="overline" display="block" gutterBottom sx={{ textAlign: "center" }}>
                            Zhorde Jaybot by <Link href="https://github.com/Cannicide" underline="none" target="_blank" rel="noopener">Cannicide</Link>
                        </Typography>
                    </Section>
                </Main>
            </Theme>
        );
    }
}

export default Ranks;