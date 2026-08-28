export function SearchBar({ defaultValue = '', autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form action="/search" method="get" role="search" className="relative w-full">
      <label htmlFor="site-search" className="sr-only">
        商品名・ブランド・肌悩みで検索
      </label>
      <input
        id="site-search"
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="ブランド名、商品名、「毛穴」「鎮静」などで検索"
        className="w-full rounded-full border border-line bg-white py-3 pl-5 pr-24 text-[15px] outline-none placeholder:text-muted/70 focus:border-rose focus:ring-2 focus:ring-rose/20"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1.5 rounded-full bg-rose px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-deep"
      >
        検索
      </button>
    </form>
  );
}
