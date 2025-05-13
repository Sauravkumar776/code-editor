import { supabase } from './supabase';
import { Project, EditorContent } from '../types';

export const createProject = async (
  userId: string,
  title: string,
  description: string,
  content: EditorContent,
  isPublic: boolean = false
): Promise<string> => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title,
      description,
      content,
      user_id: userId,
      is_public: isPublic,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data as Project;
};

export const updateProject = async (
  projectId: string,
  updates: Partial<Project>
): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (error) throw error;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
};

export const getUserProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as Project[];
};

export const getPublicProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as Project[];
};

export const forkProject = async (
  projectId: string,
  userId: string
): Promise<string> => {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found');

  return createProject(
    userId,
    `${project.title} (Fork)`,
    project.description,
    project.content,
    false
  );
};