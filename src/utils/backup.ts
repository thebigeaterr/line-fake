// データ喪失防止バックアップシステム
interface BackupData {
  timestamp: string;
  data: unknown;
  version: string;
}

export class DataProtectionBackup {
  private static BACKUP_KEY = 'line-fake-emergency-backup';
  private static MAX_BACKUPS = 10;

  // データを複数の場所にバックアップ
  static async createBackup(data: unknown) {
    const timestamp = new Date().toISOString();
    const backupData = {
      timestamp,
      data,
      version: '1.0'
    };

    try {
      // 1. ローカルストレージにバックアップ
      const existingBackups = this.getLocalBackups();
      existingBackups.unshift(backupData);
      
      // 最大10個まで保持
      if (existingBackups.length > this.MAX_BACKUPS) {
        existingBackups.splice(this.MAX_BACKUPS);
      }
      
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(existingBackups));

      // 2. IndexedDBにバックアップ
      await this.saveToIndexedDB(backupData);

      // 3. 外部ストレージにバックアップ（GitHub Gist API使用）
      await this.saveToGithubGist(backupData);

      console.log('Emergency backup created successfully:', timestamp);
      return true;
    } catch (error) {
      console.error('Emergency backup failed:', error);
      return false;
    }
  }

  // ローカルストレージからバックアップを取得
  static getLocalBackups(): BackupData[] {
    try {
      const backups = localStorage.getItem(this.BACKUP_KEY);
      return backups ? JSON.parse(backups) : [];
    } catch (error) {
      console.error('Failed to get local backups:', error);
      return [];
    }
  }

  // IndexedDBにバックアップを保存
  private static async saveToIndexedDB(backupData: BackupData): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LineFakeBackup', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['backups'], 'readwrite');
        const store = transaction.objectStore('backups');
        
        store.put(backupData, backupData.timestamp);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups');
        }
      };
    });
  }

  // GitHub Gistにバックアップを保存（匿名）
  private static async saveToGithubGist(backupData: BackupData): Promise<void> {
    try {
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `LINE-fake backup ${backupData.timestamp}`,
          public: false,
          files: {
            'backup.json': {
              content: JSON.stringify(backupData, null, 2)
            }
          }
        })
      });

      if (response.ok) {
        const gist = await response.json();
        console.log('Backup saved to GitHub Gist:', gist.html_url);
        
        // Gist URLをローカルストレージに保存
        const gistUrls = JSON.parse(localStorage.getItem('line-fake-gist-urls') || '[]');
        gistUrls.unshift({
          url: gist.html_url,
          timestamp: backupData.timestamp
        });
        localStorage.setItem('line-fake-gist-urls', JSON.stringify(gistUrls));
      }
    } catch (error) {
      console.error('Failed to save to GitHub Gist:', error);
    }
  }

  // IndexedDBからバックアップを復元
  static async restoreFromIndexedDB(): Promise<BackupData[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LineFakeBackup', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['backups'], 'readonly');
        const store = transaction.objectStore('backups');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };
        
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups');
        }
      };
    });
  }

  // 全てのバックアップソースから復元
  static async getAllBackups(): Promise<BackupData[]> {
    const allBackups: BackupData[] = [];

    // ローカルストレージから
    const localBackups = this.getLocalBackups();
    allBackups.push(...localBackups);

    // IndexedDBから
    try {
      const indexedBackups = await this.restoreFromIndexedDB();
      allBackups.push(...indexedBackups);
    } catch (error) {
      console.error('Failed to restore from IndexedDB:', error);
    }

    // 重複を除去してタイムスタンプでソート
    const uniqueBackups = allBackups.filter((backup, index, self) => 
      index === self.findIndex(b => b.timestamp === backup.timestamp)
    );

    return uniqueBackups.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}