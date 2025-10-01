import React from 'react';

export const DiyaAnimation: React.FC = () => {
  return (
    <div className="diya-container fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Corner Diyas */}
      <div className="diya top-left" style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <div className="flame"></div>
      </div>
      <div className="diya top-right" style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <div className="flame"></div>
      </div>
      <div className="diya bottom-left" style={{ position: 'absolute', bottom: '100px', left: '20px' }}>
        <div className="flame"></div>
      </div>
      <div className="diya bottom-right" style={{ position: 'absolute', bottom: '100px', right: '20px' }}>
        <div className="flame"></div>
      </div>
    </div>
  );
};
