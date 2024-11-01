// src/components/Tabs.tsx

import React from 'react';

interface TabsProps {
  tabs: { name: string; content: React.ReactNode }[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <div className="mb-8">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-2 px-4 -mb-px border-b-2 font-medium text-sm focus:outline-none ${
              activeTab === index
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="pt-4">{tabs[activeTab].content}</div>
    </div>
  );
};

export default Tabs;
