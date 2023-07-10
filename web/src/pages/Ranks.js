import * as React from "react";
import RankLeaderboard from "../components/RankLeaderboard";
import { Theme, rankTheme } from "../theme";

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
                xp: 50,
                level: 0
            }
        ].concat(new Array(84).fill(null).map(_ => ({
            playerId: this.getUUID(10),
            playerUsername: "BotTHE" + this.getUUID(Math.floor(Math.random() * 8) + 1),
            playerAvatar: null,
            xp: Math.floor(Math.random() * 2500) + 1,
            get level() {
                return Math.floor(this.xp / 75);
            }
        })).concat(new Array(15).fill(null)));

        setTimeout(() => this.setState({ users }), 5000);
    }

    render() {
        const { users } = this.state;

        return (
            <Theme theme={rankTheme.provider}>
                <div style={{background: rankTheme.background, color: rankTheme.color, width: "100%", height: "100%", position: "fixed", top: "0", left: "0", overflowY: "auto"}}>
                    <h1>RANKS page</h1>
                    <RankLeaderboard users={users} />
                </div>
            </Theme>
        );
    }
}

export default Ranks;