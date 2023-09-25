import Page from "./Page";

export default class Home extends Page {
    render() {
        return (
            <>
                <h1>Zhorde Panacea Homepage</h1>
                <p>This homepage is currently under construction.</p>
                <p>Perhaps you meant to go to one of the following pages:</p>
                <ul>
                    <li><a href="/ranks" style={{color: "#29b6f6"}}>Discord Rank Leaderboard</a></li>
                </ul>
            </>
        );
    }
};