interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${tab.id === activeTab ? 'tab--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          role="tab"
          aria-selected={tab.id === activeTab}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
