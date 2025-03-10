"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const user_routes_1 = require("./routes/user.routes");
const vote_routes_1 = require("./routes/vote.routes");
const agent_routes_1 = require("./routes/agent.routes");
const daoRoutes_1 = require("./routes/daoRoutes");
const proposal_routes_1 = require("./routes/proposal.routes");
const eventListener_1 = require("./services/eventListener");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", user_routes_1.default);
app.use("/api/votes", vote_routes_1.default);
app.use("/api/agents", agent_routes_1.default);
app.use("/api/daos", daoRoutes_1.default);
app.use("/api/proposals", proposal_routes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        // // Initialize event listeners
        await (0, eventListener_1.initializeProposalCreatedListeners)();
        // console.log("🎧 DAO event listeners initialized");
        // // Start historical data collection
        // const historicalDataService = new HistoricalDataService();
        // await historicalDataService.startDataCollection();
        console.log("📊 Historical data collection service started");
    }
    catch (error) {
        console.error("❌ Failed to initialize services:", error);
    }
});
