'use client';

import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

/**
 * SearchInput
 *
 * - 검색어를 입력하고 Enter(또는 모바일 키보드 검색 버튼)를 누르면
 *   onSearch 콜백이 실행
 * - 입력 중에는 onSearch가 호출되지 않음(글자 다입력하고 enter or 클릭)
 * - 내부에서 입력 상태를 관리하는 재사용 컴포넌트
 *
 * 사용 예:
 * <SearchInput onSearch={(query) => console.log(query)} />
 */
type SearchInputProps = {
  /** 검색 실행 시 호출되는 콜백 */
  onSearch: (query: string) => void;

  /** 입력창 placeholder (기본값 제공) */
  placeholder?: string;
};

export default function SearchInput({
  onSearch,
  placeholder = '이름으로 검색해 보세요',
}: SearchInputProps) {
  // 입력 중인 검색어 (내부 상태)
  const [value, setValue] = useState('');

  /**
   * form submit 핸들러
   * - PC: Enter 키
   * - 모바일 웹: 키보드 "검색" 버튼
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const query = value.trim();
    if (!query) return;

    onSearch(query);

    // 모바일 웹에서 검색 후 키보드 닫기
    document.activeElement instanceof HTMLElement &&
      document.activeElement.blur();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        {}
        <Search
          className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400"
          aria-hidden
        />

        {/* 검색 입력창 */}
        <input
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-full border border-gray-200 bg-white py-3.5 pr-4 pl-12 shadow-sm transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </form>
  );
}
