interface CurrentPageState {
  title: string;
}
export const useCurrentPageState = () => {
  const state = useState('currentPageState', () => ({
    title: '',
  }));

  return {
    state: readonly(state),
    setState: (newState: CurrentPageState) => {
      state.value = newState;
    },
  };
};
