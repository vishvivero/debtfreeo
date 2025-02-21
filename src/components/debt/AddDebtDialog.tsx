
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { AddDebtForm } from "@/components/AddDebtForm";
import { Debt } from "@/lib/types/debt";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AddDebtDialogProps {
  onAddDebt: (debt: Omit<Debt, "id">) => void;
  currencySymbol: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AddDebtDialog = ({ onAddDebt, currencySymbol, isOpen: controlledIsOpen, onClose }: AddDebtDialogProps) => {
  const [dialogState, setDialogState] = useState({
    uncontrolledIsOpen: false,
    confirmationOpen: false,
    isSubmitting: false,
    lastAddedDebt: null as Omit<Debt, "id"> | null,
  });

  const navigate = useNavigate();
  
  const isOpen = typeof controlledIsOpen !== 'undefined' ? controlledIsOpen : dialogState.uncontrolledIsOpen;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setDialogState(state => ({
        ...state,
        uncontrolledIsOpen: false,
        confirmationOpen: false,
        isSubmitting: false,
        lastAddedDebt: null
      }));
    };
  }, []);

  const resetState = useCallback(() => {
    console.log('AddDebtDialog: Resetting state');
    setDialogState(state => ({
      ...state,
      uncontrolledIsOpen: false,
      confirmationOpen: false,
      isSubmitting: false,
      lastAddedDebt: null
    }));
    if (typeof controlledIsOpen !== 'undefined') {
      onClose?.();
    }
  }, [controlledIsOpen, onClose]);

  const handleOpenChange = useCallback((open: boolean) => {
    console.log('AddDebtDialog: Dialog state changing:', { 
      open, 
      confirmationOpen: dialogState.confirmationOpen,
      isSubmitting: dialogState.isSubmitting 
    });

    if (!open && !dialogState.confirmationOpen && !dialogState.isSubmitting) {
      resetState();
    } else if (typeof controlledIsOpen === 'undefined' && open) {
      setDialogState(state => ({ ...state, uncontrolledIsOpen: true }));
    }
  }, [dialogState.confirmationOpen, dialogState.isSubmitting, controlledIsOpen, resetState]);

  const handleAddDebt = useCallback(async (debt: Omit<Debt, "id">) => {
    console.log('AddDebtDialog: Starting debt addition');
    
    setDialogState(state => ({ ...state, isSubmitting: true }));
    
    try {
      await onAddDebt(debt);
      console.log('AddDebtDialog: Debt added successfully');
      
      setDialogState(state => ({
        ...state,
        lastAddedDebt: debt,
        confirmationOpen: true,
        isSubmitting: false
      }));
    } catch (error) {
      console.error("AddDebtDialog: Error adding debt:", error);
      resetState();
    }
  }, [onAddDebt, resetState]);

  const handleAddMore = useCallback(() => {
    console.log('AddDebtDialog: Adding another debt');
    setDialogState(state => ({
      ...state,
      confirmationOpen: false,
      lastAddedDebt: null
    }));
  }, []);

  const handleFinish = useCallback(() => {
    console.log('AddDebtDialog: Finishing debt addition');
    resetState();
    navigate('/overview');
  }, [resetState, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      currencyDisplay: 'symbol'
    }).format(amount).replace('£', currencySymbol);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <Dialog 
        open={isOpen && !dialogState.confirmationOpen} 
        onOpenChange={handleOpenChange}
      >
        {typeof controlledIsOpen === 'undefined' && (
          <DialogTrigger asChild>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={dialogState.isSubmitting}
            >
              {dialogState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add debt
            </Button>
          </DialogTrigger>
        )}
        <DialogContent 
          className="sm:max-w-[500px] p-6 bg-white"
          onInteractOutside={(e) => {
            if (dialogState.isSubmitting) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">Add New Debt</DialogTitle>
          </DialogHeader>
          <AddDebtForm 
            onAddDebt={handleAddDebt} 
            currencySymbol={currencySymbol}
            disabled={dialogState.isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={dialogState.confirmationOpen}
        onOpenChange={(open) => {
          console.log('AddDebtDialog: Confirmation dialog changing:', { open });
          if (!open) {
            resetState();
          }
        }}
      >
        <AlertDialogContent 
          className="max-w-[500px]"
          onInteractOutside={(e) => {
            if (dialogState.isSubmitting) {
              e.preventDefault();
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-green-600">
              Debt Added Successfully!
            </AlertDialogTitle>
            {dialogState.lastAddedDebt && (
              <div className="mt-4 space-y-3 text-left">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-medium text-gray-900">{dialogState.lastAddedDebt.name}</h3>
                  <div className="mt-2 space-y-2 text-sm text-gray-600">
                    <p>Balance: {formatCurrency(dialogState.lastAddedDebt.balance)}</p>
                    <p>Interest Rate: {dialogState.lastAddedDebt.interest_rate}%</p>
                    <p>Minimum Payment: {formatCurrency(dialogState.lastAddedDebt.minimum_payment)}</p>
                    <p>Category: {dialogState.lastAddedDebt.category}</p>
                    <p>Next Payment: {formatDate(dialogState.lastAddedDebt.next_payment_date || '')}</p>
                  </div>
                </div>
                <AlertDialogDescription className="text-center mt-4">
                  Would you like to add another debt?
                </AlertDialogDescription>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleAddMore}
              className="flex-1"
              disabled={dialogState.isSubmitting}
            >
              Add Another Debt
            </Button>
            <Button
              onClick={handleFinish}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={dialogState.isSubmitting}
            >
              Finish
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
