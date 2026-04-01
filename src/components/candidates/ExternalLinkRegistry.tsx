"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import type { ExternalLink, ExternalLinkType } from "@/lib/candidates/types";
import { getDictionary, getExternalLinkTypeLabel, type AppLocale } from "@/lib/i18n";

interface ExternalLinkRegistryProps {
  initialLinks: ExternalLink[];
  locale: AppLocale;
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function ExternalLinkRegistry({ initialLinks, locale }: ExternalLinkRegistryProps) {
  const dictionary = getDictionary(locale);
  const [links, setLinks] = useState(initialLinks);
  const [type, setType] = useState<ExternalLinkType>("reference");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!label.trim() || !url.trim()) {
      setError(dictionary.links.requiredError);
      return;
    }

    if (!isValidUrl(url)) {
      setError(dictionary.links.invalidUrlError);
      return;
    }

    setLinks((currentLinks) => [
      {
        id: `manual-${Date.now()}`,
        type,
        label: label.trim(),
        url: url.trim(),
        notes: notes.trim() || dictionary.links.sessionEntryNote,
      },
      ...currentLinks,
    ]);
    setLabel("");
    setUrl("");
    setNotes("");
    setError("");
  }

  return (
    <section className="panel-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{dictionary.links.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.links.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {dictionary.links.description}
          </p>
        </div>
        <span className="pill">{dictionary.links.sessionOnly}</span>
      </div>

      <div className="mt-6 space-y-3">
        {links.map((link) => (
          <article key={link.id} className="rounded-[22px] border border-line/80 bg-white/75 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#f8f4ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {getExternalLinkTypeLabel(link.type, locale)}
                  </span>
                  <h3 className="text-base font-semibold text-ink">{link.label}</h3>
                </div>
                <p className="mt-2 break-all text-sm text-muted">{link.url}</p>
                {link.notes ? <p className="mt-2 text-sm leading-6 text-muted">{link.notes}</p> : null}
              </div>
              <a
                className="inline-flex items-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                href={link.url}
                rel="noreferrer"
                target="_blank"
              >
                {dictionary.links.openReference}
              </a>
            </div>
          </article>
        ))}
      </div>

      <form className="mt-6 grid gap-4 rounded-[22px] border border-line/80 bg-[#fcfaf7] p-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-muted">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{dictionary.links.linkType}</span>
            <select
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              onChange={(event) => setType(event.target.value as ExternalLinkType)}
              value={type}
            >
              <option value="official">{getExternalLinkTypeLabel("official", locale)}</option>
              <option value="purchase">{getExternalLinkTypeLabel("purchase", locale)}</option>
              <option value="reference">{getExternalLinkTypeLabel("reference", locale)}</option>
              <option value="raffle">{getExternalLinkTypeLabel("raffle", locale)}</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-muted">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{dictionary.links.label}</span>
            <input
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              onChange={(event) => setLabel(event.target.value)}
              placeholder={dictionary.links.labelPlaceholder}
              type="text"
              value={label}
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{dictionary.links.url}</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            onChange={(event) => setUrl(event.target.value)}
            placeholder={dictionary.links.urlPlaceholder}
            type="url"
            value={url}
          />
        </label>

        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{dictionary.links.notes}</span>
          <textarea
            className="min-h-24 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            onChange={(event) => setNotes(event.target.value)}
            placeholder={dictionary.links.notesPlaceholder}
            value={notes}
          />
        </label>

        {error ? <p className="text-sm font-medium text-warning">{error}</p> : null}

        <button
          className="inline-flex w-full items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#38322a] md:w-auto"
          type="submit"
        >
          {dictionary.links.addSessionLink}
        </button>
      </form>
    </section>
  );
}
