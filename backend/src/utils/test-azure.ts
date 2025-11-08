import { BlobServiceClient } from '@azure/storage-blob';
import { CosmosClient } from '@azure/cosmos';
import { config } from '../config/config';

async function testAzureConnections() {
  console.log('🧪 Testing Azure connections...\n');

  // Test Blob Storage
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      config.azure.storage.connectionString
    );
    const containerClient = blobServiceClient.getContainerClient(
      config.azure.storage.containerName
    );
    await containerClient.getProperties();
    console.log('✅ Blob Storage: Connected successfully');
  } catch (error) {
    console.error('❌ Blob Storage: Connection failed', error);
  }

  // Test Cosmos DB
  try {
    const cosmosClient = new CosmosClient({
      endpoint: config.azure.cosmos.endpoint,
      key: config.azure.cosmos.key,
    });
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: config.azure.cosmos.databaseName,
    });
    console.log('✅ Cosmos DB: Connected successfully');
    
    // List containers
    const { resources: containers } = await database.containers.readAll().fetchAll();
    console.log('   Containers:', containers.map(c => c.id).join(', '));
  } catch (error) {
    console.error('❌ Cosmos DB: Connection failed', error);
  }

  console.log('\n✨ Azure connection test complete!');
}

testAzureConnections();
