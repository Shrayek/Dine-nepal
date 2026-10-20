export { }

declare global {
  type UserRole = "admin" | "user"

  interface UserPublicMetadata {
    role?: UserRole
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CustomJwtSessionClaims {
		metadata?: UserPublicMetadata
	}
}
