import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  // Functional components cannot be ErrorBoundaries in React yet,
  // but we use this as a placeholder to fix TS build errors.
  return <>{children}</>;
};

export default ErrorBoundary;
