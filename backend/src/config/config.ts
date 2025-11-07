import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
    maxTokens: 2000,
    temperature: 0.7,
  },

  // Azure Blob Storage
  azure: {
    storage: {
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'documents',
    },
    cosmos: {
      endpoint: process.env.COSMOS_DB_ENDPOINT || '',
      key: process.env.COSMOS_DB_KEY || '',
      databaseName: process.env.COSMOS_DB_DATABASE_NAME || 'smartdocs',
      containerName: process.env.COSMOS_DB_CONTAINER_NAME || 'documents',
    },
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || '').split(','),
    uploadDir: './uploads',
  },
};

export function validateConfig(): void {
  const requiredVars = ['OPENAI_API_KEY'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('WARNING: Missing environment variables:', missingVars.join(', '));
    console.warn('Some features may not work until these are configured.');
  }

  if (config.openai.apiKey) {
    console.log('SUCCESS: OpenAI API key configured');
  }

  if (config.azure.storage.connectionString) {
    console.log('SUCCESS: Azure Storage configured');
  }

  if (config.azure.cosmos.endpoint) {
    console.log('SUCCESS: Cosmos DB configured');
  }
}
