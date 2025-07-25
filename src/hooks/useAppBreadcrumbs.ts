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
  settings: "Settings",
};

export function useAppBreadcrumbs(): AppBreadcrumb[] {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  const breadcrumbs: AppBreadcrumb[] = [];
  let currentPath = "";

  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    let resolvedLabel: string;

    const mappedName = breadcrumbNameMap[segment.toLowerCase()];
    if (mappedName) {
      resolvedLabel = mappedName;
    } else {
      // Check if the segment looks like an ID.
      // This regex matches UUIDs or numeric strings of 5 or more digits.
      // Adjust it based on your application's specific ID patterns.
      const idRegex = /^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$|^\d{5,}$/;
      if (idRegex.test(segment)) {
        // Replace ID-like segments with a generic placeholder.
        resolvedLabel = "Application Details";
      } else {
        // Fallback to capitalizing the segment if it's not in the map and not an ID
        resolvedLabel = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
    }

    const isCurrent = index === pathnames.length - 1;

    breadcrumbs.push({
      label: resolvedLabel,
      href: currentPath,
      isCurrent,
    });
  });

  return breadcrumbs;
}
