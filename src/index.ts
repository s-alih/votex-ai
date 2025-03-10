import * as express from "express";
import * as cors from "cors";
import userRoutes from "./routes/user.routes";
import voteRoutes from "./routes/vote.routes";
import agentRoutes from "./routes/agent.routes";
import daoRoutes from "./routes/daoRoutes";
import proposalRoutes from "./routes/proposal.routes";
import { initializeProposalCreatedListeners } from "./services/eventListener";
import { HistoricalDataService } from "./services/historicalDataService";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

// allowing cors
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Keep the debug middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (...args) {
    console.log("Response Headers:", res.getHeaders());
    return originalSend.apply(res, args);
  };
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/daos", daoRoutes);
app.use("/api/proposals", proposalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    // // Initialize event listeners
    await initializeProposalCreatedListeners();
    // console.log("🎧 DAO event listeners initialized");

    // // Start historical data collection
    // const historicalDataService = new HistoricalDataService();
    // await historicalDataService.startDataCollection();
    console.log("📊 Historical data collection service started");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
  }
});
