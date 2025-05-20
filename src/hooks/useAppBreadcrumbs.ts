import { useLocation } from "react-router";

export interface AppBreadcrumb {
  label: string;
  href: string;
  isCurrent: boolean;
}

// Define a mapping for specific path segments to user-friendly names
const breadcrumbNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  applications: "Applications",
  // Add other specific mappings here as your app grows
  // e.g., 'settings': 'Settings', 'users': 'User Management'
};

export function useAppBreadcrumbs(): AppBreadcrumb[] {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean); // Filter out empty strings from split

  const breadcrumbs: AppBreadcrumb[] = [];
  let currentPath = "";

  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label =
      breadcrumbNameMap[segment.toLowerCase()] || // Check map first (case-insensitive)
      segment.charAt(0).toUpperCase() + segment.slice(1); // Fallback to capitalized segment
    
    const isCurrent = index === pathnames.length - 1;
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrent,
    });
  });

  return breadcrumbs;
}
