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
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="text-gray-800 text-3xl font-semibold">{header}</div>
        <p className="text-gray-500 text-muted-foreground text-md">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
};
export default PageWrapper;
