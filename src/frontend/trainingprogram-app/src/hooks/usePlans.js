import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';


export function usePlans(session) {
 
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchPlans = useCallback(async () => {
    const user = session?.user;
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Macrocycles")
        .select("*, Microcycles(*)")
        .eq("UserId", user.id);

      if (error) throw error;
      setPlans(data);
    } catch (err) {
      setError("Could not fetch the plans.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const deletePlan = async (planId) => {
    const { error } = await supabase
      .from("Macrocycles")
      .delete()
      .eq("Id", planId);

    if (error) {
      console.error("Error deleting plan:", error);
    } else {
      setPlans(currentPlans => currentPlans.filter(plan => plan.Id !== planId));
    }
  };

  const updatePlan = async (planId, updatedData) => {
    const { data, error } = await supabase
      .from("Macrocycles")
      .update(updatedData)
      .eq("Id", planId)
      .select();

    if (error) {
      console.error("Error updating plan:", error);
    } else {
      setPlans(currentPlans => currentPlans.map(plan => (plan.Id === planId ? data[0] : plan)));
    }
  };

  return { plans, loading, error, deletePlan, updatePlan };
}