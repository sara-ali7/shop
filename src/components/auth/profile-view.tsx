"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/state-views";
import { useAsync } from "@/hooks/use-async";
import { getProfile } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export function ProfileView() {
  const router = useRouter();
  const { logout } = useAuth();
  const { data: user, error, loading, reload } = useAsync(getProfile, []);

  if (loading) {
    return (
      <Card role="status" aria-label="Loading profile">
        <CardContent className="flex items-center gap-4 p-6">
          <Skeleton className="size-20 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !user) {
    return <ErrorState title="Could not load your profile" message={getErrorMessage(error)} onRetry={reload} />;
  }

  return (
    <Card>
      <CardContent className="grid gap-6 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatar} name={user.name} className="size-20 text-xl" />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold">{user.name || "Unnamed user"}</h2>
            <p className="truncate text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Account role</dt>
            <dd className="mt-1">
              <Badge>{user.role}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="mt-1">{formatDate(user.creationAt)}</dd>
          </div>
        </dl>
        <div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            <LogOut aria-hidden="true" />
            Log out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
