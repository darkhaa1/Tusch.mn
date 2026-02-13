"use client";

import { useEffect, useState } from "react";
import { Flag } from "lucide-react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectLabel,
  Textarea,
} from "@web/components/ui";
import { useCreateReport } from "@web/lib/hooks/useApi";
import type { ReportReason, ReportTargetType } from "@web/lib/api/types";

const REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: "SPAM", label: "Спам" },
  { value: "INAPPROPRIATE", label: "Зохисгүй агуулга" },
  { value: "FRAUD", label: "Луйвар" },
  { value: "OTHER", label: "Бусад" },
];

type ReportDialogButtonProps = {
  targetType: ReportTargetType;
  targetId: string;
  size?: "default" | "sm";
  variant?: "outline" | "ghost" | "secondary";
  className?: string;
  label?: string;
};

export function ReportDialogButton({
  targetType,
  targetId,
  size = "sm",
  variant = "outline",
  className,
  label = "Мэдэгдэх",
}: ReportDialogButtonProps) {
  const createReportMutation = useCreateReport();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const onSubmit = async () => {
    if (!reason) {
      setErrorMessage("Шалтгаан сонгоно уу.");
      return;
    }

    setErrorMessage(null);
    try {
      await createReportMutation.mutateAsync({
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      });
      setOpen(false);
      setReason("");
      setDescription("");
      setToastMessage("Мэдэгдэл амжилттай илгээгдлээ");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Мэдэгдэл илгээхэд алдаа гарлаа");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={className}
          onClick={() => setOpen(true)}
        >
          <Flag className="h-4 w-4" aria-hidden="true" />
          {label}
        </Button>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Мэдэгдэх</DialogTitle>
            <DialogDescription>
              Энэ контентын талаар модерацийн багт мэдэгдэл илгээнэ.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <SelectLabel htmlFor="report-reason">Шалтгаан</SelectLabel>
              <Select
                id="report-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value as ReportReason)}
              >
                <option value="">Шалтгаан сонгох</option>
                {REASONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <SelectLabel htmlFor="report-description">Тайлбар (заавал биш)</SelectLabel>
              <Textarea
                id="report-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Нэмэлт тайлбар бичих (заавал биш)"
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Цуцлах</Button>
            </DialogClose>
            <Button onClick={onSubmit} disabled={createReportMutation.isPending}>
              {createReportMutation.isPending ? "Илгээж байна..." : "Илгээх"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toastMessage ? (
        <div
          role="status"
          className="fixed right-4 top-4 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 shadow"
        >
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}
