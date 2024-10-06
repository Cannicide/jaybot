import { WithId, Document, MongoClient, ServerApiVersion } from 'mongodb';
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}?${process.env.DB_PARAMS}`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

// Connect the client to the server	(optional starting in v4.7)
await client.connect();
console.log("Pinged your deployment. You successfully connected to MongoDB!");

// Export database collections

export function collection(database: string, collection: string) {
    return client.db(database).collection(collection);
}

export const reactionRolesDB = collection("misc", "reactionroles");
export const statCategoryDB = collection("stats", "categories");
export const statUptimeDB = collection("stats", "uptime");
export const playerRanksDB = collection("players", "ranks");
export const playerRankWinnersDB = collection("players", "rankwinners");

// Export interfaces

export interface ReactionRole extends WithId<Document> {
    messageId: string;
    reactionId: string;
    roleName: string;
}

export interface StatCategory extends WithId<Document> {
    categoryId: string;
    isDestroyable: boolean;
}

export interface StatUptime extends WithId<Document> {
    timestamp: Date;
    online: boolean;
    players: number;
    maxPlayers: number;
}

export interface PlayerRank extends WithId<Document> {
    cooldown: number;
    customColor: string;
    level: number;
    levelMonthly: number;
    messages: number;
    monthTimestamp: number;
    playerAvatar: string;
    playerId: string;
    playerUsername: string;
    xp: number;
    xpMonthly: number;
}

export interface PlayerRankWinner extends WithId<Document> {
    firstUsername: string;
    secondUsername: string;
    thirdUsername: string;
    month: number;
    year: number;
}