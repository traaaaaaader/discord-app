let globalNavigate: ((path: string) => void) | null = null;

export const setGlobalNavigate = (navigate: (path: string) => void) => {
  globalNavigate = navigate;
};

export const getGlobalNavigate = () => {
  return globalNavigate;
};