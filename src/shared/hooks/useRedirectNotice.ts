import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { notifyError, notifySuccess } from '../../utils/api';

const NOTICE_PARAM = 'notice';

type Notice = {
  messageKey: string;
  notify: (message: string) => void;
};

const NOTICES = new Map<string, Notice>([
  ['not-registered', { messageKey: 'notices.notRegistered', notify: notifyError }],
  ['account-created', { messageKey: 'notices.accountCreated', notify: notifySuccess }],
  ['account-deleted', { messageKey: 'notices.accountDeleted', notify: notifySuccess }],
]);

export function useRedirectNotice() {
  const { t } = useTranslation('auth');
  const [searchParams, setSearchParams] = useSearchParams();
  const handledCodeRef = useRef<string | null>(null);
  const code = searchParams.get(NOTICE_PARAM);

  useEffect(() => {
    if (!code || handledCodeRef.current === code) return;

    handledCodeRef.current = code;

    const notice = NOTICES.get(code);
    if (notice) notice.notify(t(notice.messageKey));

    const remaining = new URLSearchParams(searchParams);
    remaining.delete(NOTICE_PARAM);
    setSearchParams(remaining, { replace: true });
  }, [code, searchParams, setSearchParams, t]);
}
