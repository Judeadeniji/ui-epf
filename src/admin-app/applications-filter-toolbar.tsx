import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicationFilter } from '@/lib/types';
import { SearchInput } from '@/components/search-input';

// Define available filter fields based on your application schema
// This is a simplified example. You'll need to expand this.
const filterableFields = [
  { id: 'status', name: 'Status', options: ['pending', 'approved', 'rejected'], type: 'select' },
  { id: 'department', name: 'Department', type: 'text' }, // Could be a select with dynamic options
  { id: 'applicantName', name: 'Applicant Name', type: 'text' },
  { id: 'matriculationNumber', name: 'Matriculation No.', type: 'text' },
];


interface ApplicationsFilterToolbarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  activeFilters: ApplicationFilter[];
  onAddFilter: (filter: ApplicationFilter) => void;
  onRemoveFilter: (filterIndex: number) => void;
  onClearFilters: () => void;
}

export function ApplicationsFilterToolbar({
  searchTerm,
  onSearchTermChange,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
}: ApplicationsFilterToolbarProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [selectedField, setSelectedField] = React.useState<string>(filterableFields[0].id);
  const [filterValue, setFilterValue] = React.useState('');

  const handleAddFilter = () => {
    if (selectedField && filterValue) {
      onAddFilter({ field: selectedField, value: filterValue });
      setFilterValue('');
      setPopoverOpen(false);
    }
  };
  
  const currentFieldConfig = filterableFields.find(f => f.id === selectedField);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-4 border-b bg-card">
      <SearchInput onSearchChange={onSearchTermChange} value={searchTerm} />
      
      <div className="flex items-center gap-2">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1">
              <FilterIcon className="h-4 w-4" />
              Filter ({activeFilters.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Add Filter</h4>
                <p className="text-sm text-muted-foreground">
                  Select a field and value to filter by.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="filter-field">Field</Label>
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger id="filter-field" className='w-full'>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterableFields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentFieldConfig && (
                 <div className="grid gap-2">
                    <Label htmlFor="filter-value">Value</Label>
                    {currentFieldConfig.type === 'select' && currentFieldConfig.options ? (
                        <Select value={filterValue} onValueChange={setFilterValue}>
                            <SelectTrigger id="filter-value" className='w-full'>
                                <SelectValue placeholder={`Select ${currentFieldConfig.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {currentFieldConfig.options.map(option => (
                                    <SelectItem key={option} value={option}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            id="filter-value"
                            placeholder={`Enter ${currentFieldConfig.name}...`}
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                        />
                    )}
                </div>
              )}
              <Button onClick={handleAddFilter}>Add Filter</Button>
            </div>
          </PopoverContent>
        </Popover>
        {activeFilters.length > 0 && (
          <Button variant="ghost" onClick={onClearFilters} className="text-red-500 hover:text-red-600">
            <XIcon className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
      {activeFilters.length > 0 && (
        <div className="w-full col-span-full flex flex-wrap gap-2 py-2">
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5"
            >
              {filterableFields.find(f => f.id === filter.field)?.name || filter.field}: {filter.value}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full"
                onClick={() => onRemoveFilter(index)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
