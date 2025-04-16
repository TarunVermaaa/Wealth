import React from 'react'

const AuthLayout = ({ children }) => {
  return (
    <div>
      <div className="flex items-center justify-center h-screen">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout