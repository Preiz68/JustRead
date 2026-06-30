import { AuthenticatedUser } from "./authenticated-user";

export type TokenUser = Pick<AuthenticatedUser, "id" | "email" | "username">;
