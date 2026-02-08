import { useState } from 'react';
import {
  Heart,
  Shield,
  Users,
  CheckCircle,
  Menu,
  X,
  Star,
  ArrowRight,
  Award,
  Clock,
  DollarSign,
  Car
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { SupportRequestForm } from '../components/SupportRequestForm';
import { AnimatedCounter } from '../components/AnimatedCounter';
import LiveActivityIndicator from '../components/LiveActivityIndicator';
import { LanguageSelectionModal } from '../components/LanguageSelectionModal';
import { useLanguage } from '../contexts/LanguageContext';

export function HomePage() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <img
                src="/california-care-alliance-logo-clean.png"
                alt="California Care Alliance"
                className="h-14 w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <a href="#services" onClick={(e) => smoothScroll(e, '#services')} className="text-slate-600 hover:text-blue-900 transition-colors font-medium text-sm lg:text-base whitespace-nowrap border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50">{t('nav_how_we_help')}</a>
              <a href="#why-choose-us" onClick={(e) => smoothScroll(e, '#why-choose-us')} className="text-slate-600 hover:text-blue-900 transition-colors font-medium text-sm lg:text-base whitespace-nowrap border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50">{t('nav_why_us')}</a>
              <a href="#broker-partner" onClick={(e) => smoothScroll(e, '#broker-partner')} className="text-slate-600 hover:text-blue-900 transition-colors font-medium text-sm lg:text-base whitespace-nowrap border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50">Insurance Partners</a>
              <Link to="/provider/login" className="text-slate-600 hover:text-blue-900 transition-colors font-medium text-sm lg:text-base whitespace-nowrap border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50">Partner Portal</Link>

              <div className="flex items-center gap-2 border-l border-slate-200 pl-4 lg:pl-6">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 lg:px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'en' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {t('language_english')}
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`px-2 lg:px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'es' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {t('language_spanish')}
                </button>
              </div>

              <button
                onClick={() => setSupportModalOpen(true)}
                className="bg-blue-900 text-white px-4 lg:px-6 py-2.5 rounded-lg hover:bg-blue-950 transition-all duration-300 font-semibold text-sm lg:text-base whitespace-nowrap"
              >
                {t('nav_get_help')}
              </button>
            </div>

            <button
              className="md:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" onClick={(e) => smoothScroll(e, '#services')} className="block py-2 text-slate-600 hover:text-blue-900">{t('nav_how_we_help')}</a>
              <a href="#why-choose-us" onClick={(e) => smoothScroll(e, '#why-choose-us')} className="block py-2 text-slate-600 hover:text-blue-900">{t('nav_why_us')}</a>
              <a href="#broker-partner" onClick={(e) => smoothScroll(e, '#broker-partner')} className="block py-2 text-slate-600 hover:text-blue-900">Insurance Partners</a>
              <Link to="/provider/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 hover:text-blue-900">Partner Portal</Link>

              <div className="flex items-center justify-center gap-3 py-3 border-t border-slate-100">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${language === 'en' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {t('language_english')}
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${language === 'es' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {t('language_spanish')}
                </button>
              </div>

              <button
                onClick={() => { setSupportModalOpen(true); setMobileMenuOpen(false); }}
                className="block w-full text-center bg-blue-900 text-white px-6 py-2.5 rounded-lg hover:bg-blue-950 transition-colors font-semibold"
              >
                {t('nav_get_help')}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              {t('hero_main_title')}{' '}
              <span className="text-rose-700">{t('hero_main_subtitle')}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
              {t('hero_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => setSupportModalOpen(true)}
                className="group bg-blue-900 text-white px-8 py-4 rounded-xl hover:bg-blue-950 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30"
              >
                {t('hero_request_help')}
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <a
                href="#services"
                onClick={(e) => smoothScroll(e, '#services')}
                className="bg-white text-slate-700 px-8 py-4 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold text-center border border-slate-200 hover:border-slate-300"
              >
                {t('hero_learn_more')}
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { type: 'counter', value: 5000, suffix: '+', label: t('stat_californians') },
                { type: 'counter', value: 100, suffix: '+', label: t('stat_partners') },
                { type: 'counter', value: 85, suffix: '+', label: t('stat_brokers') },
                { type: 'counter', value: 10, prefix: '<', suffix: ' min', label: t('stat_response_time') },
                { type: 'text', display: '24/7', label: t('stat_support') },
                { type: 'counter', value: 100, suffix: '%', label: t('stat_free') }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center group cursor-default bg-white border border-slate-200 rounded-xl p-5 md:p-6 hover:shadow-md hover:border-blue-200 transition-all duration-300 min-w-0"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-2 transform transition-all duration-300 group-hover:scale-110 group-hover:text-blue-950 whitespace-nowrap overflow-wrap-anywhere max-w-full">
                    {stat.type === 'counter' ? (
                      <AnimatedCounter
                        end={stat.value!}
                        prefix={stat.prefix || ''}
                        suffix={stat.suffix || ''}
                        duration={2000}
                      />
                    ) : (
                      stat.display
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium transition-colors duration-300 group-hover:text-slate-800 leading-tight max-w-full overflow-wrap-anywhere">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="pb-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{t('services_title')}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('services_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-7 h-7" />,
                title: t('service_legal_title'),
                description: t('service_legal_desc')
              },
              {
                icon: <Car className="w-7 h-7" />,
                title: t('service_repair_title'),
                description: t('service_repair_desc')
              },
              {
                icon: <Users className="w-7 h-7" />,
                title: t('service_broker_title'),
                description: t('service_broker_desc')
              }
            ].map((service, index) => (
              <div
                key={index}
                className="bg-slate-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-blue-100 group"
              >
                <div className="w-14 h-14 bg-blue-900 rounded-xl flex items-center justify-center text-white mb-6 group-hover:bg-blue-950 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose-us" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{t('why_title')}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
              {t('why_subtitle')}
            </p>

            <div className="flex justify-center">
              <div className="max-w-2xl w-full rounded-2xl overflow-hidden shadow-xl border-4 border-slate-100 hover:shadow-2xl transition-shadow duration-300">
                <img
                  src="/cca_team_photo.png"
                  alt="California Care Alliance Team"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Award className="w-6 h-6" />,
                title: t('why_vetted_title'),
                description: t('why_vetted_desc')
              },
              {
                icon: <DollarSign className="w-6 h-6" />,
                title: t('why_free_title'),
                description: t('why_free_desc')
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: t('why_client_title'),
                description: t('why_client_desc')
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: t('why_clear_title'),
                description: t('why_clear_desc')
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-900 mx-auto mb-4 shadow-sm border border-slate-100">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('how_title')}</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              {t('how_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: t('how_step1_title'),
                description: t('how_step1_desc')
              },
              {
                step: "02",
                title: t('how_step2_title'),
                description: t('how_step2_desc')
              },
              {
                step: "03",
                title: t('how_step3_title'),
                description: t('how_step3_desc')
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
                  <div className="text-5xl font-bold text-white/30 mb-4">{step.step}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-blue-100">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{t('testimonials_title')}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('testimonials_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: t('testimonial1_name'),
                location: t('testimonial1_location'),
                text: t('testimonial1_text'),
                rating: 5
              },
              {
                name: t('testimonial2_name'),
                location: t('testimonial2_location'),
                text: t('testimonial2_text'),
                rating: 5
              },
              {
                name: t('testimonial3_name'),
                location: t('testimonial3_location'),
                text: t('testimonial3_text'),
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="border-t border-slate-200 pt-4">
                  <div className="font-semibold text-slate-800">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Broker Partner Section */}
      <section id="broker-partner" className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-900" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{t('broker_network_title')}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {t('broker_network_subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: <Award className="w-6 h-6" />, title: t('broker_trusted'), desc: t('broker_trusted_desc') },
                { icon: <Shield className="w-6 h-6" />, title: t('broker_vetted'), desc: t('broker_vetted_desc') },
                { icon: <Heart className="w-6 h-6" />, title: t('broker_client'), desc: t('broker_client_desc') }
              ].map((item, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 text-blue-900">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/provider/signup"
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-4 rounded-xl hover:bg-blue-950 transition-all duration-300 font-semibold shadow-lg shadow-blue-900/20"
              >
                {t('broker_become_partner')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('cta_title')}</h2>
                <p className="text-lg text-slate-300 mb-8">
                  {t('cta_subtitle')}
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900/40 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">{t('cta_available')}</div>
                    <div className="text-white font-medium">{t('cta_247')}</div>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-right">
                <button
                  onClick={() => setSupportModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-rose-700 text-white px-10 py-5 rounded-xl hover:bg-rose-800 transition-all duration-300 font-semibold text-lg shadow-lg shadow-rose-700/30"
                >
                  {t('cta_button')}
                  <ArrowRight className="w-6 h-6" />
                </button>
                <p className="text-slate-400 text-sm mt-4">{t('cta_disclaimer')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            <div className="md:col-span-1">
              <img
                src="/california-care-alliance-logo-clean.png"
                alt="California Care Alliance"
                className="h-20 w-auto mb-6 brightness-0 invert"
              />
              <p className="text-slate-400 text-sm leading-relaxed">
                {t('footer_description')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">{t('footer_quick_links')}</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#services" className="text-slate-400 hover:text-blue-300 transition-colors">{t('nav_how_we_help')}</a></li>
                <li><a href="#why-choose-us" className="text-slate-400 hover:text-blue-300 transition-colors">{t('nav_why_us')}</a></li>
                <li><a href="#how-it-works" className="text-slate-400 hover:text-blue-300 transition-colors">{t('nav_how_it_works')}</a></li>
                <li><button onClick={() => setSupportModalOpen(true)} className="text-slate-400 hover:text-blue-300 transition-colors">{t('nav_get_help')}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">{t('footer_who_we_serve')}</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>{t('footer_accident_victims')}</li>
                <li>{t('footer_auto_injuries')}</li>
                <li>{t('footer_broker_partners')}</li>
                <li>{t('footer_california')}</li>
              </ul>
              <div className="mt-6">
                <Link
                  to="/provider/signup"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  {t('broker_become_partner')}
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p className="mb-2">
              {t('footer_neutral')}
            </p>
            <p>
              &copy; {new Date().getFullYear()} California Care Alliance. {t('footer_rights')}
            </p>
            <Link
              to="/admin/login"
              className="inline-block mt-4 text-slate-700 hover:text-slate-400 text-xs transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* Support Request Modal */}
      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        title={t('support_modal_title')}
      >
        <SupportRequestForm onSuccess={() => {}} />
      </Modal>

      <LiveActivityIndicator />

      <LanguageSelectionModal onSelectLanguage={setLanguage} />
    </div>
  );
}

export default HomePage;
