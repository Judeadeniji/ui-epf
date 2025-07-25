import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationsTable } from "./applications-table";
import { useLoaderData, useSearchParams } from "react-router";
import { applicationsLoader } from "./loaders";
import { ApplicationsFilterToolbar } from "./applications-filter-toolbar";
import { useMemo, useState, useEffect } from "react"; // Added Fragment
import { Button } from "@/components/ui/button";
import { ApplicationFilter } from "@/lib/types";

export function ApplicationsPage() {
  const applications = useLoaderData<typeof applicationsLoader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilters, setActiveFilters] = useState<ApplicationFilter[]>(() => {
    const filtersParam = searchParams.get("filters");
    if (filtersParam) {
      try {
        return JSON.parse(filtersParam);
      } catch (e) {
        console.error("Failed to parse filters from URL:", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    const filtersParam = searchParams.get("filters");
    if (filtersParam) {
      try {
        setActiveFilters(JSON.parse(filtersParam));
      } catch (e) {
        console.error("Failed to parse filters from URL during effect:", e);
        setActiveFilters([]);
      }
    } else {
      setActiveFilters([]);
    }
  }, [searchParams]);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);


  const updateUrlParams = (newValues: Record<string, string | null>, resetPage: boolean = true) => {
    const currentSearchParams = new URLSearchParams(searchParams);
    for (const key in newValues) {
      if (newValues[key] === null || newValues[key] === '') {
        currentSearchParams.delete(key);
      } else {
        currentSearchParams.set(key, newValues[key] as string);
      }
    }
    if (resetPage) {
      currentSearchParams.set("page", "1");
    }
    setSearchParams(currentSearchParams, { replace: true });
  };

  const handleAddFilter = (filter: ApplicationFilter) => {
    const newFilters = [...activeFilters, filter];
    setActiveFilters(newFilters);
    updateUrlParams({ filters: JSON.stringify(newFilters) });
  };

  const handleRemoveFilter = (filterIndex: number) => {
    const newFilters = activeFilters.filter((_, index) => index !== filterIndex);
    setActiveFilters(newFilters);
    updateUrlParams({ filters: newFilters.length > 0 ? JSON.stringify(newFilters) : null });
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    updateUrlParams({ filters: null, search: null });
  };

  const applicationsOnPage = applications.status === true ? applications.data : [];
  const paginationMeta = applications.status === true && applications.meta;


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (paginationMeta ? paginationMeta.pageSize : 1)) {
      updateUrlParams({ page: newPage.toString() }, false);
    }
  };


  const displayedApplications = useMemo(() => {
    return applicationsOnPage;
  }, [applicationsOnPage]);


  return (
    <div className="flex flex-col min-h-screen bg-muted/40 p-4 sm:p-6 gap-y-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Applications</h1>
        <p className="mt-1 text-muted-foreground">
          View, filter, and manage all submitted applications.
        </p>
      </header>

      <ApplicationsFilterToolbar
        searchTerm={searchParams.get("search") || ""}
        onSearchTermChange={(newSearchTerm) => {
          updateUrlParams({ search: newSearchTerm });
        }}
        activeFilters={activeFilters}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
        onClearFilters={handleClearFilters}
      />

      <div className="flex-1 rounded-xl">
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle className="text-xl">All Applications</CardTitle>
            <CardDescription>
              Displaying {displayedApplications.length}
              {paginationMeta && ` of ${paginationMeta.totalItems} total applications.`}
              {paginationMeta && paginationMeta.totalPages > 0 && ` Page ${paginationMeta.currentPage} of ${paginationMeta.totalPages}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationsTable applications={
              applications.status === true
                ? {
                  status: true,
                  data: displayedApplications,
                  meta: paginationMeta || { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 }
                }
                : {
                  status: false,
                  error: applications.error || "Failed to load applications"
                }
            } />

            {paginationMeta && paginationMeta.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 py-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                {(() => {
                  const pageButtons = [];
                  const totalPages = paginationMeta.totalPages;
                  const pageRange = 2;
                  let lastButtonWasEllipsis = false;

                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      totalPages <= 5 || // Show all if 5 or less
                      i === 1 || // Always show first page
                      i === totalPages || // Always show last page
                      (i >= currentPage - pageRange && i <= currentPage + pageRange) // Show pages around current
                    ) {
                      pageButtons.push(
                        <Button
                          key={i}
                          variant={i === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(i)}
                        >
                          {i}
                        </Button>
                      );
                      lastButtonWasEllipsis = false;
                    } else if (!lastButtonWasEllipsis) {
                      pageButtons.push(<span key={`ellipsis-${i}`} className="px-1">...</span>);
                      lastButtonWasEllipsis = true;
                    }
                  }
                  return pageButtons;
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= paginationMeta.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}