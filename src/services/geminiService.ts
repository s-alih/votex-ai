import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { AIAgent } from "../models/agent";
import { Proposal } from "../models/proposal";

interface VoteAnalysis {
  voteType: "FOR" | "AGAINST";
  voteReason: string;
  voteExplanation: string;
  aiAnalysis: string;
}

const VOTE_ANALYSIS_PROMPT = `You are an AI governance analyst. Analyze the proposal and make a voting decision based on the agent's preferences and historical voting patterns.

Consider the following:
1. Agent's governance strategy
2. Risk profile
3. Historical voting patterns
4. Proposal content and impact

Provide your response in the following JSON format ONLY:
{
  "voteType": "FOR" or "AGAINST",
  "voteReason": "A concise one-line reason for the vote",
  "voteExplanation": "A detailed paragraph explaining the rationale",
  "aiAnalysis": "A comprehensive analysis of potential impacts and considerations"
}

Do not include any other text or explanation outside of this JSON structure. The response should be valid JSON that can be parsed directly.`;

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Google API Key is required");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
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
  }

  async analyzeProposal(
    proposal: Proposal,
    agent: AIAgent,
    historicalVotes: any[],
    userVotes: any[]
  ): Promise<VoteAnalysis> {
    try {
      const context = this.buildContext(
        proposal,
        agent,
        historicalVotes,
        userVotes
      );

      const prompt = `${VOTE_ANALYSIS_PROMPT}\n\nContext:\n${context}`;
      console.log("Sending prompt to Gemini:", prompt);

      const result = await this.model.generateContent(prompt);
      const response = await result.response.text();
      console.log("Gemini raw response:", response);

      return this.parseJSONResponse(response);
    } catch (error) {
      console.error("Error in Gemini analysis:", error);
      return this.getDefaultAnalysis();
    }
  }

  private buildContext(
    proposal: Proposal,
    agent: AIAgent,
    historicalVotes: any[],
    userVotes: any[]
  ): string {
    return `
Analysis Context:
{
  "proposal": ${JSON.stringify(proposal, null, 2)},
  "agentPreferences": {
    "governanceStrategy": "${agent.governanceStrategy}",
    "riskProfile": ${agent.riskProfile},
    "voteAlignment": "${agent.voteAlignment}"
  },
  "historicalVotes": ${JSON.stringify(historicalVotes, null, 2)},
  "userVotes": ${JSON.stringify(userVotes, null, 2)}
}`;
  }

  private parseJSONResponse(response: string): VoteAnalysis {
    try {
      // Find JSON content between curly braces
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const jsonResponse = JSON.parse(jsonMatch[0]);

      // Validate the response structure
      if (!this.isValidVoteAnalysis(jsonResponse)) {
        throw new Error("Invalid response structure");
      }

      return {
        voteType: jsonResponse.voteType,
        voteReason: jsonResponse.voteReason,
        voteExplanation: jsonResponse.voteExplanation,
        aiAnalysis: jsonResponse.aiAnalysis,
      };
    } catch (error) {
      console.error("Error parsing Gemini JSON response:", error);
      return this.getDefaultAnalysis();
    }
  }

  private isValidVoteAnalysis(response: any): response is VoteAnalysis {
    return (
      response &&
      (response.voteType === "FOR" || response.voteType === "AGAINST") &&
      typeof response.voteReason === "string" &&
      typeof response.voteExplanation === "string" &&
      typeof response.aiAnalysis === "string"
    );
  }

  private getDefaultAnalysis(): VoteAnalysis {
    return {
      voteType: "AGAINST",
      voteReason: "API Error - defaulting to conservative vote",
      voteExplanation: "Unable to analyze proposal due to technical issues",
      aiAnalysis: "Analysis failed due to API error",
    };
  }
}
