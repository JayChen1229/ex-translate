import { GoogleGenAI, Type } from "@google/genai";
import { RelationshipContext, SenderType, TranslationResponse } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    true_meaning: {
      type: Type.STRING,
      description: "The translated meaning in FIRST PERSON perspective. Approx 2 sentences. Toxic and localized.",
    },
    toxicity_level: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating how toxic the message is.",
    },
  },
  required: ["true_meaning", "toxicity_level"],
};

export const translateExMessage = async (
  message: string,
  context: RelationshipContext,
  sender: SenderType
): Promise<TranslationResponse> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    你是一個極度毒舌、說話難聽的「前任心聲翻譯機」。
    你的任務是：用**兩句**最靠北的台灣在地口語，翻譯出前任訊息背後的渣男/渣女真心話。

    **核心要求**：
    1. **長度控制**：**請回覆兩句話** (約 30~50 字)。第一句嗆爆對方，第二句講出殘酷真相。
    2. **第一人稱**：必須用「我」、「林北」、「老娘」視角，這是我心裡的話。
    3. **台灣口語**：大量使用台灣流行語 (是在哈囉、笑死、可悲、去死、魯蛇、ATM、塑膠)。
    4. **語氣**：極度缺德、不留情面、極度自私、字越髒越好。

    情境參數：
    - 前任角色：${sender}
    - 關係狀態：${context}

    **正確範例 (請這樣寫)**：
    輸入：哈哈哈
    翻譯：笑死，隨便敷衍你兩句還當真喔？我正在跟新對象爽，你慢慢等吧。

    輸入：我們還是當朋友吧
    翻譯：看到你就想吐，但不想把話說死。留著你當備胎，哪天沒人幹還能找你湊合。

    輸入：最近很忙
    翻譯：是在哈囉？我是忙著跟別人打炮，哪有美國時間理你這個魯蛇。

    輸入：早點睡
    翻譯：老娘要掛電話跟別人視訊了，你快滾去睡。別妨礙我釣新的凱子，懂不懂啊？
    
    輸入：你很好，是我不夠好
    翻譯：你很好騙，但我已經玩膩了想換口味。拜託你有點自知之明，快點滾好嗎？

    **絕對禁止**：
    - 禁止分析心理狀態 (例如：他覺得...)
    - 禁止只有一句話太短，也禁止寫成作文
    - 禁止溫柔、解釋性文字
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 1.6, // Higher creativity for slang variation
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as TranslationResponse;
    }
    
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};