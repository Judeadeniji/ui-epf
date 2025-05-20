import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationsTable } from "./applications-table";
import { useLoaderData } from "react-router";
import { dashboardLoader } from "./loaders"; // Assuming you might reuse or adapt the loader
import { ApplicationsFilterToolbar, ApplicationFilter } from "./applications-filter-toolbar";
import { useMemo, useState } from "react";

export function ApplicationsPage() {
  // If you have a specific loader for all applications, use that instead of dashboardLoader
  const { applications: initialApplications } = useLoaderData<typeof dashboardLoader>();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<ApplicationFilter[]>([]);
  // TODO: Add state for sorting (column, direction)
  // TODO: Add state for pagination (currentPage, itemsPerPage)

  const handleAddFilter = (filter: ApplicationFilter) => {
    setActiveFilters(prev => [...prev, filter]);
  };

  const handleRemoveFilter = (filterIndex: number) => {
    setActiveFilters(prev => prev.filter((_, index) => index !== filterIndex));
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    setSearchTerm("");
  };

  // Filter and sort logic - this is a basic example
  const filteredApplications = useMemo(() => {
    let apps = "data" in initialApplications ? initialApplications.data : [];

    // Search term filtering (simple search across a few fields)
    if (searchTerm) {
      apps = apps.filter(app =>
        `${app.application.firstname} ${app.application.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application.matriculation_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Active filters
    activeFilters.forEach(filter => {
      apps = apps.filter(app => {
        let valueToTest: string | undefined;
        switch (filter.field) {
          case 'status':
            valueToTest = app.application_hash.status;
            break;
          case 'department':
            valueToTest = app.application.department;
            break;
          case 'applicantName': // Example: combining fields for a filter
             valueToTest = `${app.application.surname} ${app.application.firstname}`;
            break;
          case 'matriculationNumber':
            valueToTest = app.application.matriculation_number;
            break;
          // Add more cases for other filterable fields from your schema
        }
        if (valueToTest === undefined) return false;
        // This is a simple 'equals' check. You might need 'contains', 'startsWith', etc.
        return valueToTest.toLowerCase() === filter.value.toLowerCase();
      });
    });
    
    // TODO: Implement sorting logic here
    // TODO: Implement pagination logic here (slice the array based on currentPage and itemsPerPage)

    return { ...initialApplications, data: apps }; // Maintain the original structure

  }, [initialApplications, searchTerm, activeFilters]);

  return (
    <div className="flex flex-col min-h-screen bg-muted/40 p-4 sm:p-6 gap-y-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Applications</h1>
        <p className="mt-1 text-muted-foreground">
          View, filter, and manage all submitted applications.
        </p>
      </header>

      <ApplicationsFilterToolbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
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
              A comprehensive list of all applications. Found {filteredApplications.data?.length || 0} results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationsTable applications={filteredApplications} />
            {/* TODO: Add Pagination Controls here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}