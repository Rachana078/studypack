import AuthForm from '@/components/auth/AuthForm'

export const dynamic = 'force-dynamic'

export default function LoginPage({ searchParams }: { searchParams: { message?: string } }) {
  return <AuthForm mode="login" successMessage={searchParams.message} />
}
