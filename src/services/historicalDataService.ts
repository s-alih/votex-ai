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
    this.snapshotApiUrl = "https://hub.snapshot.org/graphql";
  }

  async startDataCollection() {
    // Run every 6 hours
    // cron.schedule("0 */6 * * *", async () => {
    //   console.log("🔄 Starting historical data collection...");
    try {
      await this.collectTallyData();
      // await this.collectSnapshotData();
      console.log("✅ Historical data collection completed");
    } catch (error) {
      console.error("❌ Error collecting historical data:", error);
    }
    // });
  }

  private async collectTallyData() {
    const query = `
      query Proposals {
        proposals(
          chainId: "eip155:1",
          pagination: { limit: 10 }
        ) {
          id
          title
          description
          status
          votes {
            id
            voter {
              address
            }
            support
            weight
            reason
          }
          governor {
            name
            id
            type
            chainId
          }
          quorum
          eta
          createdAt
        }
      }
    `;

    const response = await axios.post(
      "https://api.tally.xyz/query",
      {
        query,
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
        updatedAt: proposal.eta,
        governorName: proposal.governor?.name,
        governorId: proposal.governor?.id,
        quorum: proposal.quorum,
      });
    }
  }

  private async collectSnapshotData() {
    const query = `
      query {
        proposals (
          first: 20,
          skip: 0,
          where: {
            state: "closed"
          },
          orderBy: "created",
          orderDirection: "desc"
        ) {
          id
          title
          body
          choices
          start
          end
          snapshot
          state
          scores
          scores_total
          author
          space {
            id
            name
          }
          votes {
            id
            voter
            choice
            reason
            vp
            created
          }
        }
      }
    `;

    const response = await axios.post(this.snapshotApiUrl, {
      query,
    });

    const proposals = response.data.data.proposals;
    console.log("Snapshot proposals", proposals);
    for (const proposal of proposals) {
      await this.chromaService.storeHistoricalVote({
        id: proposal.id,
        source: "snapshot",
        title: proposal.title,
        description: proposal.body,
        choices: proposal.choices,
        scores: proposal.scores,
        totalScore: proposal.scores_total,
        space: proposal.space,
        author: proposal.author,
        votes: proposal.votes,
        createdAt: proposal.start,
        updatedAt: proposal.end,
        state: proposal.state,
        snapshot: proposal.snapshot,
      });
    }
  }
}
