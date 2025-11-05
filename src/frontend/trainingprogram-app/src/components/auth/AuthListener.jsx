import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

function AuthListener({ setSession, setIsPasswordRecovery }) {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        navigate('/update-password');
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, setSession, setIsPasswordRecovery]);

  return null; 
}

export default AuthListener;