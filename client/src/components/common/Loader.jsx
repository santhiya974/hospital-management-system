const Loader = ({ fullScreen = false, size = 'md' }) => {
  const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <div
      className={`${sizeMap[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return <div className="flex items-center justify-center min-h-screen">{spinner}</div>;
  }

  return <div className="flex items-center justify-center py-8">{spinner}</div>;
};

export default Loader;