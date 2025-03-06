import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { AIAgent } from "../models/agent";
import { Proposal } from "./aiService";

interface VoteAnalysis {
  voteType: "FOR" | "AGAINST";
  voteReason: string;
  voteExplanation: string;
  aiAnalysis: string;
}

const VOTE_ANALYSIS_PROMPT = `
Analyze the proposal and make a voting decision based on the agent's preferences and historical voting patterns.
Consider the following:
1. Agent's governance strategy
2. Risk profile
3. Historical voting patterns
4. Proposal content and impact

Provide a structured response with:
- Vote decision (FOR/AGAINST)
- Brief reason for the vote
- Detailed explanation
- Comprehensive analysis of potential impacts
`;

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async analyzeProposal(
    proposal: Proposal,
    agent: AIAgent,
    historicalVotes: any[],
    userVotes: any[]
  ): Promise<VoteAnalysis> {
    const context = this.buildContext(
      proposal,
      agent,
      historicalVotes,
      userVotes
    );

    const result = await this.model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${VOTE_ANALYSIS_PROMPT}\n\nContext:\n${context}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const response = result.response.text();
    return this.parseResponse(response);
  }

  private buildContext(
    proposal: Proposal,
    agent: AIAgent,
    historicalVotes: any[],
    userVotes: any[]
  ): string {
    return `
Proposal:
${JSON.stringify(proposal, null, 2)}

Agent Preferences:
- Governance Strategy: ${agent.governanceStrategy}
- Risk Profile: ${agent.riskProfile}
- Vote Alignment: ${agent.voteAlignment}

Historical Similar Votes:
${JSON.stringify(historicalVotes, null, 2)}

User's Previous Votes:
${JSON.stringify(userVotes, null, 2)}
    `;
  }

  private parseResponse(response: string): VoteAnalysis {
    // TODO: Implement more robust parsing
    const lines = response.split("\n");
    let voteType: "FOR" | "AGAINST" = "FOR";
    let voteReason = "";
    let voteExplanation = "";
    let aiAnalysis = "";

    for (const line of lines) {
      if (line.includes("Vote:")) {
        voteType = line.includes("AGAINST") ? "AGAINST" : "FOR";
      } else if (line.includes("Reason:")) {
        voteReason = line.split("Reason:")[1].trim();
      } else if (line.includes("Explanation:")) {
        voteExplanation = line.split("Explanation:")[1].trim();
      } else if (line.includes("Analysis:")) {
        aiAnalysis = line.split("Analysis:")[1].trim();
      }
    }

    return {
      voteType,
      voteReason,
      voteExplanation,
      aiAnalysis,
    };
  }
}
