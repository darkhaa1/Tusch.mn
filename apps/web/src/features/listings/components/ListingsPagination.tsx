"use client";

import { useTranslations } from "next-intl";
import Pagination from "./Pagination";

type Props = {
  page: number;
  totalPages: number | undefined;
  hasPrevious: boolean;
  hasNext: boolean;
  isBusy: boolean;
  onPageChange: (page: number) => void;
};

export default function ListingsPagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  isBusy,
  onPageChange,
}: Props) {
  const t = useTranslations("listings.client");

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      isBusy={isBusy}
      onPageChange={onPageChange}
      previousLabel={t("previous")}
      nextLabel={t("next")}
    />
  );
}
