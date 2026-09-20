export interface NavItem {
  name: string;
  href: string;
}

export interface StatItem {
  number?: string;
  image?: string;
  label: string;
  /** Компактный шрифт вместо огромного (для длинных строк вроде "Throughout Ukraine") */
  compact?: boolean;
}

export interface ServiceItem {
  icon: string;
  title: string;
  items: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  spec: string;
  exp: string;
  phone: string;
  phone2?: string;
  email?: string;
}

export interface FormStrings {
  formTitle: string;
  formName: string;
  formPhone: string;
  formMessage: string;
  formSubmit: string;
  formSending: string;
  formSuccess: string;
  formError: string;
}

export interface AlertStrings {
  alertInvalidPhone: string;
  alertXss: string;
  alertCopied: string;
  alertCopyFailed: string;
  alertRateLimited: string;
  titlePhoneHint: string;
  btnTryAgain: string;
}

export interface SiteContent {
  metadata: {
    title: string;
    description: string;
  };
  header: {
    name: string;
    nav: NavItem[];
  };
  hero: FormStrings & AlertStrings & {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    /** EN: подзаголовок-акцент "In many cases, you do not need to travel to Ukraine." */
    highlight?: string;
    ctaPrimary: string;
    ctaSecondary: string;
    /** EN: якорь на контакты вместо звонка */
    ctaSecondaryHref?: string;
    phone: string;
    phone2: string;
    /** EN: подзаголовок формы */
    formSubtitle?: string;
    btnCancel: string;
    imageAlt: string;
  };
  stats: StatItem[];
  /** Только EN */
  howItWorks?: {
    title: string;
    subtitle: string;
    steps: { title: string; desc: string }[];
  };
  services: {
    title: string;
    subtitle: string;
    items: ServiceItem[];
  };
  /** Только EN: CTA-блок после Services */
  notSure?: {
    title: string;
    text: string;
    cta: string;
  };
  team: {
    title: string;
    subtitle: string;
    olga: TeamMember;
    kateryna: TeamMember;
  };
  whyUs: {
    title: string;
    items: { icon: string; title: string; desc: string }[];
  };
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
  reviews: {
    title: string;
    items: { name: string; text: string; service: string }[];
  };
  contact: FormStrings & AlertStrings & {
    title: string;
    subtitle: string;
    phone: string;
    email: string;
    address: string;
    addressValue: string;
    messengers: string;
    formSubtitle: string;
    workingHours: string;
  };
  footer: {
    rights: string;
    privacy: string;
  };
}
