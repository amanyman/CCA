import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    language_english: "English",
    language_spanish: "Español",

    nav_how_we_help: "How We Help",
    nav_why_us: "Why Us",
    nav_how_it_works: "How It Works",
    nav_get_help: "Request Help Now",

    hero_main_title: "In an Accident?",
    hero_main_subtitle: "We'll Guide You Through What's Next",
    hero_description: "California Care Alliance connects you with vetted legal representation and trusted repair facilities. No pressure, no cost, just clear guidance when you need it most.",
    hero_request_help: "Request Help Now",
    hero_learn_more: "Learn How It Works",

    stat_californians_value: "5000+",
    stat_californians: "Californians Helped",
    stat_partners: "Vetted Partners",
    stat_brokers: "Agent & Broker Partners",
    stat_response_time: "Avg Response Time",
    stat_support: "Support",
    stat_free: "Free Service",

    services_title: "How We Help",
    services_subtitle: "We connect individuals with the right professionals to guide them through the stressful process of injury claims and auto repair",
    service_legal_title: "Legal Representation",
    service_legal_desc: "Connect with vetted attorneys who specialize in injury claims and will fight for your rights with no upfront cost.",
    service_repair_title: "Auto Repair Coordination",
    service_repair_desc: "Get matched with trusted repair facilities that will restore your vehicle properly and work with your claim.",
    service_broker_title: "Insurance Agent & Broker Support",
    service_broker_desc: "We partner with insurance agents and insurance brokers to provide seamless post-accident support for your customers so they feel supported and the process stays on track.",

    why_title: "Why Choose California Care Alliance",
    why_subtitle: "We're not a law firm or repair shop, we're your trusted bridge to the help you need",
    why_vetted_title: "Vetted Partners Only",
    why_vetted_desc: "We only connect you with reputable attorneys and repair facilities we trust.",
    why_free_title: "No Cost to Connect",
    why_free_desc: "Getting connected is completely free with no obligation or hidden fees.",
    why_client_title: "Client-First Approach",
    why_client_desc: "Your recovery and care come first, not insurance costs or sales pressure.",
    why_clear_title: "Clear Next Steps",
    why_clear_desc: "We provide guidance and clarity without confusion or aggressive tactics.",

    how_title: "How It Works",
    how_subtitle: "Getting the right help is simple with our proven process",
    how_step1_title: "Reach Out to Us",
    how_step1_desc: "Contact us after your accident. We'll listen to your situation and understand what kind of help you need.",
    how_step2_title: "Get Connected",
    how_step2_desc: "We'll match you with vetted legal representation and/or trusted repair facilities based on your specific needs.",
    how_step3_title: "Focus on Recovery",
    how_step3_desc: "Let the professionals handle your claim and repairs while you focus on getting better. No pressure, just support.",

    testimonials_title: "What People Are Saying",
    testimonials_subtitle: "Real experiences from those we've helped after their accidents",
    testimonial1_name: "Robert M.",
    testimonial1_location: "Los Angeles, CA",
    testimonial1_text: "After my accident, I didn't know where to turn. California Care Alliance connected me with an attorney who actually cared and a repair shop that did quality work. No pressure, just real help.",
    testimonial2_name: "Jennifer L.",
    testimonial2_location: "San Francisco, CA",
    testimonial2_text: "My insurance broker referred me to California Care Alliance after my car accident. They made everything so much easier and found me a great attorney and got my car fixed properly. So grateful!",
    testimonial3_name: "David T.",
    testimonial3_location: "San Diego, CA",
    testimonial3_text: "I was overwhelmed dealing with the insurance company and finding someone trustworthy. California Care Alliance connected me with professionals who fought for me. Best decision I made.",

    broker_network_title: "Insurance Agent & Broker Support",
    broker_network_subtitle: "Are you an insurance agent or broker looking to better support your customers after an accident with a smoother, more reliable recovery and repair process? Partner with California Care Alliance today.",
    broker_trusted: "Trusted Network",
    broker_trusted_desc: "Join 50+ insurance agents and brokers already partnering with us",
    broker_vetted: "Vetted Professionals",
    broker_vetted_desc: "Your customers get connected with trusted attorneys and repair facilities",
    broker_client: "Customer-First Care",
    broker_client_desc: "We prioritize your customers' recovery and satisfaction",
    broker_become_partner: "Join Our Broker & Agent Partner Network",

    cta_title: "Need Help After an Accident?",
    cta_subtitle: "We're here to connect you with trusted professionals who can help. No cost, no pressure, just guidance when you need it most.",
    cta_available: "We're Here For You",
    cta_247: "Available 24/7",
    cta_button: "Request Help Now, Available 24/7",
    cta_disclaimer: "Free consultation, no obligation",

    footer_description: "Your trusted coordination partner connecting injured individuals with vetted legal and repair professionals across California.",
    footer_quick_links: "Quick Links",
    footer_who_we_serve: "Who We Serve",
    footer_accident_victims: "Accident Victims",
    footer_auto_injuries: "Auto Accident Injuries",
    footer_broker_partners: "Insurance Agent & Broker Partners",
    footer_california: "All California Residents",
    footer_neutral: "California Care Alliance is a neutral coordination service, not a law firm or repair facility.",
    footer_rights: "All rights reserved.",

    partner_modal_title: "Partner Intake Form",
    support_modal_title: "Support Request Form",

    partner_type: "Partner Type",
    partner_type_placeholder: "Select partner type",
    insurance_broker: "Insurance Broker / Financial Planner",
    attorney_law_firm: "Attorney / Law Firm",
    insurance_agency: "Insurance Agency",
    medical_provider: "Medical Provider",
    social_services: "Social Services Organization",
    community_org: "Community Organization",
    other: "Other",

    agency_name: "Agency / Organization Name",
    agency_name_placeholder: "Enter your agency or organization name",
    contact_name: "Primary Contact Name",
    contact_name_placeholder: "Enter contact name",
    phone: "Phone Number",
    phone_placeholder: "Enter phone number",
    email: "Email Address",
    email_placeholder: "Enter email address",
    website: "Website (optional)",
    website_placeholder: "Enter website URL",

    insurance_products: "Insurance Products / Services Offered",
    auto_insurance: "Auto Insurance",
    health_insurance: "Health Insurance",
    life_insurance: "Life Insurance",
    disability_insurance: "Disability Insurance",
    workers_comp: "Workers' Compensation",
    property_insurance: "Property Insurance",
    other_specify: "Other (please specify)",

    other_products: "Please specify other products/services",
    other_products_placeholder: "Enter other products or services",

    customer_range: "Typical Number of Customers Served",
    customer_range_placeholder: "Select customer range",
    less_than_50: "Less than 50",
    range_50_200: "50-200",
    range_200_500: "200-500",
    range_500_1000: "500-1,000",
    more_than_1000: "More than 1,000",

    referred_by: "How did you hear about us? (optional)",
    referred_by_placeholder: "Enter referral source",

    consent: "I consent to be contacted by California Care Alliance regarding partnership opportunities",

    submit: "Submit",
    submitting: "Submitting...",
    close: "Close",

    success_title: "Success!",
    partner_success: "Your partner application has been submitted successfully. We'll review your information and contact you soon.",
    support_success: "Your support request has been submitted successfully. Our team will contact you soon to assist with your needs.",

    error_title: "Submission Error",
    error_message: "There was an error submitting your form. Please try again.",

    full_name: "Full Name",
    full_name_placeholder: "Enter your full name",
    address: "Address",
    address_placeholder: "Enter your full address",
    preferred_contact: "Preferred Contact Method",
    contact_phone: "Phone",
    contact_email: "Email",
    contact_text: "Text",

    help_type: "What type of help do you need?",
    help_placeholder: "Select help type",
    auto_accident: "Auto Accident Assistance",
    health_insurance_help: "Health Insurance Assistance",
    disability_claim: "Disability Claim Support",
    workers_comp_claim: "Workers' Compensation Claim",
    legal_referral: "Legal Referral",
    medical_referral: "Medical Referral",
    general_support: "General Support",

    what_happened: "Briefly describe what happened",
    what_happened_placeholder: "Provide details about your situation",

    incident_date: "Date of Incident",

    any_passengers: "Were there any passengers in the car?",
    yes: "Yes",
    no: "No",

    who_referred: "Who referred you?",
    who_referred_placeholder: "Enter who referred you (optional)",

    support_consent: "I consent to be contacted by California Care Alliance regarding support services",

    // Partner Portal
    provider_portal: "Partner Portal",
    provider_login: "Partner Login",
    provider_signup: "Partner Signup",
    provider_dashboard: "Dashboard",
    provider_profile: "Agency Profile",
    provider_referrals: "Referrals",
    new_referral: "New Referral",
    submit_referral: "Submit Referral",
    view_referral: "View Referral",
    referral_details: "Referral Details",
    customer_name: "Customer Name",
    customer_phone: "Customer Phone",
    customer_email: "Customer Email",
    accident_date: "Accident Date",
    people_involved: "People Involved",
    at_fault_status: "At-Fault Status",
    at_fault: "At Fault",
    not_at_fault: "Not At Fault",
    unknown: "Unknown",
    status_pending: "Pending",
    status_accepted: "Accepted",
    status_rejected: "Rejected",
    status_in_progress: "In Progress",
    status_closed: "Closed",
    main_contact: "Main Contact",
    secondary_contact: "Secondary Contact",
    save_changes: "Save Changes",
    back_to_referrals: "Back to Referrals",
    no_referrals: "No referrals yet",
    create_first_referral: "Create your first referral",
    welcome_back: "Welcome back",
    total_referrals: "Total Referrals",
    recent_referrals: "Recent Referrals",
    view_all: "View All",
    sign_out: "Sign Out",
    sign_in: "Sign In",
    create_account: "Create Account",
    dont_have_account: "Don't have an account?",
    already_have_account: "Already have an account?",
    back_to_home: "Back to Home",
  },
  es: {
    language_english: "Inglés",
    language_spanish: "Español",

    nav_how_we_help: "Cómo Ayudamos",
    nav_why_us: "Por Qué Nosotros",
    nav_how_it_works: "Cómo Funciona",
    nav_get_help: "Solicitar Ayuda Ahora",

    hero_main_title: "¿Tuvo un Accidente?",
    hero_main_subtitle: "Le Guiaremos en los Próximos Pasos",
    hero_description: "California Care Alliance lo conecta con representación legal verificada e instalaciones de reparación confiables. Sin presión, sin costo, solo orientación clara cuando más lo necesita.",
    hero_request_help: "Solicitar Ayuda Ahora",
    hero_learn_more: "Aprenda Cómo Funciona",

    stat_californians_value: "5000+",
    stat_californians: "Californianos Ayudados",
    stat_partners: "Socios Verificados",
    stat_brokers: "Socios de Agentes y Corredores",
    stat_response_time: "Tiempo de Respuesta Promedio",
    stat_support: "Soporte",
    stat_free: "Servicio Gratuito",

    services_title: "Cómo Ayudamos",
    services_subtitle: "Conectamos a personas con los profesionales adecuados para guiarles a través del estresante proceso de reclamos por lesiones y reparación de autos",
    service_legal_title: "Representación Legal",
    service_legal_desc: "Conéctese con abogados verificados que se especializan en reclamos por lesiones y lucharán por sus derechos sin costo inicial.",
    service_repair_title: "Coordinación de Reparación de Auto",
    service_repair_desc: "Conéctese con instalaciones de reparación confiables que restaurarán su vehículo correctamente y trabajarán con su reclamo.",
    service_broker_title: "Apoyo para Agentes y Corredores de Seguros",
    service_broker_desc: "Nos asociamos con agentes de seguros y corredores de seguros para proporcionar apoyo post-accidente sin problemas para sus clientes para que se sientan apoyados y el proceso se mantenga en curso.",

    why_title: "Por Qué Elegir California Care Alliance",
    why_subtitle: "No somos un bufete de abogados ni un taller de reparación, somos su puente de confianza hacia la ayuda que necesita",
    why_vetted_title: "Solo Socios Verificados",
    why_vetted_desc: "Solo lo conectamos con abogados e instalaciones de reparación de buena reputación en los que confiamos.",
    why_free_title: "Sin Costo para Conectarse",
    why_free_desc: "Conectarse es completamente gratuito sin obligación ni tarifas ocultas.",
    why_client_title: "Enfoque en el Cliente Primero",
    why_client_desc: "Su recuperación y cuidado son lo primero, no los costos del seguro ni la presión de ventas.",
    why_clear_title: "Pasos Claros a Seguir",
    why_clear_desc: "Proporcionamos orientación y claridad sin confusión ni tácticas agresivas.",

    how_title: "Cómo Funciona",
    how_subtitle: "Obtener la ayuda adecuada es simple con nuestro proceso comprobado",
    how_step1_title: "Contáctenos",
    how_step1_desc: "Contáctenos después de su accidente. Escucharemos su situación y entenderemos qué tipo de ayuda necesita.",
    how_step2_title: "Conéctese",
    how_step2_desc: "Lo conectaremos con representación legal verificada y/o instalaciones de reparación confiables según sus necesidades específicas.",
    how_step3_title: "Enfóquese en la Recuperación",
    how_step3_desc: "Deje que los profesionales manejen su reclamo y reparaciones mientras usted se enfoca en mejorar. Sin presión, solo apoyo.",

    testimonials_title: "Lo Que Dice la Gente",
    testimonials_subtitle: "Experiencias reales de aquellos a quienes hemos ayudado después de sus accidentes",
    testimonial1_name: "Robert M.",
    testimonial1_location: "Los Ángeles, CA",
    testimonial1_text: "Después de mi accidente, no sabía a dónde acudir. California Care Alliance me conectó con un abogado que realmente se preocupaba y un taller de reparación que hizo un trabajo de calidad. Sin presión, solo ayuda real.",
    testimonial2_name: "Jennifer L.",
    testimonial2_location: "San Francisco, CA",
    testimonial2_text: "Mi corredor de seguros me refirió a California Care Alliance después de mi accidente automovilístico. Hicieron todo mucho más fácil y me encontraron un gran abogado y arreglaron mi auto correctamente. ¡Muy agradecida!",
    testimonial3_name: "David T.",
    testimonial3_location: "San Diego, CA",
    testimonial3_text: "Estaba abrumado tratando con la compañía de seguros y encontrando a alguien confiable. California Care Alliance me conectó con profesionales que lucharon por mí. La mejor decisión que tomé.",

    broker_network_title: "Apoyo para Agentes y Corredores de Seguros",
    broker_network_subtitle: "¿Es usted un agente o corredor de seguros que busca apoyar mejor a sus clientes después de un accidente con un proceso de recuperación y reparación más fluido y confiable? Asóciese con California Care Alliance hoy.",
    broker_trusted: "Red de Confianza",
    broker_trusted_desc: "Únase a más de 50 agentes y corredores de seguros que ya se asocian con nosotros",
    broker_vetted: "Profesionales Verificados",
    broker_vetted_desc: "Sus clientes se conectan con abogados e instalaciones de reparación confiables",
    broker_client: "Cuidado Centrado en el Cliente",
    broker_client_desc: "Priorizamos la recuperación y satisfacción de sus clientes",
    broker_become_partner: "Únase a Nuestra Red de Socios de Agentes y Corredores",

    cta_title: "¿Necesita Ayuda Después de un Accidente?",
    cta_subtitle: "Estamos aquí para conectarlo con profesionales de confianza que pueden ayudar. Sin costo, sin presión, solo orientación cuando más lo necesita.",
    cta_available: "Estamos Aquí para Usted",
    cta_247: "Disponible 24/7",
    cta_button: "Solicitar Ayuda Ahora, Disponible 24/7",
    cta_disclaimer: "Consulta gratuita, sin obligación",

    footer_description: "Su socio de coordinación de confianza que conecta a personas lesionadas con profesionales legales y de reparación verificados en toda California.",
    footer_quick_links: "Enlaces Rápidos",
    footer_who_we_serve: "A Quién Servimos",
    footer_accident_victims: "Víctimas de Accidentes",
    footer_auto_injuries: "Lesiones por Accidente de Auto",
    footer_broker_partners: "Socios de Agentes y Corredores de Seguros",
    footer_california: "Todos los Residentes de California",
    footer_neutral: "California Care Alliance es un servicio de coordinación neutral, no un bufete de abogados ni una instalación de reparación.",
    footer_rights: "Todos los derechos reservados.",

    partner_modal_title: "Formulario de Admisión de Socios",
    support_modal_title: "Formulario de Solicitud de Ayuda",

    partner_type: "Tipo de Socio",
    partner_type_placeholder: "Seleccione el tipo de socio",
    insurance_broker: "Corredor de Seguros / Planificador Financiero",
    attorney_law_firm: "Abogado / Bufete de Abogados",
    insurance_agency: "Agencia de Seguros",
    medical_provider: "Proveedor Médico",
    social_services: "Organización de Servicios Sociales",
    community_org: "Organización Comunitaria",
    other: "Otro",

    agency_name: "Nombre de la Agencia / Organización",
    agency_name_placeholder: "Ingrese el nombre de su agencia u organización",
    contact_name: "Nombre del Contacto Principal",
    contact_name_placeholder: "Ingrese el nombre del contacto",
    phone: "Número de Teléfono",
    phone_placeholder: "Ingrese el número de teléfono",
    email: "Correo Electrónico",
    email_placeholder: "Ingrese el correo electrónico",
    website: "Sitio Web (opcional)",
    website_placeholder: "Ingrese la URL del sitio web",

    insurance_products: "Productos / Servicios de Seguros Ofrecidos",
    auto_insurance: "Seguro de Auto",
    health_insurance: "Seguro de Salud",
    life_insurance: "Seguro de Vida",
    disability_insurance: "Seguro por Discapacidad",
    workers_comp: "Compensación de Trabajadores",
    property_insurance: "Seguro de Propiedad",
    other_specify: "Otro (por favor especifique)",

    other_products: "Por favor especifique otros productos/servicios",
    other_products_placeholder: "Ingrese otros productos o servicios",

    customer_range: "Número Típico de Clientes Atendidos",
    customer_range_placeholder: "Seleccione el rango de clientes",
    less_than_50: "Menos de 50",
    range_50_200: "50-200",
    range_200_500: "200-500",
    range_500_1000: "500-1,000",
    more_than_1000: "Más de 1,000",

    referred_by: "¿Cómo se enteró de nosotros? (opcional)",
    referred_by_placeholder: "Ingrese la fuente de referencia",

    consent: "Consiento en ser contactado por California Care Alliance sobre oportunidades de asociación",

    submit: "Enviar",
    submitting: "Enviando...",
    close: "Cerrar",

    success_title: "¡Éxito!",
    partner_success: "Su solicitud de socio ha sido enviada exitosamente. Revisaremos su información y nos pondremos en contacto pronto.",
    support_success: "Su solicitud de ayuda ha sido enviada exitosamente. Nuestro equipo se pondrá en contacto pronto para asistirle con sus necesidades.",

    error_title: "Error de Envío",
    error_message: "Hubo un error al enviar su formulario. Por favor, inténtelo de nuevo.",

    full_name: "Nombre Completo",
    full_name_placeholder: "Ingrese su nombre completo",
    address: "Dirección",
    address_placeholder: "Ingrese su dirección completa",
    preferred_contact: "Método de Contacto Preferido",
    contact_phone: "Teléfono",
    contact_email: "Correo Electrónico",
    contact_text: "Texto",

    help_type: "¿Qué tipo de ayuda necesita?",
    help_placeholder: "Seleccione el tipo de ayuda",
    auto_accident: "Asistencia por Accidente de Auto",
    health_insurance_help: "Asistencia con Seguro de Salud",
    disability_claim: "Apoyo con Reclamo por Discapacidad",
    workers_comp_claim: "Reclamo de Compensación de Trabajadores",
    legal_referral: "Referencia Legal",
    medical_referral: "Referencia Médica",
    general_support: "Apoyo General",

    what_happened: "Describa brevemente lo que sucedió",
    what_happened_placeholder: "Proporcione detalles sobre su situación",

    incident_date: "Fecha del Incidente",

    any_passengers: "¿Había pasajeros en el coche?",
    yes: "Sí",
    no: "No",

    who_referred: "¿Quién le refirió?",
    who_referred_placeholder: "Ingrese quién le refirió (opcional)",

    support_consent: "Consiento en ser contactado por California Care Alliance sobre servicios de apoyo",

    // Partner Portal
    provider_portal: "Portal de Socios",
    provider_login: "Iniciar Sesión de Socio",
    provider_signup: "Registro de Socio",
    provider_dashboard: "Panel de Control",
    provider_profile: "Perfil de Agencia",
    provider_referrals: "Referencias",
    new_referral: "Nueva Referencia",
    submit_referral: "Enviar Referencia",
    view_referral: "Ver Referencia",
    referral_details: "Detalles de la Referencia",
    customer_name: "Nombre del Cliente",
    customer_phone: "Teléfono del Cliente",
    customer_email: "Correo del Cliente",
    accident_date: "Fecha del Accidente",
    people_involved: "Personas Involucradas",
    at_fault_status: "Estado de Culpabilidad",
    at_fault: "Con Culpa",
    not_at_fault: "Sin Culpa",
    unknown: "Desconocido",
    status_pending: "Pendiente",
    status_accepted: "Aceptado",
    status_rejected: "Rechazado",
    status_in_progress: "En Progreso",
    status_closed: "Cerrado",
    main_contact: "Contacto Principal",
    secondary_contact: "Contacto Secundario",
    save_changes: "Guardar Cambios",
    back_to_referrals: "Volver a Referencias",
    no_referrals: "No hay referencias todavía",
    create_first_referral: "Crear su primera referencia",
    welcome_back: "Bienvenido de nuevo",
    total_referrals: "Total de Referencias",
    recent_referrals: "Referencias Recientes",
    view_all: "Ver Todo",
    sign_out: "Cerrar Sesión",
    sign_in: "Iniciar Sesión",
    create_account: "Crear Cuenta",
    dont_have_account: "¿No tiene una cuenta?",
    already_have_account: "¿Ya tiene una cuenta?",
    back_to_home: "Volver al Inicio",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('user-language');
    return (savedLanguage === 'es' || savedLanguage === 'en') ? savedLanguage : 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('user-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
