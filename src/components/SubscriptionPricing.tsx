import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PricingProps {
    onSubscribe: (priceId: string) => void;
    currentTier?: string;
}

export function SubscriptionPricing({ onSubscribe, currentTier = "FREE" }: PricingProps) {
    const plans = [
        {
            name: "FREE",
            price: "무료",
            description: "가볍게 체험해 보고 싶은 분께 적합합니다.",
            features: ["주 3회 생성", "기본 생성 속도", "브라우저 저장"],
            priceId: "free",
            tier: "FREE",
        },
        {
            name: "BASIC",
            price: "₩4,900",
            description: "꾸준히 장편을 써 내려가는 사용자용 플랜입니다.",
            features: ["무제한 생성", "더 빠른 응답", "우선 지원"],
            priceId: "price_1QVmMnQ72u5FI556aBbJjOTt",
            tier: "BASIC",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {plans.map((plan) => (
                <Card key={plan.name} className={plan.tier === currentTier ? "border-primary" : ""}>
                    <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 text-3xl font-bold">
                            {plan.price}
                            <span className="ml-1 text-sm font-normal text-muted-foreground">/월</span>
                        </div>
                        <ul className="space-y-2">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-primary" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            variant={plan.tier === currentTier ? "outline" : "default"}
                            disabled={plan.tier === currentTier}
                            onClick={() => {
                                if (plan.tier !== "FREE") {
                                    onSubscribe(plan.priceId);
                                }
                            }}
                        >
                            {plan.tier === currentTier ? "현재 플랜" : plan.tier === "FREE" ? "바로 시작" : "업그레이드"}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
