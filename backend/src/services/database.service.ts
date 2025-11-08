import { CosmosClient, Database, Container } from '@azure/cosmos';
import { config } from '../config/config';
import { Document, User } from '../types/types';

export class DatabaseService {
  private client: CosmosClient;
  private database: Database;
  private documentsContainer: Container;
  private usersContainer: Container;

  constructor() {
    this.client = new CosmosClient({
      endpoint: config.azure.cosmos.endpoint,
      key: config.azure.cosmos.key,
    });
    this.database = this.client.database(config.azure.cosmos.databaseName);
    this.documentsContainer = this.database.container('documents');
    this.usersContainer = this.database.container('users');
  }

  // ==================== DOCUMENT OPERATIONS ====================

  async createDocument(document: Document): Promise<Document> {
    try {
      const { resource } = await this.documentsContainer.items.create(document);
      console.log(`✅ Created document: ${document.id}`);
      return resource as Document;
    } catch (error) {
      console.error('❌ Create document failed:', error);
      throw new Error(`Failed to create document: ${error}`);
    }
  }

  async getDocument(documentId: string, userId: string): Promise<Document | null> {
    try {
      const { resource } = await this.documentsContainer
        .item(documentId, userId)
        .read<Document>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) return null;
      console.error('❌ Get document failed:', error);
      throw new Error(`Failed to get document: ${error}`);
    }
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.uploadedAt DESC',
        parameters: [{ name: '@userId', value: userId }],
      };
      const { resources } = await this.documentsContainer.items
        .query<Document>(querySpec)
        .fetchAll();
      return resources;
    } catch (error) {
      console.error('❌ Get user documents failed:', error);
      throw new Error(`Failed to get user documents: ${error}`);
    }
  }

  async updateDocument(document: Document): Promise<Document> {
    try {
      const { resource } = await this.documentsContainer
        .item(document.id, document.userId)
        .replace(document);
      console.log(`✅ Updated document: ${document.id}`);
      return resource as Document;
    } catch (error) {
      console.error('❌ Update document failed:', error);
      throw new Error(`Failed to update document: ${error}`);
    }
  }

  async deleteDocument(documentId: string, userId: string): Promise<void> {
    try {
      await this.documentsContainer.item(documentId, userId).delete();
      console.log(`✅ Deleted document: ${documentId}`);
    } catch (error) {
      console.error('❌ Delete document failed:', error);
      throw new Error(`Failed to delete document: ${error}`);
    }
  }

  async searchDocuments(userId: string, searchTerm: string): Promise<Document[]> {
    try {
      const querySpec = {
        query: `
          SELECT * FROM c 
          WHERE c.userId = @userId 
          AND (
            CONTAINS(LOWER(c.fileName), LOWER(@term)) OR
            CONTAINS(LOWER(c.summary), LOWER(@term))
          )
          ORDER BY c.uploadedAt DESC
        `,
        parameters: [
          { name: '@userId', value: userId },
          { name: '@term', value: searchTerm },
        ],
      };
      const { resources } = await this.documentsContainer.items
        .query<Document>(querySpec)
        .fetchAll();
      return resources;
    } catch (error) {
      console.error('❌ Search documents failed:', error);
      throw new Error(`Failed to search documents: ${error}`);
    }
  }

  // ==================== USER OPERATIONS ====================

  async createUser(user: User): Promise<User> {
    try {
      const { resource } = await this.usersContainer.items.create(user);
      console.log(`✅ Created user: ${user.id}`);
      return resource as User;
    } catch (error) {
      console.error('❌ Create user failed:', error);
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const { resource } = await this.usersContainer.item(userId, userId).read<User>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) return null;
      console.error('❌ Get user failed:', error);
      throw new Error(`Failed to get user: ${error}`);
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: email }],
      };
      const { resources } = await this.usersContainer.items
        .query<User>(querySpec)
        .fetchAll();
      return resources[0] || null;
    } catch (error) {
      console.error('❌ Get user by email failed:', error);
      throw new Error(`Failed to get user by email: ${error}`);
    }
  }

  async updateUser(user: User): Promise<User> {
    try {
      const { resource } = await this.usersContainer.item(user.id, user.id).replace(user);
      console.log(`✅ Updated user: ${user.id}`);
      return resource as User;
    } catch (error) {
      console.error('❌ Update user failed:', error);
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.usersContainer.item(userId, userId).delete();
      console.log(`✅ Deleted user: ${userId}`);
    } catch (error) {
      console.error('❌ Delete user failed:', error);
      throw new Error(`Failed to delete user: ${error}`);
    }
  }
}
