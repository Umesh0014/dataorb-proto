"use client";

// TabsRow — shared tab strip. Tab labels render as `Label (count)` when
// the tab supplies a count, otherwise just `Label`. Pass `action` to
// render a right-aligned slot (e.g. a primary CTA) on the same row.
export default function TabsRow({ tabs, activeTab, onTabClick, action = null }) {
  return (
    <div className="w-full h-[42px] flex items-end justify-between border-b border-border-tab">
      <div className="flex items-end">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const showCount = tab.count !== null && tab.count !== undefined;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabClick?.(tab.id)}
              className={`relative font-sans font-medium text-[14px] leading-[24px] bg-transparent border-none cursor-pointer ${
                isActive ? "text-tab-active" : "text-tab-inactive"
              }`}
              style={{ padding: "9px 16px" }}
            >
              {showCount ? `${tab.label} (${tab.count})` : tab.label}
              {isActive && (
                <span
                  className="absolute left-0 right-0 bg-tab-active"
                  style={{ bottom: -1, height: 2 }}
                />
              )}
            </button>
          );
        })}
      </div>
      {action && <div className="flex items-center pb-1">{action}</div>}
    </div>
  );
}
