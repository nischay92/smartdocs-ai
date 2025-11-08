import OpenAI from 'openai';
import { config } from '../config/config';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateSummary(text: string): Promise<{
    summary: string;
    keyPoints: string[];
    themes: string[];
  }> {
    try {
      const truncatedText = text.substring(0, 16000);

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that summarizes documents. 
            Provide a concise summary, key points, and main themes.`,
          },
          {
            role: 'user',
            content: `Please analyze this document and provide:
            1. A brief 2-3 sentence summary
            2. 3-5 key points (as bullet points)
            3. 2-5 main themes or topics

            Document text:
            ${truncatedText}

            Format your response as JSON:
            {
              "summary": "...",
              "keyPoints": ["...", "..."],
              "themes": ["...", "..."]
            }`,
          },
        ],
        temperature: config.openai.temperature,
        max_tokens: config.openai.maxTokens,
      });

      const content = response.choices[0].message.content || '{}';
      const result = JSON.parse(content);

      console.log('✅ Generated summary');

      return {
        summary: result.summary || 'No summary available',
        keyPoints: result.keyPoints || [],
        themes: result.themes || [],
      };
    } catch (error) {
      console.error('❌ Generate summary failed:', error);
      throw new Error(`Failed to generate summary: ${error}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const truncatedText = text.substring(0, 8000);

      const response = await this.client.embeddings.create({
        model: config.openai.embeddingModel,
        input: truncatedText,
      });

      const embedding = response.data[0].embedding;

      console.log(`✅ Generated embedding (${embedding.length} dimensions)`);

      return embedding;
    } catch (error) {
      console.error('❌ Generate embedding failed:', error);
      throw new Error(`Failed to generate embedding: ${error}`);
    }
  }

  async generateAnswer(
    question: string,
    context: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<string> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are a helpful assistant that answers questions based on provided document context. 
          Always cite which document or section your answer comes from.
          If the context doesn't contain relevant information, say so clearly.`,
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user',
          content: `Context from documents:
          ${context}

          Question: ${question}

          Please answer based on the context provided. Include source references.`,
        },
      ];

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const answer = response.choices[0].message.content || 'No answer generated';

      console.log('✅ Generated answer');

      return answer;
    } catch (error) {
      console.error('❌ Generate answer failed:', error);
      throw new Error(`Failed to generate answer: ${error}`);
    }
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have same dimensions');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }
}
