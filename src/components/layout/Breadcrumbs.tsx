import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { platformItems, type NavItem } from "../../config/nav";

const allItems: NavItem[] = platformItems;

function findBreadcrumbItems(
  pathname: string,
  items: NavItem[],
  currentPath: { title: string; path: string }[] = [],
): { title: string; path: string }[] | null {
  for (const item of items) {
    const newPath = [...currentPath, { title: item.title, path: item.path }];

    if (item.path === pathname) {
      return newPath;
    }

    if (item.items) {
      const result = findBreadcrumbItems(pathname, item.items, newPath);
      if (result) return result;
    }
  }

  return null;
}

export function Breadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  let breadcrumbs: { title: string; path: string }[] | null = null;

  breadcrumbs = findBreadcrumbItems(pathname, allItems);

  if (!breadcrumbs) {
    breadcrumbs = [{ title: "Page not found", path: pathname }];
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            {index === breadcrumbs!.length - 1 ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.title}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
