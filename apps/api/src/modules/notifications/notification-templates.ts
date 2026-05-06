import type {
  NotificationKey,
  NotificationTemplateVars,
} from '@repo/shared';

type Template<K extends NotificationKey> = {
  title: string;
  body: (vars: NotificationTemplateVars[K]) => string;
};

type TemplateMap = { [K in NotificationKey]: Template<K> };

const templates: TemplateMap = {
  NEW_OFFER: {
    title: 'Nouvelle offre',
    body: ({ providerName }) =>
      `${providerName} a fait une offre sur votre annonce`,
  },
  OFFER_ACCEPTED: {
    title: 'Offre acceptée',
    body: () => 'Votre offre a été acceptée.',
  },
  OFFER_REJECTED: {
    title: 'Offre refusée',
    body: () => 'Votre offre a été refusée.',
  },
  REVIEW_REQUESTED: {
    title: 'Laissez un avis',
    body: ({ partnerName, reviewLink }) =>
      `La prestation avec ${partnerName} est terminée. Donnez votre avis : ${reviewLink}`,
  },
  ACCOUNT_SUSPENDED: {
    title: 'Compte suspendu',
    body: () => 'Votre compte a été suspendu par un administrateur.',
  },
  LISTING_HIDDEN: {
    title: 'Annonce masquée',
    body: () => "L'une de vos annonces a été masquée par un administrateur.",
  },
  IDENTITY_VERIFIED: {
    title: 'Identité vérifiée',
    body: () => 'Votre identité a été vérifiée avec succès.',
  },
  IDENTITY_REJECTED: {
    title: 'Vérification refusée',
    body: ({ reason }) =>
      `Votre vérification d'identité a été refusée${reason ? ` : ${reason}` : ''}.`,
  },
};

export function renderTemplate<K extends NotificationKey>(
  key: K,
  vars: NotificationTemplateVars[K],
): { title: string; body: string } {
  const template = templates[key] as Template<K>;
  return {
    title: template.title,
    body: template.body(vars),
  };
}
