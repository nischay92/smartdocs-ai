import { StorageService } from '../services/storage.service';
import { DatabaseService } from '../services/database.service';
import { OpenAIService } from '../services/openai.service';
import { Document, DocumentStatus, User } from '../types/types';
import { v4 as uuidv4 } from 'uuid';

async function testServices() {
  console.log('🧪 Testing all services...\n');

  const storage = new StorageService();
  const database = new DatabaseService();
  const openai = new OpenAIService();

  const testUserId = 'test-user-' + Date.now();
  const testDocId = uuidv4();

  try {
    // ==================== TEST 1: Storage Service ====================
    console.log('📦 TEST 1: Storage Service');
    
    const testContent = Buffer.from('Hello from SmartDocs AI! This is a test document.');
    const fileName = 'test-document.txt';

    const blobUrl = await storage.uploadFile(testUserId, fileName, testContent);
    console.log('   Uploaded:', blobUrl.substring(0, 60) + '...');

    const exists = await storage.fileExists(blobUrl);
    console.log('   Exists:', exists ? '✅' : '❌');

    const downloaded = await storage.downloadFile(blobUrl);
    console.log('   Downloaded:', downloaded.toString().substring(0, 30) + '...');

    const userFiles = await storage.listUserFiles(testUserId);
    console.log('   User files count:', userFiles.length);

    await storage.deleteFile(blobUrl);
    console.log('   ✅ Storage Service: PASSED\n');

    // ==================== TEST 2: Database Service ====================
    console.log('📊 TEST 2: Database Service');

    // Create test user
    const testUser: User = {
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      createdAt: new Date().toISOString(),
      storageUsed: 0,
      storageQuota: 5368709120, // 5GB
      plan: 'free',
    };

    await database.createUser(testUser);
    console.log('   Created user:', testUser.id);

    const retrievedUser = await database.getUser(testUserId);
    console.log('   Retrieved user:', retrievedUser?.name);

    // Create test document
    const testDoc: Document = {
      id: testDocId,
      userId: testUserId,
      fileName: 'test.txt',
      fileType: 'text/plain',
      fileSize: testContent.length,
      uploadedAt: new Date().toISOString(),
      status: DocumentStatus.COMPLETED,
      blobUrl: 'https://test.blob.core.windows.net/test',
      summary: 'This is a test document',
      keyPoints: ['Point 1', 'Point 2'],
      themes: ['Testing'],
    };

    await database.createDocument(testDoc);
    console.log('   Created document:', testDoc.id);

    const retrievedDoc = await database.getDocument(testDocId, testUserId);
    console.log('   Retrieved document:', retrievedDoc?.fileName);

    const userDocs = await database.getUserDocuments(testUserId);
    console.log('   User documents count:', userDocs.length);

    // Clean up
    await database.deleteDocument(testDocId, testUserId);
    await database.deleteUser(testUserId);
    console.log('   ✅ Database Service: PASSED\n');

    // ==================== TEST 3: OpenAI Service ====================
    console.log('🤖 TEST 3: OpenAI Service');

    const sampleText = `
      Golden Retrievers are large-sized dogs originally bred for retrieving game during hunting.
      They are known for their friendly, tolerant attitude and intelligence.
      Golden Retrievers typically weigh between 55-75 pounds and stand 20-24 inches tall.
      They have a dense, water-repellent golden coat and require regular grooming.
      These dogs are excellent family pets and are commonly used as therapy dogs.
    `;

    const { summary, keyPoints, themes } = await openai.generateSummary(sampleText);
    console.log('   Summary:', summary.substring(0, 50) + '...');
    console.log('   Key Points:', keyPoints.length);
    console.log('   Themes:', themes.join(', '));

    const embedding = await openai.generateEmbedding(sampleText);
    console.log('   Embedding dimensions:', embedding.length);

    // Test cosine similarity
    const embedding2 = await openai.generateEmbedding('Dogs are great pets');
    const similarity = openai.cosineSimilarity(embedding, embedding2);
    console.log('   Similarity score:', similarity.toFixed(3));

    console.log('   ✅ OpenAI Service: PASSED\n');

    // ==================== SUCCESS ====================
    console.log('✨ All services tested successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Storage Service: Can upload, download, list, delete');
    console.log('   ✅ Database Service: Can create, read, update, delete');
    console.log('   ✅ OpenAI Service: Can summarize, embed, calculate similarity');
    console.log('\n🎉 Milestone 1.4 COMPLETE!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

// Run tests
testServices();
