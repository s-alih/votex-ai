import * as express from "express";
import * as cors from "cors";
import userRoutes from "./routes/user.routes";
import voteRoutes from "./routes/vote.routes";
import agentRoutes from "./routes/agent.routes";
import daoRoutes from "./routes/daoRoutes";
import { initializeEventListeners } from "./services/eventListener";
import { HistoricalDataService } from "./services/historicalDataService";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", voteRoutes);
app.use("/api", agentRoutes);
app.use("/api", daoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    // // Initialize event listeners
    // await initializeEventListeners();
    // console.log("🎧 DAO event listeners initialized");

    // Start historical data collection
    const historicalDataService = new HistoricalDataService();
    await historicalDataService.startDataCollection();
    console.log("📊 Historical data collection service started");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
  }
});
