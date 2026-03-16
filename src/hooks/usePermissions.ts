'use client';

import { useEffect, useState } from 'react';

interface UserPermission {
  key: string;
  organizerId: string | null;
  projectId: string | null;
  eventId: string | null;
}

interface PermissionsState {
  permissions: UserPermission[];
  isLoading: boolean;
}

let cachedPermissions: UserPermission[] | null = null;
let permissionsPromise: Promise<UserPermission[]> | null = null;

async function fetchPermissions(): Promise<UserPermission[]> {
  if (cachedPermissions) return cachedPermissions;

  if (permissionsPromise) return permissionsPromise;

  permissionsPromise = fetch('/api/auth/permissions')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch permissions');
      return res.json();
    })
    .then((data: { permissions: UserPermission[] }) => {
      cachedPermissions = data.permissions;
      return data.permissions;
    })
    .catch(() => {
      permissionsPromise = null;
      return [];
    });

  return permissionsPromise;
}

/**
 * Hook to check if the current user has any of the specified permissions.
 * Uses OR logic: returns true if user has at least one of the permissions.
 *
 * @param requiredPermissions - Array of permission keys to check
 * @returns boolean - true if user has at least one permission
 */
export function usePermissions(requiredPermissions: string[]): boolean {
  const [state, setState] = useState<PermissionsState>({
    permissions: cachedPermissions || [],
    isLoading: !cachedPermissions,
  });

  useEffect(() => {
    if (cachedPermissions) {
      setState({ permissions: cachedPermissions, isLoading: false });
      return;
    }

    let mounted = true;

    fetchPermissions().then((permissions) => {
      if (mounted) {
        setState({ permissions, isLoading: false });
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (state.isLoading) {
    // While loading, return false to hide content
    return false;
  }

  if (requiredPermissions.length === 0) {
    return true;
  }

  // OR logic: return true if user has at least one of the required permissions
  return requiredPermissions.some((requiredKey) =>
    state.permissions.some((p) => p.key === requiredKey)
  );
}

/**
 * Hook to get all user permissions.
 * Useful for more complex permission logic.
 */
export function useAllPermissions(): { permissions: string[]; isLoading: boolean } {
  const [state, setState] = useState<PermissionsState>({
    permissions: cachedPermissions || [],
    isLoading: !cachedPermissions,
  });

  useEffect(() => {
    if (cachedPermissions) {
      setState({ permissions: cachedPermissions, isLoading: false });
      return;
    }

    let mounted = true;

    fetchPermissions().then((permissions) => {
      if (mounted) {
        setState({ permissions, isLoading: false });
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    permissions: state.permissions.map((p) => p.key),
    isLoading: state.isLoading,
  };
}

/**
 * Clears the permission cache.
 * Call this on logout or when permissions change.
 */
export function clearPermissionsCache(): void {
  cachedPermissions = null;
  permissionsPromise = null;
}
