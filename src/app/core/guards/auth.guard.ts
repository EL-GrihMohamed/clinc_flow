import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getProfile().pipe(
    // if the call succeeds, the token is valid → allow navigation
    map(res => {
      if (res.success) {
        auth.setRoles([res?.user?.role?.toLowerCase() || '']);
        return true;
      }
      return false;
    }),

    // if it errors (e.g. 401), redirect to /login
    catchError(() =>
      of(
        router.createUrlTree(
          ['/auth/login'],
          { queryParams: { returnUrl: state.url } }
        )
      )
    )
  );
};
