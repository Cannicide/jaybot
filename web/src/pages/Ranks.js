import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import RankLeaderboard from "../components/RankLeaderboard";
import { Theme, rankTheme } from "../theme";

const Main = ({ children }) => (
    <div style={{background: rankTheme.smoothBlack, color: rankTheme.color, width: "100%", height: "100%", position: "fixed", top: "0", left: "0", overflowY: "auto"}}>
        {children}
    </div>
);

class Ranks extends React.Component {

    state = { users: new Array(100).fill(null) }

    componentDidMount() {
        this.getUsers();
    }

    getUUID(len) {
        const chars = "abcdefghijklmnopqrstuvwxyz1234567890@#!$%^&*-_+=";
        return new Array(len).fill(null).map(_ => chars[Math.floor(Math.random() * chars.length)]).join("");
    }

    getUsers() {
        const users = [
            {
                playerId: "abc123",
                playerUsername: "Jay",
                playerAvatar: "https://cdn.discordapp.com/avatars/274639466294149122/fc00171d20cdcaaf4f7e3e88b6ce9d0d.webp?size=128",
                xp: 70,
                get level() {
                    return Math.floor(this.xp / 75);
                },
                get messages() {
                    return Math.floor(this.xp / 15);
                }
            }
        ].concat(new Array(84).fill(null).map(_ => ({
            playerId: this.getUUID(10),
            playerUsername: "BotTHE" + this.getUUID(Math.floor(Math.random() * 8) + 1),
            playerAvatar: null,
            xp: Math.floor(Math.random() * 2500) + 1,
            get level() {
                return Math.floor(this.xp / 75);
            },
            get messages() {
                return Math.floor(this.xp / 15);
            }
        })).concat(new Array(15).fill(null)));

        setTimeout(() => this.setState({ users }), 5000);
    }

    render() {
        const { users } = this.state;

        return (
            <Theme theme={rankTheme.provider}>
                <Main>
                    <Container maxWidth="md">
                        <Box sx={{ bgcolor: rankTheme.background, padding: "0px 15px 15px 15px", margin: "15px 0px", borderRadius: "15px" }}>
                            <RankLeaderboard users={users} />
                        </Box>
                    </Container>
                    <Container maxWidth="md">
                        <Typography variant="overline" display="block" gutterBottom sx={{ textAlign: "center", marginBottom: "15px" }}>
                            Zhorde Panacea by <Link href="https://github.com/Cannicide" underline="none" target="_blank" rel="noopener">Cannicide</Link>
                        </Typography>
                    </Container>
                </Main>
            </Theme>
        );
    }
}

export default Ranks;