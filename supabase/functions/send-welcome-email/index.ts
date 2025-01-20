import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing welcome email request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email }: EmailPayload = await req.json();
    console.log("Sending welcome email to:", email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Debtfreeo <hi@debtfreeo.com>",
        to: [email],
        subject: "Welcome to Debtfreeo! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Welcome to Debtfreeo! 🎉</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Thank you for joining Debtfreeo! We're excited to help you on your journey to financial freedom.
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Getting Started</h2>
              <ul style="color: #666; font-size: 16px; line-height: 1.5;">
                <li>Add your debts to your dashboard</li>
                <li>Set up your monthly payment plan</li>
                <li>Track your progress towards becoming debt-free</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              If you have any questions or need assistance, don't hesitate to reach out to our support team.
            </p>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://debtfreeo.com" 
                 style="background-color: #34D399; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Go to Debtfreeo
              </a>
            </div>

            <div style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
              <p>© 2025 Debtfreeo. All rights reserved.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending welcome email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);