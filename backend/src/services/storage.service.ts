import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { config } from '../config/config';

export class StorageService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor() {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      config.azure.storage.connectionString
    );
    this.containerClient = this.blobServiceClient.getContainerClient(
      config.azure.storage.containerName
    );
  }

  async uploadFile(
    userId: string,
    fileName: string,
    fileBuffer: Buffer
  ): Promise<string> {
    try {
      const blobName = `users/${userId}/documents/${fileName}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: this.getContentType(fileName),
        },
      });

      console.log(`✅ Uploaded: ${blobName}`);
      return blockBlobClient.url;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  async downloadFile(blobUrl: string): Promise<Buffer> {
    try {
      const blobName = this.getBlobNameFromUrl(blobUrl);
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      const downloadResponse = await blockBlobClient.download(0);
      const chunks: Buffer[] = [];

      if (downloadResponse.readableStreamBody) {
        for await (const chunk of downloadResponse.readableStreamBody) {
          chunks.push(Buffer.from(chunk));
        }
      }

      console.log(`✅ Downloaded: ${blobName}`);
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  async deleteFile(blobUrl: string): Promise<void> {
    try {
      const blobName = this.getBlobNameFromUrl(blobUrl);
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
      console.log(`✅ Deleted: ${blobName}`);
    } catch (error) {
      console.error('❌ Delete failed:', error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  async fileExists(blobUrl: string): Promise<boolean> {
    try {
      const blobName = this.getBlobNameFromUrl(blobUrl);
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      return await blockBlobClient.exists();
    } catch (error) {
      return false;
    }
  }

  async listUserFiles(userId: string): Promise<string[]> {
    try {
      const prefix = `users/${userId}/documents/`;
      const fileUrls: string[] = [];

      for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
        const blobClient = this.containerClient.getBlockBlobClient(blob.name);
        fileUrls.push(blobClient.url);
      }

      return fileUrls;
    } catch (error) {
      console.error('❌ List files failed:', error);
      throw new Error(`Failed to list files: ${error}`);
    }
  }

  private getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      txt: 'text/plain',
    };
    return contentTypes[extension || ''] || 'application/octet-stream';
  }

  private getBlobNameFromUrl(blobUrl: string): string {
    const url = new URL(blobUrl);
    const pathParts = url.pathname.split('/');
    return pathParts.slice(2).join('/');
  }
}
