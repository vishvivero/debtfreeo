
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user's ID
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the payment details from the request
    const { debtId, amount, paymentType, nextPaymentDate } = await req.json();
    
    console.log(`Processing payment for debt ${debtId}: ${amount}`);

    if (!debtId || !amount) {
      throw new Error('Missing required fields: debtId and amount are required');
    }

    // Get the debt details
    const { data: debt, error: debtError } = await supabaseClient
      .from('debts')
      .select('*')
      .eq('id', debtId)
      .single();

    if (debtError) {
      throw debtError;
    }

    if (debt.user_id !== user.id) {
      throw new Error('Unauthorized: This debt does not belong to the current user');
    }

    // Calculate the new balance
    // Account for interest that would be applied before payment
    const monthlyInterest = debt.interest_rate / 100 * debt.balance / 12;
    const newBalance = Math.max(0, debt.balance - (amount - monthlyInterest));
    
    // Determine if debt is now paid off
    const isPaidOff = newBalance <= 0;
    
    // Record the payment in the payment history
    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from('payment_history')
      .insert({
        user_id: user.id,
        debt_id: debtId,
        amount: amount,
        payment_date: new Date().toISOString(),
        payment_type: paymentType || 'regular',
        currency_symbol: debt.currency_symbol
      })
      .select()
      .single();
      
    if (paymentError) {
      throw paymentError;
    }

    // Update the debt record
    const { data: updatedDebt, error: updateError } = await supabaseClient
      .from('debts')
      .update({
        balance: newBalance,
        next_payment_date: nextPaymentDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: isPaidOff ? 'paid' : 'active',
        closed_date: isPaidOff ? new Date().toISOString() : null,
      })
      .eq('id', debtId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Return the updated debt and payment record
    return new Response(
      JSON.stringify({
        success: true,
        payment: paymentRecord,
        debt: updatedDebt
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error recording debt payment:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
