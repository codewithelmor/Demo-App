import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import { useMutation, useQuery, type QueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router'
import { Button, LinkButton } from '@/components/ui/button'
import { AccountLayout } from '@/features/profile/account-nav'
import { profileQuery, signOutEverywhere } from '@/features/profile/profile-api'
import { useEndSession } from '@/hooks/use-end-session'
import { formatDateTime } from '@/lib/dates'
import { apiErrorMessage } from '@/lib/error-message'
import { ApiError } from '@/lib/problem-details'

/** A route loader: React Router runs it before the page shows, so the data is already loading when the page appears. Starts loading the profile. */
export function accountLoader(queryClient: QueryClient) {
  return () => {
    // Not awaited: the page renders its loading state while the request runs.
    queryClient.query(profileQuery).catch(() => undefined)
    return null
  }
}

/** True when the page was opened right after saving the profile (passed in the history state). */
function savedFlag(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'saved' in state && state.saved === true
}

/**
 * CU-7 (EP-35)
 * The "My account" page: shows the profile and links to edit, change password and delete.
 */
export function AccountRoute() {
  const location = useLocation()
  const { data, error, isPending, isError, refetch, isFetching } = useQuery(profileQuery)

  return (
    <AccountLayout>
      <title>My account · Orders Shop</title>
      <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
        My account
      </h1>
      {/* Always in the page, so the message is announced when it appears. */}
      <p role="status" className="min-h-5 small">
        {savedFlag(location.state) ? 'Profile saved.' : ''}
      </p>

      {isPending && <p role="status">Loading your profile…</p>}

      {isError && error instanceof ApiError && error.status === 404 && (
        <Alert severity="error" role="alert">
          We could not find your account.
        </Alert>
      )}
      {isError && !(error instanceof ApiError && error.status === 404) && (
        <Alert severity="error" role="alert" className="gap-2">
          <p>{apiErrorMessage(error)}</p>
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() => {
              void refetch()
            }}
          >
            {isFetching ? 'Trying again…' : 'Try again'}
          </Button>
        </Alert>
      )}

      {data && (
        <Paper
          component="section"
          variant="outlined"
          aria-labelledby="profile-heading"

          className="d-grid gap-2"
          sx={{ p: 2 }}
        >
          <h2 id="profile-heading" className="fs-5 fw-medium">
            Profile
          </h2>
          <dl className="kv-grid small">
            <dt className="fw-medium">Name</dt>
            <dd>
              {data.profile.firstName} {data.profile.lastName}
            </dd>
            <dt className="fw-medium">Email</dt>
            <dd>
              {data.profile.email}
              <span className="d-block text-body-secondary">
                To change your email, contact support.
              </span>
            </dd>
            <dt className="fw-medium">Phone</dt>
            <dd>{data.profile.phone ?? 'Not added'}</dd>
            <dt className="fw-medium">Member since</dt>
            <dd>{formatDateTime(data.profile.createdAt)}</dd>
          </dl>
          <div>
            <LinkButton to="/account/edit">Edit profile</LinkButton>
          </div>
        </Paper>
      )}

      <SignOutEverywhere />
    </AccountLayout>
  )
}

/**
 * CU-7, US-F036 (EP-07). The BFF deletes this session and the API revokes the other sessions' tokens,
 * so they end on their next refresh. The cart on this device is cleared, as for any sign out.
 */
function SignOutEverywhere() {
  const endSession = useEndSession()
  const mutation = useMutation({
    mutationFn: signOutEverywhere,
    // Like Sign out: the BFF removes the session even when the API call fails.
    onSettled: () => endSession('signed-out', { clearCart: true }),
  })

  return (
    <Paper
      component="section"
      variant="outlined"
      aria-labelledby="everywhere-heading"

      className="d-grid gap-2"
      sx={{ p: 2 }}
    >
      <h2 id="everywhere-heading" className="fs-5 fw-medium">
        Sign out everywhere
      </h2>
      <p className="small">
        Ends your session on every device. Other devices are signed out the next time they refresh.
      </p>
      <div>
        <Button
          variant="outline"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
          onClick={() => {
            mutation.mutate()
          }}
        >
          {mutation.isPending ? 'Signing out…' : 'Sign out everywhere'}
        </Button>
      </div>
    </Paper>
  )
}
