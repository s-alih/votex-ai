import { ChromaService } from "./chromaService";
import axios from "axios";
import * as cron from "node-cron";

export class HistoricalDataService {
  private chromaService: ChromaService;
  private tallyApiKey: string;
  private snapshotApiUrl: string;

  constructor() {
    this.chromaService = new ChromaService();
    this.tallyApiKey = process.env.TALLY_API_KEY || "";
    this.snapshotApiUrl = "https://api.snapshot.org/graphql";
  }

  async startDataCollection() {
    // Run every 6 hours
    // cron.schedule("0 */6 * * *", async () => {
    //   console.log("🔄 Starting historical data collection...");
    try {
      await this.collectTallyData();
      await this.collectSnapshotData();
      console.log("✅ Historical data collection completed");
    } catch (error) {
      console.error("❌ Error collecting historical data:", error);
    }
    // });
  }

  private async collectTallyData() {
    const query = `
      query Proposals($first: Int!) {
        proposals(first: $first) {
          id
          title
          description
          status
          votes {
            id
            voter {
              address
            }
            type
            reason
            amount
          }
          createdAt
          updatedAt
        }
      }
    `;

    const response = await axios.post(
      "https://api.tally.xyz/query",
      {
        query,
        variables: { first: 100 },
      },
      {
        headers: {
          "Api-Key": this.tallyApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const proposals = response.data.data.proposals;
    console.log("Tally proposals", proposals);
    for (const proposal of proposals) {
      await this.chromaService.storeHistoricalVote({
        id: proposal.id,
        source: "tally",
        title: proposal.title,
        description: proposal.description,
        votes: proposal.votes,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt,
      });
    }
  }

  private async collectSnapshotData() {
    const query = `
      query Proposals($first: Int!) {
        proposals(first: $first) {
          id
          title
          body
          state
          votes {
            id
            voter
            choice
            reason
            vp
          }
          created
          updated
        }
      }
    `;

    const response = await axios.post(this.snapshotApiUrl, {
      query,
      variables: { first: 100 },
    });

    const proposals = response.data.data.proposals;
    console.log("Snapshot proposals", proposals);
    for (const proposal of proposals) {
      await this.chromaService.storeHistoricalVote({
        id: proposal.id,
        source: "snapshot",
        title: proposal.title,
        description: proposal.body,
        votes: proposal.votes,
        createdAt: proposal.created,
        updatedAt: proposal.updated,
      });
    }
  }
}
