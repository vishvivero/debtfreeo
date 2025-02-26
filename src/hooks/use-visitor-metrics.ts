
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PageVisit {
  path: string;
  visits: number;
}

export const useVisitorMetrics = () => {
  return useQuery({
    queryKey: ["visitor-metrics"],
    queryFn: async () => {
      console.log("Fetching visitor metrics");
      
      // Base query for visits
      let query = supabase
        .from("website_visits")
        .select("*", { count: 'exact' });

      const { data: visits, error: visitsError, count: totalVisits } = await query;

      if (visitsError) {
        console.error("Error fetching visits:", visitsError);
        throw visitsError;
      }

      console.log("Raw visits data:", visits);

      // Get unique visitors count
      const uniqueVisitorIds = new Set(visits?.map(visit => visit.visitor_id));

      // Get total profiles count with detailed logging
      console.log("Fetching profiles count...");
      const { data: profilesData, count: totalProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (profilesError) {
        console.error("Error fetching profiles count:", profilesError);
        throw profilesError;
      }

      console.log("Profiles data:", profilesData);
      console.log("Total profiles count:", totalProfiles);

      // Get total debts count
      const { count: totalDebts, error: debtsError } = await supabase
        .from('debts')
        .select('*', { count: 'exact' });

      if (debtsError) {
        console.error("Error fetching debts count:", debtsError);
        throw debtsError;
      }

      // Process visit trends
      const visitsByDate = visits?.reduce((acc: { [key: string]: number }, visit) => {
        const date = new Date(visit.visited_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Calculate page visits
      const pageVisits: PageVisit[] = Object.entries(
        visits?.reduce((acc: { [key: string]: number }, visit) => {
          const path = visit.path || '/';
          acc[path] = (acc[path] || 0) + 1;
          return acc;
        }, {}) || {}
      ).map(([path, visits]) => ({ path, visits }));

      const visitTrends = Object.entries(visitsByDate || {}).map(([date, visits]) => ({
        date,
        visits
      })).sort((a, b) => a.date.localeCompare(b.date));

      console.log("Processed visit trends:", visitTrends);
      console.log("Processed page visits:", pageVisits);

      return {
        totalVisits,
        uniqueVisitors: uniqueVisitorIds.size,
        totalDebts,
        totalProfiles,
        visitTrends,
        pageVisits,
        geoData: visits?.map(visit => ({
          latitude: visit.latitude,
          longitude: visit.longitude,
          country: visit.country,
          city: visit.city,
          value: 1
        })).filter(location => location.latitude && location.longitude) || []
      };
    }
  });
};
