export interface Dictionary {
  nav: {
    home: string;
    about: string;
    clients: string;
    equipment: string;
    services: string;
    portfolio: string;
    contact: string;
  };
  hero: {
    tagline: string;
    mute: string;
    unmute: string;
  };
  about: {
    eyebrow: string;
  };
  clients: { title: string; subtitle: string };
  equipment: { title: string; subtitle: string };
  services: { title: string; subtitle: string; empty: string };
  portfolio: {
    title: string;
    subtitle: string;
    bts: string;
    viewProject: string;
    back: string;
    empty: string;
  };
  contact: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    send: string;
    sending: string;
    sent: string;
    error: string;
    emailLabel: string;
    phoneLabel: string;
    addressLabel: string;
    whatsapp: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    save: string;
    saved: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    create: string;
    search: string;
    reorder: string;
    yes: string;
    no: string;
    published: string;
    draft: string;
    logout: string;
    next: string;
  };
  admin: {
    loginTitle: string;
    loginSubtitle: string;
    email: string;
    password: string;
    signIn: string;
    invalidCredentials: string;
    dashboard: string;
    heroModule: string;
    aboutModule: string;
    clientsModule: string;
    equipmentModule: string;
    servicesModule: string;
    portfolioModule: string;
    contactModule: string;
    messagesModule: string;
    socialModule: string;
    navigationModule: string;
    seoModule: string;
    languageModule: string;
    settingsModule: string;
    overview: string;
    messages: {
      title: string;
      searchPlaceholder: string;
      filterByStatus: string;
      allMessages: string;
      newMessages: string;
      readMessages: string;
      repliedMessages: string;
      archivedMessages: string;
      noMessages: string;
      markAsRead: string;
      markAsReplied: string;
      archive: string;
      delete: string;
      selected: string;
      selectAll: string;
      deselectAll: string;
      bulkActions: string;
      deleteConfirm: string;
      viewDetails: string;
      sender: string;
      receivedAt: string;
      status: string;
      actions: string;
      messageDetails: string;
      ipAddress: string;
      replyByEmail: string;
      close: string;
    }
  };
}

export const en: Dictionary = {
  nav: {
    home: "Home",
    about: "About",
    clients: "Our Clients",
    equipment: "Equipment",
    services: "Services",
    portfolio: "Portfolio",
    contact: "Contact",
  },
  hero: {
    tagline: "Cinematic Production House",
    mute: "Unmute video",
    unmute: "Mute video",
  },
  about: {
    eyebrow: "Who we are",
  },
  clients: { title: "Our Clients", subtitle: "Trusted by leading brands and institutions" },
  equipment: { title: "Our Equipment", subtitle: "Shot on industry-leading gear" },
  services: { title: "Services", subtitle: "What we do", empty: "No services published yet." },
  portfolio: {
    title: "Our Portfolio",
    subtitle: "Selected work",
    bts: "Behind The Scenes",
    viewProject: "View project",
    back: "Back to portfolio",
    empty: "No projects published yet.",
  },
  contact: {
    title: "Let's talk",
    subtitle: "Tell us about your production",
    name: "Full name",
    phone: "Phone number",
    email: "Email address",
    
    message: "Project details",
    send: "Send message",
    sending: "Sending…",
    sent: "Message sent — we'll be in touch shortly.",
    error: "Something went wrong. Please try again.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    addressLabel: "Address",
    whatsapp: "WhatsApp",
  },
  common: {
    loading: "Loading…",
    error: "Something went wrong.",
    retry: "Retry",
    save: "Save changes",
    saved: "Saved",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    create: "Create",
    search: "Search",
    reorder: "Drag to reorder",
    yes: "Yes",
    no: "No",
    published: "Published",
    draft: "Draft",
    logout: "Log out",
    next: "Next",
  },
  admin: {
    loginTitle: "Admin sign in",
    loginSubtitle: "Sign in to manage Phoenix Media",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    invalidCredentials: "Invalid email or password.",
    dashboard: "Dashboard",
    heroModule: "Homepage & Video",
    aboutModule: "About",
    clientsModule: "Clients",
    equipmentModule: "Equipment",
    servicesModule: "Services",
    portfolioModule: "Portfolio",
    contactModule: "Contact",
    messagesModule: "Messages",
    socialModule: "Social Media",
    navigationModule: "Navigation",
    seoModule: "SEO",
    languageModule: "Language",
    settingsModule: "Settings",
    overview: "Overview",
      messages: {
        title: "Manage Messages",
        searchPlaceholder: "Search messages...",
        filterByStatus: "Filter by Status",
        allMessages: "All Messages",
        newMessages: "New",
        readMessages: "Read",
        repliedMessages: "Replied",
        archivedMessages: "Archived",
        noMessages: "No messages found",
        markAsRead: "Mark as Read",
        markAsReplied: "Mark as Replied",
        archive: "Archive",
        delete: "Delete",
        selected: "selected",
        selectAll: "Select All",
        deselectAll: "Deselect All",
        bulkActions: "Bulk Actions",
        deleteConfirm: "Are you sure you want to delete selected messages?",
        viewDetails: "View Details",
        sender: "Sender",
        receivedAt: "Received At",
        status: "Status",
        actions: "Actions",
        messageDetails: "Message Details",
        ipAddress: "IP Address",
        replyByEmail: "Reply by Email",
        close: "Close",
      }
  },
};
