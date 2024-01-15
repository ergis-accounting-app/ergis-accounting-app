import { OpenAI } from "openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

export default async (req, res) => {
    const polymerScanRawData = req.body.polymerScan;

    if (!polymerScanRawData) {
        return res.status(400).send("Missing polymerScan data");
    }

    // Combining LDPE and PP sections into one text
    const polymerScan = "LDPE report: \n" + polymerScanRawData[0].textContent + "\n Polypropylene report: \n" + polymerScanRawData[1].textContent;

    try {
        const model = new OpenAI({
            modelName: "gpt-4-1106-preview",
            temperature: 0.2,
        });

        const template = "Please act and respond as an analyst. Please take a look at the report below and summarize the information about the European LDPE market and the European polypropylene market. Please format your answer in Polish. Report: {polymerScanText}";
        const prompt = new PromptTemplate({ template, inputVariables: ["polymerScanText"] });

        const chain = new LLMChain({ llm: model, prompt });

        const result = await chain.call({ polymerScanText: polymerScan });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error occurred:", error.message);
        console.error("Stack Trace:", error.stack);

        res.status(500).send("An internal server error occurred");
    }
};