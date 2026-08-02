import { useState, useMemo } from 'react';

const PAGE_SIZE = 8;

export const useTableData = (data, searchFields = []) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((item) =>
      searchFields.some((getField) => {
        const value = getField(item);
        return value?.toString().toLowerCase().includes(term);
      })
    );
  }, [data, search, searchFields]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setSearchAndResetPage = (value) => {
    setSearch(value);
    setPage(1);
  };

  return {
    search,
    setSearch: setSearchAndResetPage,
    page,
    setPage,
    totalPages,
    paginated,
    totalCount: filtered.length,
  };
};