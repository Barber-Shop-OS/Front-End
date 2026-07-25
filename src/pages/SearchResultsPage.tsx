import SearchFilters from "@/features/barbershops/components/SearchFilters";
import ResultsGrid from "@/features/barbershops/components/ResultsGrid";
import AppLayout from "@/layouts/AppLayout";

const SearchResultsPage = (): JSX.Element => {
  return (
    <AppLayout>
      <SearchFilters />
      <ResultsGrid />
    </AppLayout>
  );
};

export default SearchResultsPage;