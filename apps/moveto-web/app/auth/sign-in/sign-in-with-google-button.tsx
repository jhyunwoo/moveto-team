export default function SignInWithGoogleButton() {
  return <a href={`${process.env.API_URL}/auth/google`}>Sign In with Google</a>;
}
