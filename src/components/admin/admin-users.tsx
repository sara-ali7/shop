"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/state-views";
import { Pagination } from "@/components/shared/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { useAsync } from "@/hooks/use-async";
import { ApiError, getErrorMessage, isMissingRecord } from "@/lib/api/client";
import { getUser, getUsers } from "@/lib/api/users";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;

function accessMessage(error: unknown) {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "The API did not permit access to this resource for your account. This is an API limitation, not a bug.";
  }
  return getErrorMessage(error);
}

export function AdminUsersList() {
  const { data, error, loading, reload } = useAsync(getUsers, []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [search]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = data ?? [];
    if (!term) return list;
    return list.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
  }, [data, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHeader title="Users" description="Read-only. Passwords and tokens are never shown." />

      <div className="mb-4 grid max-w-sm gap-1.5">
        <Label htmlFor="admin-user-search">Search by name or email</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="admin-user-search" type="search" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && (
        <div role="status" aria-label="Loading users" className="grid gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}
      {error && <ErrorState title="Users are unavailable" message={accessMessage(error)} onRetry={reload} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title={search ? "No users match your search" : "No users found"}
          action={search ? { label: "Clear search", onClick: () => setSearch("") } : undefined}
        />
      )}
      {!loading && !error && filtered.length > 0 && (
        <>
          <ul className="grid gap-2">
            {rows.map((u) => (
              <li key={u.id}>
                <Card className="flex items-center gap-3 p-3">
                  <Avatar src={u.avatar} name={u.name} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/users/${u.id}`} className="block truncate font-medium hover:underline">
                      {u.name || "Unnamed user"}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge className="hidden sm:inline-flex">{u.role}</Badge>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/users/${u.id}`} aria-label={`View ${u.name || u.email}`}>View</Link>
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </>
      )}
    </>
  );
}

export function AdminUserDetail({ id }: { id: string }) {
  const valid = /^\d+$/.test(id);
  const { data, error, loading, reload } = useAsync(() => getUser(id), [id], valid);

  if (!valid || (error && isMissingRecord(error))) {
    return <EmptyState title="User not found" action={{ label: "Back to users", href: "/admin/users" }} />;
  }
  if (loading) {
    return (
      <div role="status" aria-label="Loading user" className="grid gap-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (error || !data) return <ErrorState title="User is unavailable" message={accessMessage(error)} onRetry={reload} />;

  return (
    <>
      <PageHeader title={data.name || "Unnamed user"} description={`User #${data.id}`} actions={<Button asChild variant="outline"><Link href="/admin/users">Back to users</Link></Button>} />
      <Card>
        <CardContent className="grid gap-6 p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar src={data.avatar} name={data.name} className="size-20 text-xl" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{data.name || "Unnamed user"}</p>
              <p className="truncate text-muted-foreground">{data.email}</p>
            </div>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-muted-foreground">Role</dt><dd className="mt-1"><Badge>{data.role}</Badge></dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd className="mt-1">{formatDate(data.creationAt)}</dd></div>
            <div><dt className="text-muted-foreground">Last updated</dt><dd className="mt-1">{formatDate(data.updatedAt)}</dd></div>
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
