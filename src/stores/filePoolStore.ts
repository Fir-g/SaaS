import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PooledFile {
  id: string;
  name: string;
  type: string;
  project_id: string;
  uploaded_at: string;
}

interface FilePoolStore {
  pooledFiles: PooledFile[];
  
  // Actions
  addFileToPool: (file: PooledFile) => void;
  removeFileFromPool: (fileId: string) => void;
  getFilesByProject: (projectId: string) => PooledFile[];
  clearProjectFiles: (projectId: string) => void;
  clearAllFiles: () => void;
}

export const useFilePoolStore = create<FilePoolStore>()(
  persist(
    (set, get) => ({
      pooledFiles: [],
      
      addFileToPool: (file) => {
        console.log('Adding file to pool:', file);
        set((state) => ({ 
          pooledFiles: [...state.pooledFiles, file] 
        }));
      },
      
      removeFileFromPool: (fileId) => 
        set((state) => ({ 
          pooledFiles: state.pooledFiles.filter(f => f.id !== fileId) 
        })),
      
      getFilesByProject: (projectId) => {
        const files = get().pooledFiles.filter(f => f.project_id === projectId);
        console.log(`Getting files for project ${projectId}:`, files);
        return files;
      },
      
      clearProjectFiles: (projectId) => 
        set((state) => ({ 
          pooledFiles: state.pooledFiles.filter(f => f.project_id !== projectId) 
        })),
      
      clearAllFiles: () => 
        set({ pooledFiles: [] }),
    }),
    {
      name: 'file-pool-storage',
      partialize: (state) => ({ pooledFiles: state.pooledFiles }),
    }
  )
);
