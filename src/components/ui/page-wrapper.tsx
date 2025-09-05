type PageWrapperPropsType = {
  header: string;
  description: string;
  children?: React.ReactNode;
};

const PageWrapper = ({
  header,
  description,
  children,
}: PageWrapperPropsType) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="text-gray-800 text-2xl sm:text-2xl lg:text-3xl font-semibold">{header}</div>
        <p className="text-gray-500 text-muted-foreground text-sm sm:text-base">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
};
export default PageWrapper;
