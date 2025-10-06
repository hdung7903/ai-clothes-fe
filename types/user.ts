import type { ApiEnvelope } from './shared';

export interface UserRoleBase {
  roles: string[];
}

export interface UserProfileBase extends UserRoleBase {
  id: string;
  email: string;
  fullName: string;
  tokenCount: number;
  balance: number;
}

export type UserProfile = UserProfileBase;

export type GetProfileResponse = ApiEnvelope<UserProfile>;


