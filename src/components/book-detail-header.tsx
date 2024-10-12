import React, {useMemo} from 'react';
import {FaChevronLeft} from 'react-icons/fa';
import {FontSizeSelector} from "./font-size-selector.tsx";

interface HeaderOption {
  id: string;
  component: React.FC<{ isOpen: boolean; onToggle: () => void }>;
}

interface BookHeaderProps {
  title: string;
  onBack: () => void;
  showHeader: boolean;
  fontSize: string;
  onFontSizeChange: (size: string) => void;
  openOptionId: string | null;
  setOpenOptionId: (id: string | null) => void;
}

const BookDetailHeader: React.FC<BookHeaderProps> = ({
                                                       title,
                                                       onBack,
                                                       showHeader,
                                                       fontSize,
                                                       onFontSizeChange,
                                                       openOptionId,
                                                       setOpenOptionId
                                                     }) => {
  const headerOptions: HeaderOption[] = useMemo(() => [
    {
      id: 'fontSize',
      component: ({isOpen, onToggle}) => (
        <FontSizeSelector
          isOpen={isOpen}
          onToggle={onToggle}
          currentSize={fontSize}
          onSizeChange={onFontSizeChange}
        />
      ),
    },
    // Add more header options here as needed
  ], [fontSize, onFontSizeChange]);

  return (
    <header
      className={`px-4 text-gray-800 h-16 flex items-center justify-between bg-gray-50 border-b shadow-sm fixed w-full top-0 transition-transform duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex items-center gap-8">
        <button className="text-2xl hover:text-gray-600" onClick={onBack}>
          <FaChevronLeft/>
        </button>
        <span className="text-lg">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        {headerOptions.map((option) => (
          <option.component
            key={option.id}
            isOpen={openOptionId === option.id}
            onToggle={() => setOpenOptionId(openOptionId === option.id ? null : option.id)}
          />
        ))}
      </div>
    </header>
  );
};

export default React.memo(BookDetailHeader);
