export class Record {
    constructor({ id, userId, content, createdAt, sourceFile, updatedAt, syncStatus, imageUrl, tags }) {
      this.id = id;
      this.userId = userId;
      this.content = content;
      this.createdAt = createdAt;
      this.sourceFile = sourceFile;
      this.updatedAt = updatedAt;
      this.syncStatus = syncStatus;
      this.imageUrl = imageUrl;
      this.tags = tags; // JSON array (e.g., ["tag1", "tag2"])
    }
  }
  
  