import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Project, EditorContent } from '../types';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'projects';

export const createProject = async (userId: string, title: string, description: string, content: EditorContent): Promise<string> => {
  const project: Omit<Project, 'id'> = {
    title,
    description,
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    userId
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), project);
  return docRef.id;
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  const docRef = doc(db, COLLECTION_NAME, projectId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Project;
  }
  
  return null;
};

export const updateProject = async (projectId: string, data: Partial<Project>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, projectId);
  await updateDoc(docRef, { ...data, updatedAt: Date.now() });
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, projectId);
  await deleteDoc(docRef);
};

export const getUserProjects = async (userId: string): Promise<Project[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const projects: Project[] = [];
  
  querySnapshot.forEach((doc) => {
    projects.push({ id: doc.id, ...doc.data() } as Project);
  });
  
  return projects;
};

export const createAnonymousProject = (content: EditorContent): Project => {
  return {
    id: uuidv4(),
    title: 'Untitled Project',
    description: '',
    content,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
};