import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useSiteMedia } from './hooks/useSiteMedia';
import {
  HiOutlineBolt,
  HiOutlineHeart,
  HiOutlineSquares2X2,
  HiOutlineBeaker,
  HiStar,
  HiOutlineStar,
  HiChevronLeft,
  HiChevronRight,
  HiBars3,
  HiXMark,
  HiOutlineFire,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import { FaInstagram, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { SiTiktok } from 'react-icons/si';
import './App.css';

function videoMimeType(url) {
  if (!url) return 'video/mp4';
  if (/\.webm$/i.test(url)) return 'video/webm';
  if (/\.mov$/i.test(url)) return 'video/quicktime';
  return 'video/mp4';
}

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Trainers', href: '#trainers' },
  { label: 'Results', href: '#transformations' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Stories', href: '#testimonials' },
  { label: 'Review', href: '#review' },
];

const features = [
  {
    title: 'Training',
    body: 'Periodized programs, form coaching, and floor intelligence—so every session compounds.',
    Icon: HiOutlineSquares2X2,
  },
  {
    title: 'Cardio',
    body: 'Assault runners, bikes, and sleds engineered for intervals that torch without boring you.',
    Icon: HiOutlineHeart,
  },
  {
    title: 'Strength',
    body: 'Competition racks, calibrated plates, and specialty bars for heavy, honest work.',
    Icon: HiOutlineBolt,
  },
  {
    title: 'Diet',
    body: 'Macro frameworks and check-ins that match your training phase—not generic meal plans.',
    Icon: HiOutlineBeaker,
  },
  {
    title: 'Recovery',
    body: 'Accelerate adaptation with contrast therapy, ice baths, and our dedicated sauna suites.',
    Icon: HiOutlineFire,
  },
  {
    title: 'Community',
    body: 'Built on competition and accountability. Join seasonal powerlifting meets and crew challenges.',
    Icon: HiOutlineUserGroup,
  },
];

const TRAINERS_BASE = [
  {
    name: 'Sofia Reyes',
    role: 'Personal Trainer',
    bio: 'Fat loss, conditioning & habit systems',
  },
  {
    name: 'Marcus Webb',
    role: 'Strength Coach',
    bio: 'NSCA-CSCS · powerlifting & peaking',
  },
  {
    name: 'David Okonkwo',
    role: 'Performance Coach',
    bio: 'Speed & agility · return-to-play protocols',
  },
  {
    name: 'Riley Park',
    role: 'Nutrition Expert',
    bio: 'Sports nutrition · macro periodization',
  },
];

const TESTIMONIALS_BASE = [
  {
    quote: 'The floor feels like a Nike campaign—except everyone here actually trains.',
    name: 'Alex P.',
    meta: 'Member · 14 months',
    rating: 5,
  },
  {
    quote: 'Coaching is surgical. My squat and pull patterns finally match my intent.',
    name: 'Samira K.',
    meta: 'Member · 6 months',
    rating: 5,
  },
  {
    quote: 'Black-on-black, red hits, zero fluff. This is the brand gym I wanted in my city.',
    name: 'Chris L.',
    meta: 'Member · 3 years',
    rating: 5,
  },
  {
    quote: 'Programming + recovery lounge = I finally stack weeks without burning out.',
    name: 'Riley M.',
    meta: 'Member · 9 months',
    rating: 5,
  },
  {
    quote: 'Elite gear, respectful culture, and coaches who still compete. Rare combo.',
    name: 'Devon T.',
    meta: 'Member · 2 years',
    rating: 5,
  },
];

const easePremium = [0.16, 1, 0.3, 1];
const easeSmooth = [0.25, 0.46, 0.45, 0.94];
const durSlow = 0.72;
const durMed = 0.52;

function scrollToId(hash) {
  const el = document.querySelector(hash);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function App() {
  const reduceMotion = useReducedMotion();
  const media = useSiteMedia();
  const transformSlides = media.transformations;
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroBgY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ['0%', '0%'] : ['0%', '20%']
  );
  const heroContentY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ['0%', '0%'] : ['0%', '9%']
  );

  const trainers = useMemo(
    () => TRAINERS_BASE.map((t, i) => ({ ...t, image: media.trainerImages[i] })),
    [media]
  );
  const testimonials = useMemo(
    () => TESTIMONIALS_BASE.map((t, i) => ({ ...t, photo: media.testimonialPhotos[i] })),
    [media]
  );
  const featuresWithCovers = features.map((f, i) => ({
    ...f,
    cover: media.featureImages ? media.featureImages[i] : null,
    video: media.videoPool?.length ? media.videoPool[i % media.videoPool.length] : null,
  }));

  const trainerSlots = 4;
  const trainerData = trainers.map((t, i) => ({
    ...t,
    image: media.trainerImages[i] || t.image,
  }));
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [transformIndex, setTransformIndex] = useState(0);
  const [transformDir, setTransformDir] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialDir, setTestimonialDir] = useState(0);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const starDisplay = reviewHover || reviewRating;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const nextTransform = useCallback(() => {
    if (!transformSlides?.length) return;
    setTransformDir(1);
    setTransformIndex((i) => (i + 1) % transformSlides.length);
  }, [transformSlides?.length]);

  const prevTransform = useCallback(() => {
    if (!transformSlides?.length) return;
    setTransformDir(-1);
    setTransformIndex((i) => (i - 1 + transformSlides.length) % transformSlides.length);
  }, [transformSlides?.length]);

  const nextTestimonial = useCallback(() => {
    setTestimonialDir(1);
    setTestimonialIndex((i) => (i + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setTestimonialDir(-1);
    setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !media.heroVideo || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [media.heroVideo]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(nextTestimonial, 7200);
    return () => clearInterval(id);
  }, [reduceMotion, nextTestimonial]);

  const slideVariants = useMemo(() => {
    if (reduceMotion) {
      return {
        enter: { opacity: 0 },
        center: { opacity: 1, x: 0, y: 0 },
        exit: { opacity: 0 },
      };
    }
    return {
      enter: (dir) => ({
        x: dir > 0 ? '45%' : '-45%',
        opacity: 0,
        scale: 0.96,
      }),
      center: {
        x: 0,
        opacity: 1,
        scale: 1,
      },
      exit: (dir) => ({
        x: dir < 0 ? '45%' : '-45%',
        opacity: 0,
        scale: 0.96,
      }),
    };
  }, [reduceMotion]);

  const heroStagger = useMemo(() => {
    if (reduceMotion) {
      return {
        show: { transition: { staggerChildren: 0 } },
      };
    }
    return {
      show: {
        transition: { staggerChildren: 0.14, delayChildren: 0.15 },
      },
    };
  }, [reduceMotion]);

  const heroItem = useMemo(() => {
    if (reduceMotion) {
      return {
        hidden: { opacity: 1, x: 0, y: 0 },
        show: { opacity: 1, x: 0, y: 0 },
      };
    }
    return {
      hidden: { opacity: 0, x: -40, y: 0 },
      show: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: durSlow, ease: easeSmooth },
      },
    };
  }, [reduceMotion]);

  const featureStagger = useMemo(() => {
    if (reduceMotion) return { show: {} };
    return {
      show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
    };
  }, [reduceMotion]);

  const featureItem = useMemo(() => {
    if (reduceMotion) {
      return { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } };
    }
    return {
      hidden: { opacity: 0, y: 28 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: durMed, ease: easeSmooth },
      },
    };
  }, [reduceMotion]);

  const trainerStagger = useMemo(() => {
    if (reduceMotion) return { show: { transition: { staggerChildren: 0 } } };
    return {
      show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
    };
  }, [reduceMotion]);

  const trainerCardVariant = useMemo(() => {
    if (reduceMotion) {
      return { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } };
    }
    return {
      hidden: { opacity: 0, y: 36 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.68, ease: easeSmooth },
      },
    };
  }, [reduceMotion]);

  function handleNavClick(e, href) {
    e.preventDefault();
    scrollToId(href);
    setMenuOpen(false);
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim() || reviewRating < 1) return;
    setReviewSubmitted(true);
  }

  const featureHover = reduceMotion
    ? {}
    : {
        whileHover: {
          scale: 1.025,
          rotateX: -2,
          rotateY: 2,
          transition: { type: 'spring', stiffness: 300, damping: 24 },
        },
      };

  const sectionMotion = {
    initial: reduceMotion ? false : { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-8% 0px' },
    transition: { duration: 0.72, ease: easeSmooth },
  };

  const priceHover = reduceMotion
    ? {}
    : {
        whileHover: { y: -5, transition: { type: 'spring', stiffness: 320, damping: 22 } },
      };

  return (
    <div className="app">
      <header className={`nav${scrolled ? ' nav--solid' : ''}`} role="banner">
        <div className="nav__inner">
          <a
            href="#hero"
            className="nav__brand"
            onClick={(e) => handleNavClick(e, '#hero')}
          >
            IRON<span>HOUSE</span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {navItems.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="nav__link"
                onClick={(e) => handleNavClick(e, href)}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <button
              type="button"
              className="nav__cta"
              onClick={() => scrollToId('#pricing')}
            >
              Join now
            </button>
            <button
              type="button"
              className="nav__menu-btn"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <HiXMark size={22} aria-hidden /> : <HiBars3 size={22} aria-hidden />}
              <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              className="nav__backdrop"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              id="mobile-drawer"
              className="nav__drawer"
              role="dialog"
              aria-modal="true"
              initial={reduceMotion ? false : { x: '100%' }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: '100%' }}
              transition={{ duration: 0.5, ease: easePremium }}
            >
              {navItems.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="nav__drawer-link"
                  onClick={(e) => handleNavClick(e, href)}
                >
                  {label}
                </a>
              ))}
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: '1.5rem' }}
                onClick={() => {
                  scrollToId('#pricing');
                  setMenuOpen(false);
                }}
              >
                Join now
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main>
        <section
          id="hero"
          className="hero"
          aria-labelledby="hero-heading"
          ref={heroRef}
        >
          <motion.div
            className="hero__video-layer"
            style={{ y: heroBgY }}
            aria-hidden="true"
          >
            <div className="hero__video-wrap-inner">
              {media.heroVideo ? (
                <video
                  ref={videoRef}
                  className="hero__video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={media.heroPoster}
                >
                  <source
                    src={media.heroVideo}
                    type={videoMimeType(media.heroVideo)}
                  />
                </video>
              ) : null}
              {!media.heroVideo ? (
                <div
                  className="hero__video-fallback"
                  style={{ backgroundImage: `url("${media.heroPoster}")` }}
                />
              ) : (
                <div
                  className="hero__video-fallback hero__video-fallback--poster"
                  style={{ backgroundImage: `url("${media.heroPoster}")` }}
                  aria-hidden="true"
                />
              )}
              <div className="hero__scrim" />
              <div className="hero__vignette" />
              <div className="hero__grain" />
            </div>
          </motion.div>

          <motion.div className="hero__content" style={{ y: heroContentY }}>
            <motion.div
              variants={heroStagger}
              initial="hidden"
              animate="show"
            >
              <motion.p className="hero__kicker" variants={heroItem}>
                Premium performance floor
              </motion.p>
              <motion.h1 id="hero-heading" className="hero__heading" variants={heroItem}>
                Transform your body
              </motion.h1>
              <motion.p className="hero__sub" variants={heroItem}>
                Train like an athlete in a space built for focus—coaching, culture, and equipment
                dialed for serious results.
              </motion.p>
              
              <motion.div className="hero__metrics" variants={heroItem}>
                <div className="hero__metric">
                  <span className="hero__metric-val">50+</span>
                  <span className="hero__metric-label">Pro Machines</span>
                </div>
                <div className="hero__metric">
                  <span className="hero__metric-val">12</span>
                  <span className="hero__metric-label">Elite Coaches</span>
                </div>
                <div className="hero__metric">
                  <span className="hero__metric-val">24</span>
                  <span className="hero__metric-label">Hour Access</span>
                </div>
              </motion.div>
              <motion.div className="hero__cta-row" variants={heroItem}>
                <motion.button
                  type="button"
                  className="btn-primary"
                  onClick={() => scrollToId('#pricing')}
                  whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.4, ease: easePremium }}
                >
                  Join now
                </motion.button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => scrollToId('#features')}
                >
                  Explore training
                </button>
              </motion.div>
            </motion.div>
          </motion.div>

          {!reduceMotion && (
            <motion.div
              className="hero__scroll-hint"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8, ease: easePremium }}
            >
              <span>Scroll</span>
              <span className="hero__scroll-line" />
            </motion.div>
          )}
        </section>

        <motion.section
          id="features"
          className="section"
          aria-labelledby="features-heading"
          {...sectionMotion}
        >
          <div className="section__inner">
            <motion.p
              className="section__label"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easePremium }}
            >
              Capabilities
            </motion.p>
            <motion.h2
              id="features-heading"
              className="section__title"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easePremium, delay: 0.1 }}
            >
              Engineered for output.
            </motion.h2>
            <motion.p
              className="section__lead"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easePremium, delay: 0.2 }}
            >
              Four pillars—each backed by coaching, programming, and a floor that keeps up with
              your ambition.
            </motion.p>
            <motion.div
              className="features__grid"
              variants={featureStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
            >
              {featuresWithCovers.map(({ title, body, Icon, cover, video }) => (
                <motion.article
                  key={title}
                  className="feature-card"
                  variants={featureItem}
                  style={{ transformStyle: 'preserve-3d' }}
                  {...featureHover}
                >
                  <div
                    className="feature-card__bg"
                    style={{ backgroundImage: `url("${cover}")` }}
                    aria-hidden="true"
                  />
                  {video && (
                    <video
                      className="feature-card__video"
                      src={video}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  )}
                  <div className="feature-card__inner">
                    <div className="feature-card__icon" aria-hidden="true">
                      <Icon />
                    </div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="trainers"
          className="section"
          aria-labelledby="trainers-heading"
          {...sectionMotion}
        >
          <div className="section__inner">
            <motion.p
              className="section__label"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: durMed, ease: easePremium }}
            >
              Trainers
            </motion.p>
            <motion.h2
              id="trainers-heading"
              className="section__title section__title--trainers"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: durMed, ease: easePremium, delay: 0.06 }}
            >
              Coaching team
            </motion.h2>
            <motion.p
              className="section__lead section__lead--trainers"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: durMed, ease: easePremium, delay: 0.1 }}
            >
              Certified coaches across strength, conditioning, and nutrition.
            </motion.p>
            <motion.div
              className="trainers__grid"
              variants={trainerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-55px' }}
            >
              {trainers.map((t) => (
                <motion.article
                  key={t.name}
                  className="trainer-card"
                  variants={trainerCardVariant}
                  style={{ transformStyle: 'preserve-3d' }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          scale: 1.02,
                          rotateX: 2,
                          rotateY: -2,
                          transition: { type: 'spring', stiffness: 300, damping: 24 },
                        }
                  }
                >
                  <div className="trainer-card__media">
                    <img
                      className="trainer-card__img"
                      src={t.image}
                      alt={`${t.name}, ${t.role}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="trainer-card__gradient" aria-hidden="true" />
                    <div className="trainer-card__info">
                      <p className="trainer-card__role">{t.role}</p>
                      <h3 className="trainer-card__name">{t.name}</h3>
                      {t.bio ? <p className="trainer-card__bio">{t.bio}</p> : null}
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="transformations"
          className="section transforms"
          aria-labelledby="transformations-heading"
          {...sectionMotion}
        >
          <div className="section__inner">
            <motion.p
              className="section__label"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easePremium }}
            >
              Transformations
            </motion.p>
            <motion.h2
              id="transformations-heading"
              className="section__title"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easePremium, delay: 0.1 }}
            >
              Different bodies. Same standard.
            </motion.h2>
            <motion.p
              className="section__lead"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easePremium, delay: 0.2 }}
            >
              Swipe through member journeys—real people, real grit, real results.
            </motion.p>

            <div className="transforms__viewport">
              <AnimatePresence mode="wait" custom={transformDir} initial={false}>
                <motion.div
                  key={transformSlides[transformIndex].id}
                  custom={transformDir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduceMotion ? 0.15 : 0.72, ease: easePremium }}
                  className={`transforms__slide ${transformSlides[transformIndex]?.combined ? 'transforms__slide--combined' : ''}`}
                >
                  {transformSlides[transformIndex]?.combined ? (
                    <div
                      className="transforms__combined"
                      style={{
                        backgroundImage: `url("${transformSlides[transformIndex]?.combined}")`,
                      }}
                    >
                      <div className="transforms__labels">
                        <span className="transforms__tag">Before</span>
                        <span className="transforms__tag">After</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="transforms__half"
                        style={{
                          backgroundImage: `url("${transformSlides[transformIndex]?.before}")`,
                        }}
                      >
                        <span className="transforms__tag">Before</span>
                      </div>
                      <div
                        className="transforms__half"
                        style={{
                          backgroundImage: `url("${transformSlides[transformIndex]?.after}")`,
                        }}
                      >
                        <span className="transforms__tag">After</span>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="transforms__caption">{transformSlides[transformIndex]?.caption}</p>
            <div className="transforms__controls">
              <button
                type="button"
                className="transforms__arrow"
                aria-label="Previous transformation"
                onClick={prevTransform}
              >
                <HiChevronLeft size={22} />
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }} role="tablist" aria-label="Transformation slides">
                {transformSlides.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={i === transformIndex}
                    className={`transforms__dot${i === transformIndex ? ' transforms__dot--active' : ''}`}
                    onClick={() => {
                      setTransformDir(i > transformIndex ? 1 : -1);
                      setTransformIndex(i);
                    }}
                    aria-label={`Show transformation ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className="transforms__arrow"
                aria-label="Next transformation"
                onClick={nextTransform}
              >
                <HiChevronRight size={22} />
              </button>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="pricing"
          className="section"
          aria-labelledby="pricing-heading"
          {...sectionMotion}
        >
          <div className="section__inner">
            <motion.p
              className="section__label"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easePremium }}
            >
              Membership
            </motion.p>
            <motion.h2
              id="pricing-heading"
              className="section__title"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easePremium, delay: 0.1 }}
            >
              Basic. Pro. Elite.
            </motion.h2>
            <motion.p
              className="section__lead"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easePremium, delay: 0.2 }}
            >
              Pro is where most athletes land—full access, recovery, and a monthly form audit.
            </motion.p>
            <div className="pricing__grid">
              <motion.article
                className="price-card"
                initial={reduceMotion ? false : { opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: durSlow, ease: easePremium }}
                {...priceHover}
              >
                <h3 className="price-card__name">Basic</h3>
                <p className="price-card__price">
                  $79<span>/mo</span>
                </p>
                <p className="price-card__note">Floor access during staffed hours.</p>
                <ul>
                  {['Full training floor', 'Locker + showers', '1 guest pass monthly'].map((x) => (
                    <li key={x}>
                      <HiOutlineBolt aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn-primary">
                  Start Basic
                </button>
              </motion.article>

              <motion.article
                className="price-card price-card--featured"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, ease: easePremium, delay: 0.1 }}
                {...priceHover}
              >
                {media.videoPool?.[1] && (
                  <video
                    className="price-card__video"
                    src={media.videoPool[1]}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                )}
                <span className="price-card__badge">Most popular</span>
                <h3 className="price-card__name">Pro</h3>
                <p className="price-card__price">
                  $129<span>/mo</span>
                </p>
                <p className="price-card__note">24/7 access, recovery suite, monthly check-in.</p>
                <ul>
                  {[
                    'Everything in Basic',
                    'Cold plunge + sauna',
                    'Form audit monthly',
                    'Priority class drops',
                  ].map((x) => (
                    <li key={x}>
                      <HiOutlineBolt aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn-primary">
                  Go Pro
                </button>
              </motion.article>

              <motion.article
                className="price-card"
                initial={reduceMotion ? false : { opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: durSlow, ease: easePremium, delay: 0.16 }}
                {...priceHover}
              >
                <h3 className="price-card__name">Elite</h3>
                <p className="price-card__price">
                  $249<span>/mo</span>
                </p>
                <p className="price-card__note">Hands-on coaching and custom programming weekly.</p>
                <ul>
                  {[
                    'Everything in Pro',
                    'Weekly program updates',
                    '1:1 session monthly',
                    'Nutrition framework',
                  ].map((x) => (
                    <li key={x}>
                      <HiOutlineBolt aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn-primary">
                  Go Elite
                </button>
              </motion.article>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="testimonials"
          className="section"
          aria-labelledby="testimonials-heading"
          {...sectionMotion}
        >
          <div className="section__inner">
            <motion.p
              className="section__label"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: durMed, ease: easePremium }}
            >
              Testimonials
            </motion.p>
            <motion.h2
              id="testimonials-heading"
              className="section__title"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: durMed, ease: easePremium, delay: 0.06 }}
            >
              Word from the floor.
            </motion.h2>

            <div className="testimonials__wrap">
              <AnimatePresence mode="wait" custom={testimonialDir} initial={false}>
                <motion.div
                  key={testimonials[testimonialIndex].name}
                  custom={testimonialDir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduceMotion ? 0.15 : 0.68, ease: easePremium }}
                  className="testimonial-slide"
                >
                  <div className="testimonial-slide__layout">
                    <div className="testimonial-slide__avatar">
                      <img
                        src={testimonials[testimonialIndex].photo}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="testimonial-slide__body">
                      <div
                        className="testimonial-slide__stars"
                        aria-label={`${testimonials[testimonialIndex].rating} out of 5 stars`}
                      >
                        {Array.from({ length: testimonials[testimonialIndex].rating }, (_, j) => (
                          <HiStar key={j} aria-hidden />
                        ))}
                      </div>
                      <p className="testimonial-slide__quote">
                        {testimonials[testimonialIndex].quote}
                      </p>
                      <p className="testimonial-slide__author">
                        {testimonials[testimonialIndex].name}
                      </p>
                      <p className="testimonial-slide__meta">
                        {testimonials[testimonialIndex].meta}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="testimonials__controls">
              <button
                type="button"
                className="testimonials__arrow"
                aria-label="Previous testimonial"
                onClick={prevTestimonial}
              >
                <HiChevronLeft size={24} />
              </button>
              <div className="testimonials__dots" role="tablist" aria-label="Testimonial slides">
                {testimonials.map((t, i) => (
                  <button
                    key={t.name}
                    type="button"
                    role="tab"
                    aria-selected={i === testimonialIndex}
                    className={`testimonials__dot${i === testimonialIndex ? ' testimonials__dot--active' : ''}`}
                    onClick={() => {
                      setTestimonialDir(i > testimonialIndex ? 1 : -1);
                      setTestimonialIndex(i);
                    }}
                    aria-label={`Show testimonial from ${t.name}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className="testimonials__arrow"
                aria-label="Next testimonial"
                onClick={nextTestimonial}
              >
                <HiChevronRight size={24} />
              </button>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="review"
          className="section review"
          aria-labelledby="review-heading"
          {...sectionMotion}
        >
          <div className="section__inner">
            <motion.p
              className="section__label"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: durMed, ease: easePremium }}
            >
              Feedback
            </motion.p>
            <motion.h2
              id="review-heading"
              className="section__title"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: durMed, ease: easePremium, delay: 0.06 }}
            >
              Rate your experience
            </motion.h2>
            <motion.p
              className="section__lead"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: durMed, ease: easePremium, delay: 0.1 }}
            >
              Five-star scale plus your words—we read every submission.
            </motion.p>
            {reviewSubmitted ? (
              <motion.div
                className="review__success"
                role="status"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: durMed, ease: easePremium }}
              >
                <strong>Thank you</strong>
                Your review was received. We appreciate you taking the time.
              </motion.div>
            ) : (
              <motion.form
                className="review__form"
                onSubmit={handleReviewSubmit}
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: durSlow, ease: easePremium }}
              >
                <div className="review__field">
                  <label htmlFor="review-name">Name</label>
                  <input
                    id="review-name"
                    name="name"
                    autoComplete="name"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    required
                  />
                </div>
                <div className="review__field">
                  <span id="review-stars-label" className="review__label">
                    Rating
                  </span>
                  <div
                    className="review__stars-input"
                    role="group"
                    aria-labelledby="review-stars-label"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`star-btn ${starDisplay >= n ? 'star-btn--active' : ''}`}
                        onClick={() => setReviewRating(n)}
                        onMouseEnter={() => setReviewHover(n)}
                        onMouseLeave={() => setReviewHover(0)}
                        onFocus={() => setReviewHover(n)}
                        onBlur={() => setReviewHover(0)}
                        aria-label={`${n} out of 5 stars`}
                      >
                        {starDisplay >= n ? (
                          <HiStar aria-hidden size={30} />
                        ) : (
                          <HiOutlineStar aria-hidden size={30} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="review__field">
                  <label htmlFor="review-text">Your review</label>
                  <textarea
                    id="review-text"
                    name="review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  className="btn-primary"
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.35, ease: easePremium }}
                >
                  Submit review
                </motion.button>
              </motion.form>
            )}
          </div>
        </motion.section>
      </main>

      <footer className="footer" role="contentinfo">
        <div className="footer__inner">
          <div>
            <p className="footer__brand">
              IRON<span>HOUSE</span>
            </p>
            <p className="footer__tagline">
              Premium strength and conditioning—built for athletes who treat training like craft.
            </p>
          </div>
          <div>
            <h4>Contact</h4>
            <div className="footer__contact">
              <p>
                <a href="mailto:hello@ironhouse.training">hello@ironhouse.training</a>
              </p>
              <p>
                <a href="tel:+15555550123">+1 (555) 555-0123</a>
              </p>
              <p>1800 Performance Ave, Suite 400</p>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul className="footer__links">
              <li>
                <a href="#pricing" onClick={(e) => handleNavClick(e, '#pricing')}>
                  Memberships
                </a>
              </li>
              <li>
                <a href="#trainers" onClick={(e) => handleNavClick(e, '#trainers')}>
                  Trainers
                </a>
              </li>
              <li>
                <a href="#review" onClick={(e) => handleNavClick(e, '#review')}>
                  Leave a review
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Social</h4>
            <div className="footer__social">
              <a href="https://instagram.com" aria-label="Instagram" rel="noreferrer noopener">
                <FaInstagram size={20} />
              </a>
              <a href="https://x.com" aria-label="X" rel="noreferrer noopener">
                <FaXTwitter size={20} />
              </a>
              <a href="https://youtube.com" aria-label="YouTube" rel="noreferrer noopener">
                <FaYoutube size={20} />
              </a>
              <a href="https://tiktok.com" aria-label="TikTok" rel="noreferrer noopener">
                <SiTiktok size={20} />
              </a>
            </div>
          </div>
        </div>
        <p className="footer__bottom">
          © {new Date().getFullYear()} IRONHOUSE. All rights reserved.
        </p>
      </footer>

      <style>{`
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}
