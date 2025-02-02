export class BottleMessage {
    constructor({ id, senderId, receiverId, message, sentAt, sourceFile, updatedAt, syncStatus }) {
      this.id = id;
      this.senderId = senderId;
      this.receiverId = receiverId;
      this.message = message;
      this.sentAt = sentAt;
      this.sourceFile = sourceFile;
      this.updatedAt = updatedAt;
      this.syncStatus = syncStatus;
    }
  }
  