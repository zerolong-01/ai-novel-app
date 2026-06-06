import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature");

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return new NextResponse("Webhook Secret Missing", { status: 500 });
    }

    if (!signature) {
        return new NextResponse("Missing signature", { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown webhook error";
        return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.subscription || !session.metadata?.userId) {
            return new NextResponse("Subscription or user id is missing", { status: 400 });
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                stripe_customer_id: session.customer as string,
                subscription_id: subscription.id,
                subscription_tier: "BASIC",
                subscription_status: "active",
                credits: 999999,
            })
            .eq("id", session.metadata.userId);

        if (error) {
            console.error("Error updating profile:", error);
            return new NextResponse("Database Error", { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
