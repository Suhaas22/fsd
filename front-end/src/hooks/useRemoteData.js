import { useCallback, useEffect, useState } from 'react';
import { api } from '../utils/api';
export function useRemoteData(path) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((n) => n + 1), []);
  useEffect(() => {
    const changed = () => refresh();
    window.addEventListener('account-changed', changed);
    window.addEventListener('learning-data-changed', changed);
    window.addEventListener('focus', changed);
    return () => {
      window.removeEventListener('account-changed', changed);
      window.removeEventListener('learning-data-changed', changed);
      window.removeEventListener('focus', changed);
    };
  }, [refresh]);
  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    api
      .get(path)
      .then((data) => {
        if (active) setState({ data, loading: false, error: '' });
      })
      .catch((e) => {
        if (active)
          setState({
            data: null,
            loading: false,
            error: e.message || 'Unable to load records.',
          });
      });
    return () => {
      active = false;
    };
  }, [path, revision]);
  return { ...state, refresh };
}
