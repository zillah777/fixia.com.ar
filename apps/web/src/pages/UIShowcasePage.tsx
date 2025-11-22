import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientText } from "@/components/ui/GradientText";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { CountUp } from "@/components/ui/CountUp";
import { Pulse } from "@/components/ui/Pulse";
import { MicroCelebration } from "@/components/ui/MicroCelebration";
import { AnimatedList } from "@/components/ui/AnimatedList";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FloatingLabel } from "@/components/ui/FloatingLabel";
import { Confetti } from "@/components/ui/confetti";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { SwipeableDrawer } from "@/components/ui/SwipeableDrawer";
import { ParallaxSection } from "@/components/ui/ParallaxSection";
import { toast } from "@/components/ui/sonner";
import { Sparkles, Zap, Heart } from "lucide-react";

export default function UIShowcasePage() {
    const [saved, setSaved] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [progress, setProgress] = useState(65);

    const demoItems = [
        { id: 1, name: "Premium Feature 1", icon: "✨" },
        { id: 2, name: "Premium Feature 2", icon: "🚀" },
        { id: 3, name: "Premium Feature 3", icon: "💎" },
        { id: 4, name: "Premium Feature 4", icon: "⚡" },
    ];

    const handleSave = () => {
        setSaved(true);
        setShowConfetti(true);
        toast.success("Changes saved successfully!", {
            description: "Your preferences have been updated.",
        });
        setTimeout(() => {
            setSaved(false);
            setShowConfetti(false);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-background">
            <ScrollProgress />

            {showConfetti && <Confetti />}

            {/* Hero Section */}
            <ParallaxSection speed={0.5}>
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center space-y-6">
                        <GradientText gradient="primary" animate className="text-5xl font-bold">
                            Modern UI/UX Showcase
                        </GradientText>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Explore all the new premium components and interactions
                        </p>
                        <div className="flex gap-4 justify-center items-center">
                            <Pulse color="green" size="md">
                                <span className="text-sm font-medium">System Online</span>
                            </Pulse>
                        </div>
                    </div>
                </div>
            </ParallaxSection>

            <div className="container mx-auto px-4 py-12 space-y-16">
                {/* Buttons Section */}
                <ScrollReveal variant="slideUp">
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle>
                                <GradientText gradient="sunset">Enhanced Buttons</GradientText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <Button variant="default">Default with Ripple</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="fun">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Fun Variant
                                </Button>
                                <MicroCelebration trigger={saved} type="pulse">
                                    <Button onClick={handleSave}>
                                        <Heart className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </MicroCelebration>
                            </div>
                        </CardContent>
                    </Card>
                </ScrollReveal>

                {/* Cards Section */}
                <ScrollReveal variant="slideUp" delay={0.1}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card variant="interactive">
                            <CardHeader>
                                <CardTitle>Interactive Card</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Hover me for lift effect
                                </p>
                            </CardContent>
                        </Card>

                        <Card variant="glow">
                            <CardHeader>
                                <CardTitle>Glow Card</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Animated glow border
                                </p>
                            </CardContent>
                        </Card>

                        <Card variant="ultra">
                            <CardHeader>
                                <CardTitle>Ultra Glass</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Premium glassmorphism
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollReveal>

                {/* Progress & Stats */}
                <ScrollReveal variant="slideUp" delay={0.2}>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <GradientText gradient="primary">Progress & Counters</GradientText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex flex-col items-center gap-4">
                                    <ProgressRing progress={progress} gradient showPercentage />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => setProgress(Math.min(100, progress + 10))}
                                        >
                                            +10
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setProgress(Math.max(0, progress - 10))}
                                        >
                                            -10
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                        <CountUp value={1234} prefix="$" duration={2} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                        <CountUp value={98.5} decimals={1} suffix="%" duration={2} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Success Rate</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ScrollReveal>

                {/* Animated List */}
                <ScrollReveal variant="slideUp" delay={0.3}>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <GradientText gradient="rainbow">Animated List</GradientText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AnimatedList
                                items={demoItems}
                                renderItem={(item) => (
                                    <Card variant="interactive" className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{item.icon}</span>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                    </Card>
                                )}
                            />
                        </CardContent>
                    </Card>
                </ScrollReveal>

                {/* Input Components */}
                <ScrollReveal variant="slideUp" delay={0.4}>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <GradientText gradient="success">Floating Label Inputs</GradientText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FloatingLabel label="Email Address" type="email" />
                            <FloatingLabel label="Password" type="password" />
                        </CardContent>
                    </Card>
                </ScrollReveal>

                {/* Loading States */}
                <ScrollReveal variant="slideUp" delay={0.5}>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <GradientText gradient="warning">Enhanced Skeletons</GradientText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton variant="text" />
                            <Skeleton variant="text" className="w-3/4" />
                            <div className="flex items-center gap-4">
                                <Skeleton variant="avatar" className="h-12 w-12" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton variant="text" />
                                    <Skeleton variant="text" className="w-2/3" />
                                </div>
                            </div>
                            <Skeleton variant="card" />
                        </CardContent>
                    </Card>
                </ScrollReveal>

                {/* Mobile Features */}
                <ScrollReveal variant="slideUp" delay={0.6}>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <GradientText gradient="sunset">Mobile Features</GradientText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setDrawerOpen(true)}>
                                <Zap className="mr-2 h-4 w-4" />
                                Open Swipeable Drawer
                            </Button>
                            <p className="text-sm text-muted-foreground mt-4">
                                On mobile: swipe down to dismiss. Includes haptic feedback.
                            </p>
                        </CardContent>
                    </Card>
                </ScrollReveal>

                {/* Toast Examples */}
                <ScrollReveal variant="slideUp" delay={0.7}>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <GradientText gradient="primary">Enhanced Toasts</GradientText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    toast.success("Success!", {
                                        description: "Operation completed successfully",
                                    })
                                }
                            >
                                Success Toast
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    toast.error("Error!", {
                                        description: "Something went wrong",
                                    })
                                }
                            >
                                Error Toast
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    toast.warning("Warning!", {
                                        description: "Please review your changes",
                                    })
                                }
                            >
                                Warning Toast
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    toast.info("Info", {
                                        description: "Here's some helpful information",
                                    })
                                }
                            >
                                Info Toast
                            </Button>
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>

            {/* Swipeable Drawer */}
            <SwipeableDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Mobile Drawer"
                position="bottom"
            >
                <div className="space-y-4 p-4">
                    <p className="text-sm text-muted-foreground">
                        This drawer supports swipe gestures and haptic feedback on mobile devices.
                    </p>
                    <FloatingLabel label="Search" type="text" />
                    <div className="flex gap-2">
                        <Button className="flex-1">Apply</Button>
                        <Button variant="secondary" className="flex-1" onClick={() => setDrawerOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </SwipeableDrawer>
        </div>
    );
}
