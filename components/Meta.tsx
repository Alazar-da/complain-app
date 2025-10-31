'use client';

import Head from "next/head";
import { useTranslation } from "react-i18next";

export default function Meta() {
  const { t, i18n } = useTranslation();

  return (
    <Head>
      <title>
        {t("meta.title") || "የአቃቂ ቃሊቲ ክፍለ ከተማ ትምህርት ትምህርት ጽ/ቤት"}
      </title>
      <meta
        name="description"
        content={t("meta.description") || "Complaint app"}
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <html lang={i18n.language} />
    </Head>
  );
}
