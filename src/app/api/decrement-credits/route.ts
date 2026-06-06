import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get current profile
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (fetchError || !profile) {
            return new NextResponse("Profile not found", { status: 404 });
        }

        // Only decrement for FREE tier users
        if (profile.subscription_tier === 'FREE') {
            if (profile.credits <= 0) {
                return new NextResponse(JSON.stringify({
                    error: "No credits remaining",
                    credits: 0
                }), {
                    status: 403,
                    headers: { "Content-Type": "application/json" }
                });
            }

            // Decrement credits
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ credits: profile.credits - 1 })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating credits:', updateError);
                return new NextResponse("Failed to update credits", { status: 500 });
            }

            return NextResponse.json({
                success: true,
                credits: profile.credits - 1
            });
        }

        // For BASIC tier, credits are unlimited (don't decrement)
        return NextResponse.json({
            success: true,
            credits: profile.credits
        });

    } catch (error) {
        console.error("[DECREMENT_CREDITS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
