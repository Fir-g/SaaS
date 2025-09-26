// Simple store manager to clear all stores when user changes
import { useChatStore } from './chatStore';
import { useProjectStore } from './projectStore';
import { useExtractedDataStore } from './extractedStore';
import { useFileStore } from './fileStore';

export const clearAllStores = () => {
  // Clear chat store
  useChatStore.getState().clearCurrentChat();
  
  // Clear project store
  useProjectStore.getState().clearProjects();
  
  // Clear extracted data store
  const extractedStore = useExtractedDataStore.getState();
  // Clear all project data
  Object.keys(extractedStore.data).forEach(projectId => {
    extractedStore.clearData(projectId);
  });
  
  // Clear file store
  useFileStore.getState().clearFiles();
  
  console.log('All stores cleared for new user');
};
