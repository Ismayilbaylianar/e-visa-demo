import Dexie, { type EntityTable } from "dexie";

// IndexedDB for file storage
interface StoredFile {
  id: string;
  data: Blob;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

const db = new Dexie("eVisaDB") as Dexie & {
  files: EntityTable<StoredFile, "id">;
};

db.version(1).stores({
  files: "id, fileName, createdAt",
});

export { db };
export type { StoredFile };

// File storage helpers
export const fileStorage = {
  async saveFile(file: File): Promise<string> {
    const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.files.add({
      id,
      data: file,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      createdAt: new Date().toISOString(),
    });
    return id;
  },

  async getFile(id: string): Promise<StoredFile | undefined> {
    return db.files.get(id);
  },

  async getFileUrl(id: string): Promise<string | null> {
    const file = await db.files.get(id);
    if (!file) return null;
    return URL.createObjectURL(file.data);
  },

  async deleteFile(id: string): Promise<void> {
    await db.files.delete(id);
  },

  async clearAll(): Promise<void> {
    await db.files.clear();
  },
};
