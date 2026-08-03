import { useEffect, useRef } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

interface UseFormGuardOptions {
  isDirty: boolean;
  message?: string;
}

export function useFormGuard({ isDirty, message = 'Você tem alterações não salvas. Deseja realmente sair?' }: UseFormGuardOptions) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  useBeforeUnload(
    (e) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = message;
      return message;
    },
    { capture: true },
  );

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmed = window.confirm(message);
      if (confirmed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, message]);

  return { blocker };
}
