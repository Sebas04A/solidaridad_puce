import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/usersService';
import type { CreateUserDTO } from '../types/users.types';

export const USERS_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_KEYS.all, 'list'] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEYS.lists(),
    queryFn: usersService.getAll,
  });
}

export function usePuceSearch() {
  return useMutation({
    mutationFn: usersService.searchPuceUser,
  });
}

export function useImportUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserDTO) => usersService.importUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => 
      usersService.toggleStatus(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}

export function useDeactivateUsers() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => usersService.deactivateUsers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}
