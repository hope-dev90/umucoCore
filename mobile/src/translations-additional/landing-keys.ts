// ADD THESE KEYS to src/translations/rw.json, en.json, fr.json
//
// rw.json values below are taken directly from the screencast (source of
// truth for Kinyarwanda). en.json / fr.json need real translations —
// I've left literal/placeholder English so nothing renders blank, but
// these should be reviewed by a fluent speaker before shipping.

// ---------------- rw.json (source copy from the screencast) ----------------
export const rwAdditions = {
  landing: {
    badge: "KUGEZA UMUCO KU IKORANABUHANGA",
    heroTitlePrefix: "Irembo ry'",
    heroTitleHighlight: "Umurage Wacu",
    heroSubtitle:
      "Kwita ku busugire bw'igihugu tuzirikana iyo tuva, dusigasira umuco twarazwe n'abakurambere .",
    ctaPrimary: "Ngwino dufatanye",
    ctaSecondary: "Sura Byinshi",
    stats: {
      storiesLabel: "INKURU ZIRYOHEYE AMATWI",
      modulesLabel: "IMODULI Z'INDIMI",
      supportLabel: "UMUFASHA WA AI",
    },
    quote: {
      text: "\"Ababiri baruta umwe.\"",
      support: "Abantu benshi bishyize hamwe, ntakibananira . Mucyo tuwubungabunge.",
      caption: "Sura ubwenge bwimbitse bw'umuco w'u Rwanda.",
      cta: "Fungura Konti Yawe",
    },
    contribute: {
      title: "Ba Umurinzi w'Umuco.",
      body: "Jya mu muryango wacu w'ibigo, abahanga mu by'amateka, n'abantu ku giti cyabo biyemeje kubungabunga inkuru y'u Rwanda. Umusanzu wawe utuma amajwi y'uyu munsi aba ubwenge bw'ejo hazaza.",
      primaryCta: "Tanga Umusanzu",
      secondaryCta: "Imbonerahamwe",
    },
    footer: {
      brand: "UmucoCore",
      tagline:
        "Guhuza isi n'umutima w'u Rwanda. Menya ubwimbike bw'imigenzo yacu n'umwuka w'abaturage bacu.",
      exploreColumnTitle: "Sura",
      exploreLinks: [
        "Sura Umuco",
        "Ibanze by'Ikinyarwanda",
        "Imigenzo Ivugwa",
        "Inzu Ndangamurage Yikoranabuhanga",
      ],
      communityColumnTitle: "Umuryango",
      communityLinks: [
        "Jya mu Biganiro",
        "Ibirori Bizaza",
        "Porogaramu y'Abaterera Umusanzu",
        "Ubufatanye",
      ],
      newsletterTitle: "Iyandikishe",
      newsletterBody: "Akira amakuru y'umuco buri kwezi butaziguye muri imeli yawe.",
      newsletterPlaceholder: "Imeli",
      newsletterSubmit: "Ohereza",
      copyright: "© 2026 Umuco Hub.",
      policyLinks: ["Politiki y'Ibanga", "Amabwiriza y'Ikoreshwa", "Ikigo cy'Ubufasha"],
    },
    newsletterAlerts: {
      invalidTitle: "Imeli ntiboneka",
      invalidBody: "Andika imeli yemewe mbere yo kohereza.",
      successTitle: "Murakoze!",
      successBody: "Wiyandikishije neza.",
      errorTitle: "Habaye ikibazo",
      errorBody: "Ntibyakunze kohereza. Ongera ugerageze.",
    },
  },
};

// ---------------- en.json (placeholder — please review) ----------------
export const enAdditions = {
  landing: {
    badge: "BRINGING CULTURE TO TECHNOLOGY",
    heroTitlePrefix: "Gateway to our",
    heroTitleHighlight: "Heritage",
    heroSubtitle:
      "Caring for our nation's dignity, remembering where we came from, and preserving the culture handed down by our ancestors.",
    ctaPrimary: "Join Us",
    ctaSecondary: "Explore More",
    stats: {
      storiesLabel: "STORIES WORTH HEARING",
      modulesLabel: "LANGUAGE MODULES",
      supportLabel: "AI SUPPORT",
    },
    quote: {
      text: "\"Two are stronger than one.\"",
      support: "When many people come together, nothing is impossible. Let's preserve this culture together.",
      caption: "Explore the deep wisdom of Rwandan culture.",
      cta: "Create Your Account",
    },
    contribute: {
      title: "Be a Guardian of Culture.",
      body: "Join our community of institutions, historians, and individuals committed to preserving Rwanda's story. Your contribution turns today's voices into tomorrow's wisdom.",
      primaryCta: "Contribute",
      secondaryCta: "View Dashboard",
    },
    footer: {
      brand: "UmucoCore",
      tagline: "Connecting the world with the heart of Rwanda. Discover the depth of our traditions and the spirit of our people.",
      exploreColumnTitle: "Explore",
      exploreLinks: ["Explore Culture", "Rwandan Basics", "Told Traditions", "Digital Heritage Museum"],
      communityColumnTitle: "Community",
      communityLinks: ["Join Discussions", "Upcoming Events", "Contributor Program", "Partnerships"],
      newsletterTitle: "Subscribe",
      newsletterBody: "Get monthly cultural updates delivered straight to your inbox.",
      newsletterPlaceholder: "Email",
      newsletterSubmit: "Send",
      copyright: "© 2026 Umuco Hub.",
      policyLinks: ["Privacy Policy", "Terms of Use", "Help Center"],
    },
    newsletterAlerts: {
      invalidTitle: "Email not found",
      invalidBody: "Enter a valid email before submitting.",
      successTitle: "Thank you!",
      successBody: "You've subscribed successfully.",
      errorTitle: "Something went wrong",
      errorBody: "Couldn't submit. Please try again.",
    },
  },
};

// fr.json additions follow the same shape — omitted here for brevity,
// mirror enAdditions and translate.