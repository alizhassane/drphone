
import { Printer, FileText, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

interface PrintOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPrintLabel: () => void;
    onPrintReceipt: () => void;
    title?: string;
    description?: string;
}

export function PrintOptionsModal({
    isOpen,
    onClose,
    onPrintLabel,
    onPrintReceipt,
    title = "Options d'impression",
    description = "Que voulez-vous imprimer ?"
}: PrintOptionsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-gray-600 mb-6">{description}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={onPrintLabel}
                            className="h-24 flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700"
                        >
                            <Printer className="w-8 h-8" />
                            <span>Étiquette</span>
                        </Button>
                        <Button
                            onClick={onPrintReceipt}
                            className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <FileText className="w-8 h-8" />
                            <span>Reçu Client</span>
                        </Button>
                    </div>
                </div>
                <DialogFooter className="sm:justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Terminer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
