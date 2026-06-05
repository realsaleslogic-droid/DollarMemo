// Preview stubs for the server auth actions. The single-file preview is
// always in demo mode and has no backend, so these are inert.
export type AuthState = { error?: string } | undefined;
export async function signUp(): Promise<AuthState> {
  return { error: 'Sign up is unavailable in the preview.' };
}
export async function login(): Promise<AuthState> {
  return { error: 'Login is unavailable in the preview.' };
}
export async function loginWithGoogle(): Promise<void> {}
export async function logout(): Promise<void> {}
