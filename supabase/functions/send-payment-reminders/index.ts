
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { Resend } from "npm:resend@2.0.0";

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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not configured');
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting payment reminder check...");

    // Get current date in ISO format (YYYY-MM-DD)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFormatted = today.toISOString().split('T')[0];

    // Calculate date for advance reminders (typically 3 days before)
    const advanceReminderDate = new Date(today);
    advanceReminderDate.setDate(today.getDate() + 3); // Default is 3 days ahead
    const advanceReminderDateFormatted = advanceReminderDate.toISOString().split('T')[0];

    console.log(`Checking reminders for today (${todayFormatted}) and advance (${advanceReminderDateFormatted})`);

    // Get all users with payment reminders enabled
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, payment_reminders_enabled, reminder_days_before, preferred_currency')
      .eq('payment_reminders_enabled', true);

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    console.log(`Found ${users.length} users with reminders enabled`);

    let remindersSent = 0;
    let errors = 0;

    // Process each user
    for (const user of users) {
      try {
        if (!user.email) {
          console.log(`User ${user.id} has no email address, skipping`);
          continue;
        }

        // Calculate custom advance reminder date based on user preference
        const userAdvanceReminderDate = new Date(today);
        userAdvanceReminderDate.setDate(today.getDate() + (user.reminder_days_before || 3));
        const userAdvanceReminderDateFormatted = userAdvanceReminderDate.toISOString().split('T')[0];

        // Get user's debts with next payment date either today or on advance reminder date
        const { data: debts, error: debtsError } = await supabase
          .from('debts')
          .select('id, name, banker_name, balance, minimum_payment, next_payment_date, currency_symbol')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .or(`next_payment_date.eq.${todayFormatted},next_payment_date.eq.${userAdvanceReminderDateFormatted}`);

        if (debtsError) {
          console.error(`Error fetching debts for user ${user.id}: ${debtsError.message}`);
          continue;
        }

        if (!debts.length) {
          console.log(`No upcoming payments for user ${user.id}`);
          continue;
        }

        // Group debts by payment date
        const todayDebts = debts.filter(debt => {
          const debtDate = debt.next_payment_date?.split('T')[0];
          return debtDate === todayFormatted;
        });

        const advanceDebts = debts.filter(debt => {
          const debtDate = debt.next_payment_date?.split('T')[0];
          return debtDate === userAdvanceReminderDateFormatted;
        });

        // Send "day of" reminders
        if (todayDebts.length > 0) {
          const reminderType = 'day_of';

          // Check if reminders were already sent today
          for (const debt of todayDebts) {
            const reminderDate = debt.next_payment_date?.split('T')[0];
            if (!reminderDate) continue;

            // Check if we already sent this reminder
            const { data: existingReminder } = await supabase
              .from('payment_reminders')
              .select('id')
              .eq('user_id', user.id)
              .eq('debt_id', debt.id)
              .eq('payment_date', reminderDate)
              .eq('reminder_type', reminderType)
              .maybeSingle();

            if (existingReminder) {
              console.log(`Already sent ${reminderType} reminder for debt ${debt.id}`);
              continue;
            }

            // Format email content
            const formattedAmount = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: debt.currency_symbol === '£' ? 'GBP' : 
                      debt.currency_symbol === '€' ? 'EUR' : 
                      debt.currency_symbol === '¥' ? 'JPY' : 'USD',
            }).format(debt.minimum_payment);

            // Send email
            const { data: emailResult, error: emailError } = await resend.emails.send({
              from: 'Debt-Free <noreply@debt-free-app.com>',
              to: [user.email],
              subject: `Payment Due Today: ${debt.name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Payment Reminder</h2>
                  <p>Hello,</p>
                  <p>This is a reminder that your payment for <strong>${debt.name}</strong> is due <strong>today</strong>.</p>
                  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Debt Name:</strong> ${debt.name}</p>
                    <p style="margin: 5px 0;"><strong>Banker:</strong> ${debt.banker_name}</p>
                    <p style="margin: 5px 0;"><strong>Payment Amount:</strong> ${formattedAmount}</p>
                    <p style="margin: 5px 0;"><strong>Due Date:</strong> Today</p>
                  </div>
                  <p>Please make sure to complete this payment to stay on track with your debt repayment plan.</p>
                  <p style="margin-top: 20px;">Best regards,<br>Debt-Free App</p>
                </div>
              `,
            });

            if (emailError) {
              console.error(`Error sending day-of reminder email: ${emailError}`);
              errors++;
              continue;
            }

            console.log(`Sent day-of reminder email for debt ${debt.id}: ${emailResult?.id}`);
            remindersSent++;

            // Record that we sent this reminder
            await supabase
              .from('payment_reminders')
              .insert({
                user_id: user.id,
                debt_id: debt.id,
                payment_date: reminderDate,
                reminder_type: reminderType
              });
          }
        }

        // Send advance reminders
        if (advanceDebts.length > 0) {
          const reminderType = 'advance';
          const daysInAdvance = user.reminder_days_before || 3;

          // Check if reminders were already sent
          for (const debt of advanceDebts) {
            const reminderDate = debt.next_payment_date?.split('T')[0];
            if (!reminderDate) continue;

            // Check if we already sent this reminder
            const { data: existingReminder } = await supabase
              .from('payment_reminders')
              .select('id')
              .eq('user_id', user.id)
              .eq('debt_id', debt.id)
              .eq('payment_date', reminderDate)
              .eq('reminder_type', reminderType)
              .maybeSingle();

            if (existingReminder) {
              console.log(`Already sent ${reminderType} reminder for debt ${debt.id}`);
              continue;
            }

            // Format email content
            const formattedAmount = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: debt.currency_symbol === '£' ? 'GBP' : 
                      debt.currency_symbol === '€' ? 'EUR' : 
                      debt.currency_symbol === '¥' ? 'JPY' : 'USD',
            }).format(debt.minimum_payment);

            // Send email
            const { data: emailResult, error: emailError } = await resend.emails.send({
              from: 'Debt-Free <noreply@debt-free-app.com>',
              to: [user.email],
              subject: `Upcoming Payment in ${daysInAdvance} Days: ${debt.name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Upcoming Payment Reminder</h2>
                  <p>Hello,</p>
                  <p>This is a reminder that your payment for <strong>${debt.name}</strong> is due in <strong>${daysInAdvance} days</strong>.</p>
                  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Debt Name:</strong> ${debt.name}</p>
                    <p style="margin: 5px 0;"><strong>Banker:</strong> ${debt.banker_name}</p>
                    <p style="margin: 5px 0;"><strong>Payment Amount:</strong> ${formattedAmount}</p>
                    <p style="margin: 5px 0;"><strong>Due Date:</strong> ${reminderDate}</p>
                  </div>
                  <p>Please prepare to make this payment to stay on track with your debt repayment plan.</p>
                  <p style="margin-top: 20px;">Best regards,<br>Debt-Free App</p>
                </div>
              `,
            });

            if (emailError) {
              console.error(`Error sending advance reminder email: ${emailError}`);
              errors++;
              continue;
            }

            console.log(`Sent advance reminder email for debt ${debt.id}: ${emailResult?.id}`);
            remindersSent++;

            // Record that we sent this reminder
            await supabase
              .from('payment_reminders')
              .insert({
                user_id: user.id,
                debt_id: debt.id,
                payment_date: reminderDate,
                reminder_type: reminderType
              });
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}: ${userError.message}`);
        errors++;
      }
    }

    console.log(`Reminder check complete. Sent ${remindersSent} reminders with ${errors} errors.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${remindersSent} reminders with ${errors} errors`,
        reminders_sent: remindersSent,
        errors: errors
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error in send-payment-reminders function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
