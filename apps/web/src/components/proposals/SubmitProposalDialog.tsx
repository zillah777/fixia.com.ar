import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { opportunitiesService } from "../../lib/services/opportunities.service";
import { Loader2, Send } from "lucide-react";

const proposalSchema = z.object({
    proposedBudget: z.coerce.number().min(1, "El presupuesto debe ser mayor a 0"),
    estimatedDuration: z.string().min(1, "La duración estimada es requerida"),
    message: z.string().min(20, "El mensaje debe tener al menos 20 caracteres"),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface SubmitProposalDialogProps {
    projectId: string;
    projectTitle: string;
    budgetMin?: number;
    budgetMax?: number;
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function SubmitProposalDialog({
    projectId,
    projectTitle,
    budgetMin,
    budgetMax,
    onSuccess,
    trigger
}: SubmitProposalDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalSchema),
        defaultValues: {
            proposedBudget: budgetMin || 0,
            estimatedDuration: "7 días",
            message: "",
        },
    });

    const onSubmit = async (data: ProposalFormValues) => {
        setIsSubmitting(true);
        try {
            await opportunitiesService.applyToOpportunity(projectId, {
                ...data,
                portfolio: [], // Optional portfolio items
            });

            toast.success("¡Propuesta enviada con éxito!");
            setOpen(false);
            reset();
            onSuccess();
        } catch (error) {
            console.error("Error sending proposal:", error);
            toast.error("Error al enviar la propuesta. Intenta nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="w-full liquid-gradient">
                        Enviar Propuesta
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-strong border-white/10">
                <DialogHeader>
                    <DialogTitle>Enviar Propuesta</DialogTitle>
                    <DialogDescription>
                        Postúlate para: <span className="font-semibold text-foreground">{projectTitle}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="proposedBudget">Presupuesto (ARS)</Label>
                            <Input
                                id="proposedBudget"
                                type="number"
                                placeholder="0.00"
                                className="glass border-white/20"
                                {...register("proposedBudget")}
                            />
                            {errors.proposedBudget && (
                                <p className="text-xs text-destructive">{errors.proposedBudget.message}</p>
                            )}
                            {(budgetMin || budgetMax) && (
                                <p className="text-xs text-muted-foreground">
                                    Rango sugerido: ${budgetMin} - ${budgetMax}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimatedDuration">Duración Estimada</Label>
                            <Input
                                id="estimatedDuration"
                                placeholder="Ej: 2 semanas"
                                className="glass border-white/20"
                                {...register("estimatedDuration")}
                            />
                            {errors.estimatedDuration && (
                                <p className="text-xs text-destructive">{errors.estimatedDuration.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Mensaje / Carta de Presentación</Label>
                        <Textarea
                            id="message"
                            placeholder="Describe por qué eres el indicado para este proyecto..."
                            className="min-h-[150px] glass border-white/20"
                            {...register("message")}
                        />
                        {errors.message && (
                            <p className="text-xs text-destructive">{errors.message.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="liquid-gradient"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Enviar Propuesta
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
