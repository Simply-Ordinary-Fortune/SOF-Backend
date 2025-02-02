export class User {
    constructor({ id, uuid, email, password, createdAt, sourceFile, updatedAt, syncStatus }) {
      this.id = id;
      this.uuid = uuid;
      this.email = email;
      this.password = password;
      this.createdAt = createdAt;
      this.sourceFile = sourceFile;
      this.updatedAt = updatedAt;
      this.syncStatus = syncStatus;
    }
  }
  
  