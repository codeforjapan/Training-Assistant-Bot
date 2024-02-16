import type { Project, ProjectDetail } from '~/models/project';

export const useCopyProjectState = () => {
  const copiedProject = useState(
    'copiedProject',
    (): ProjectDetail | null => null,
  );

  return {
    copiedProject: readonly(copiedProject),
    setProject: (project: ProjectDetail) => {
      copiedProject.value = project;
    },
    resetProject: () => {
      copiedProject.value = null;
    },
  };
};
