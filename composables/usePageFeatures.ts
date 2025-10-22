interface PageFeatures {
  chat?: boolean;
}

export const usePageFeatures = (features: PageFeatures) => {
  const pageFeatures = useState('pageFeatures', () => ({
    chat: false,
  }));

  pageFeatures.value = {
    ...pageFeatures.value,
    ...features,
  };

  return pageFeatures;
};