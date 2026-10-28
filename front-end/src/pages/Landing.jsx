import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, BookOpen, GraduationCap, Users, Award, Check, Star, Compass, Layers, Menu, X, Quote, ShieldCheck, Building2, MessageCircle } from 'lucide-react';
import { useRemoteData } from '../hooks/useRemoteData';
import { Brand } from '../components/brand/Brand';
import '../styles/academy.css';
const actors = [
    ['Student', 'For learners', GraduationCap, 'Courses, progress and certificates.'],
    ['Instructor', 'For instructors', BookOpen, 'Assigned courses and learner reviews.'],
    ['Organization', 'For organizations', Building2, 'Teaching teams and course submissions.'],
    ['Admin', 'Platform admin', ShieldCheck, 'Course approvals and learner support.'],
    ['SuperAdmin', 'Super admin', Layers, 'Accounts, payments and administrator activity.'],
];
const sampleTestimonials = [
    {
        id: 'sample-testimonial-lessons',
        rating: 5,
        comment: 'The lessons are easy to follow, and learning at my own pace helps me fit a course around my daily schedule.',
        course: 'Sample testimonial',
    },
    {
        id: 'sample-testimonial-progress',
        rating: 5,
        comment: 'Having my lessons and progress in one place makes it easy to pick up where I left off and keep working toward completion.',
        course: 'Sample testimonial',
    },
];
// Animate only the visual number; assistive technology receives the final value.
function LandingStat({ value }) {
    const numberRef = useRef(null);
    useEffect(() => {
        const number = numberRef.current;
        number.textContent = value ?? '—';
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || motion.matches || !('IntersectionObserver' in window)) return;
        let frame;
        const observer = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            observer.disconnect();
            const start = performance.now();
            const animate = now => {
                const progress = Math.min((now - start) / 900, 1);
                number.textContent = progress === 1 ? value : Math.round(value * (1 - (1 - progress) ** 3));
                if (progress < 1) frame = requestAnimationFrame(animate);
            };
            frame = requestAnimationFrame(animate);
        }, { threshold: 0.5 });
        const finish = () => {
            if (motion.matches) {
                cancelAnimationFrame(frame);
                observer.disconnect();
                number.textContent = value;
            }
        };
        observer.observe(number);
        motion.addEventListener('change', finish);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            motion.removeEventListener('change', finish);
        };
    }, [value]);
    return <strong><span className="landing-stat-accessible">{value ?? '—'}</span><span className="landing-stat-value" ref={numberRef} aria-hidden="true">{value ?? '—'}</span></strong>;
}
export default function Landing() {
    const pageRef = useRef(null);
    const state = useRemoteData('/public/landing');
    const { data, loading, error } = state;
    const [menu, setMenu] = useState(false);
    const [search,setSearch]=useState('');
    const navigate = useNavigate();
    const featuredCourse = data?.courses?.[0];
    const testimonials = data?.reviews?.length
        ? [...data.reviews, ...sampleTestimonials].slice(0, 3)
        : [];
    useEffect(() => {
        const page = pageRef.current;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateHeader = () => page.classList.toggle('landing-scrolled', window.scrollY > 12);
        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });
        const observer = !motion.matches && 'IntersectionObserver' in window
            ? new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('landing-revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08 }) : null;
        page.querySelectorAll('.academy-section-heading, .academy-feature-grid article, #how-it-works article, .academy-actors a, .academy-final-cta').forEach((element, index) => {
            element.style.setProperty('--landing-delay', `${index % 3 * 70}ms`);
            observer?.observe(element);
        });
        return () => {
            window.removeEventListener('scroll', updateHeader);
            observer?.disconnect();
        };
    }, []);
    const courses = (data?.courses || []).filter(c=>`${c.title} ${c.instructor||''} ${c.organization||''}`.toLowerCase().includes(search.toLowerCase())).slice(0, 6);
    function explore(id) { navigate('/signin?role=Student', { state: { from: { pathname: `/student/course/${id}` } } }); }
    return <div ref={pageRef} className="academy-public academy-public-refined">
    <a className="academy-skip" href="#main">Skip to content</a>
    <header className="academy-navbar">
    <div className="academy-container academy-nav-inner">
    <Brand />
    <button className="academy-menu-toggle" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Toggle navigation">{menu ? <X /> : <Menu />}</button>
    <nav className={menu ? 'is-open' : ''} aria-label="Main navigation">{[['Home', '#home'], ['Courses', '#courses'], ['Features', '#features'], ['About', '#about'], ['Contact', '#contact']].map(([label, to]) => <a key={label} href={to} onClick={() => setMenu(false)}>{label}</a>)}</nav>
    <div className="academy-nav-actions">
    <Link to="/signin" className="academy-text-link">Sign in</Link>
    <Link to="/signup" className="academy-btn academy-btn-dark">Get started<ArrowUpRight size={14}/>
    </Link>
    </div>
    </div>
    </header>
    <main id="main">
      <section id="home" className="academy-hero academy-container">
    <div>
    <p className="academy-eyebrow">
    <span />ACADEX LEARNING PLATFORM</p>
    <h1>Make time for<br/><em>your next skill.</em>
    </h1>
    <p className="academy-hero-copy">Explore published courses from participating institutes. Continue your lessons and keep your progress in one place.</p>
    <div className="academy-hero-actions">
    <a href="#courses" className="academy-btn academy-btn-dark">Browse courses<ArrowUpRight size={16}/>
    </a>
    <a href="#how-it-works" className="academy-text-link">See how it works<ArrowRight size={15}/>
    </a>
    </div>
    <div className="academy-hero-foot">
    <span>
    <Check size={13}/>Learn at your pace</span>
    <span>
    <Check size={13}/>View published lessons</span>
    <span>
    <Check size={13}/>Track your progress</span>
    </div>
    </div>
    <div className="landing-featured-stage">
        {/* TASK 1: Decorative learning journey; the course chip stays accessible. */}
        <div className="landing-hero-visual-scene" aria-hidden="true">
            <div className="landing-hero-visual-blob" />
            <div className="landing-hero-visual-orbit"><span><BookOpen size={17}/></span></div>
            <div className="landing-hero-visual-orbit landing-hero-visual-orbit-inner"><span><Compass size={17}/></span></div>
            <span className="landing-hero-visual-spark landing-hero-visual-spark-one">+</span>
            <span className="landing-hero-visual-spark landing-hero-visual-spark-two">+</span>
            <span className="landing-hero-visual-spark landing-hero-visual-spark-three">✧</span>
            <div className="landing-hero-visual-player">
                <div className="landing-hero-visual-toolbar"><span><i/><i/><i/></span><BookOpen size={16}/><span>Lessons</span></div>
                <div className="landing-hero-visual-video">
                    <span className="landing-hero-visual-video-ring" />
                    <GraduationCap size={88} strokeWidth={1.1}/>
                    <span className="landing-hero-visual-play"><span/></span>
                </div>
                <div className="landing-hero-visual-lesson">
                    <div className="landing-hero-visual-lines"><i/><i/><i/></div>
                    <div className="landing-hero-visual-progress-label"><span>Progress</span><Check size={14}/></div>
                    <div className="landing-hero-visual-progress"><span/></div>
                </div>
            </div>
            <div className="landing-hero-visual-ring-card">
                <svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="32"/><circle className="landing-hero-visual-ring-fill" cx="40" cy="40" r="32" pathLength="100"/></svg>
                <Check className="landing-hero-visual-ring-check" size={28}/><span>Progress</span>
            </div>
            <div className="landing-hero-visual-quiz">
                <span><BookOpen size={16}/>Lessons</span>
                {[0, 1, 2].map(option => <div className="landing-hero-visual-option" key={option} style={{ '--option-delay': `${option * 1.5}s` }}><span><Check size={11}/></span><i/></div>)}
            </div>
            <div className="landing-hero-visual-award"><span><Award size={38} strokeWidth={1.4}/></span><span>Certificates</span></div>
            <div className="landing-hero-visual-learners"><Users size={21}/><div><span>Learners</span><div className="landing-hero-visual-avatars">{[0, 1, 2].map(avatar => <span key={avatar}><GraduationCap size={14}/></span>)}</div></div></div>
            <div className="landing-hero-visual-stars">{[0, 1, 2, 3, 4].map(star => <Star size={16} fill="currentColor" key={star} style={{ '--star-delay': `${star * .65}s` }}/>)}</div>
        </div>
        <div className="landing-hero-visual-course-slot">
            {!loading && !error && featuredCourse?.id != null && featuredCourse?.title?.trim() && <button className="landing-hero-visual-course-chip" onClick={() => explore(featuredCourse.id)}>
                <span><BookOpen size={20}/></span><span><small>From the course catalog</small><strong>{featuredCourse.title}</strong></span><span>View course<ArrowUpRight size={17}/></span>
            </button>}
        </div>
    </div>
    </section>
      <section className="academy-container academy-stats" aria-label="Platform activity">{loading ? <p>Loading platform activity…</p> : error ? <div className="academy-data-error" role="alert">Platform activity is unavailable. <button onClick={state.refresh}>Try again</button>
        </div> : [['Learners', data?.stats.learners, Users], ['Published courses', data?.stats.courses, BookOpen], ['Instructors', data?.stats.instructors, GraduationCap], ['Course completions', data?.stats.completions, Award]].map(([label, value, Icon]) => <div key={label}>
        <Icon size={22} strokeWidth={1.4}/>
        <LandingStat value={value}/>
        <span>{label}</span>
        </div>)}</section>
      <section id="courses" className="academy-section academy-container">
    <div className="academy-section-heading">
    <div>
    <p className="academy-eyebrow">COURSE CATALOG</p>
    <h2>Courses you can <em>enroll in.</em>
    </h2>
    <p>Explore published courses from our learning community.</p>
    </div>
    <Link to="/signin?role=Student" className="academy-text-link">Explore all courses<ArrowUpRight size={16}/>
    </Link>
    </div>
    <label className="landing-course-search"><span>Search courses</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search course or instructor…"/></label>{loading ? <div className="academy-course-grid">{[1, 2, 3].map(i => <div className="academy-course academy-loading" key={i}>Loading courses…</div>)}</div> : error ? <div className="academy-empty" role="alert">We couldn’t load the course library. <button onClick={state.refresh}>Try again</button>
        </div> : <div className="academy-course-grid">{courses.map((c, i) => <article className="academy-course" key={c.id}>
            <button onClick={() => explore(c.id)} className={`academy-course-art art-${i % 4}`} aria-label={`Explore ${c.title}`}>
            <span className="academy-course-art-icon">
            <BookOpen size={64} strokeWidth={.8}/>
            </span>{c.thumbnail && <img src={c.thumbnail} alt="" loading="lazy" onError={e => { e.currentTarget.hidden = true; }}/>}<small>{c.category || 'Course'}</small>
            </button>
            <div className="academy-course-body">
            <div className="academy-course-category">
            <span>{c.category || 'General learning'}</span>
            <small>{c.level || 'Course'}</small>
            </div>
            <h3>
            <button onClick={() => explore(c.id)}>{c.title}</button>
            </h3>
            <p>{c.instructor || c.organization || 'Explore the course details'}</p>
            <div className="academy-course-footer">
            <span>{c.rating ? <>
                <Star size={12} fill="currentColor"/>{c.rating.toFixed(1)}<small>({c.reviews} reviews)</small>
                </> : <>
                <Users size={12}/>{c.enrollments} enrolled</>}</span>
            <button onClick={() => explore(c.id)} aria-label={`View ${c.title}`}>
            <ArrowUpRight size={18}/>
            </button>
            </div>
            </div>
            </article>)}</div>}{!loading && !error && !courses.length && <div className="academy-empty">No courses match your search.</div>}</section>
      <section id="features" className="academy-feature-section">
    <div className="academy-container">
    <div className="academy-section-heading">
    <div>
    <p className="academy-eyebrow">YOUR LEARNING ACCOUNT</p>
    <h2>Lessons, progress <em>and certificates.</em>
    </h2>
    <p>Keep your course records in one account.</p>
    </div>
    </div>
    <div className="academy-feature-grid">{[[Compass, 'Course library', 'Choose a course that fits your interests and keep learning on your own schedule.'], [BookOpen, 'Lessons and assessments', 'Explore course lessons, quizzes, and assignments designed to move learning forward.'], [Award, 'Completion records', 'Track your progress and find your completed-course credentials in one place.']].map(([Icon, title, description]) => <article key={title}>
        <span>
        <Icon size={25} strokeWidth={1.4}/>
        </span>
        <h3>{title}</h3>
        <p>{description}</p>
        </article>)}</div>
    </div>
    </section>
      <section id="how-it-works" className="academy-section academy-container">
    <div className="academy-section-heading">
    <div>
    <p className="academy-eyebrow">HOW IT WORKS</p>
    <h2>Start with <em>a course.</em>
    </h2>
    </div>
    </div>
    <div className="academy-step-grid">{[['01', 'Browse the catalog', 'Choose from published courses and review the lessons before enrolling.'], ['02', 'Create your account', 'Create your learner account and enroll in your chosen course.'], ['03', 'Continue your lessons', 'Work through lessons, track your progress, and complete your course.']].map(([n, title, description]) => <article key={n}>
        <span>{n}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        </article>)}</div>
    </section>
      <section id="about" className="academy-container academy-about">
    <div>
    <p className="academy-eyebrow">WORKSPACES</p>
    <h2>A workspace for<br/><em>each role.</em>
    </h2>
    <p>Learners access their courses. Instructors maintain curriculum. Organizations review teaching work, and platform teams handle approvals and support.</p>
    </div>
    <div className="academy-actors">{actors.map(([role, title, Icon, description]) => <Link key={role} to={`/signin?role=${role}`}>
        <span>
        <Icon size={20}/>
        </span>
        <div>
        <strong>{title}</strong>
        <small>{description}</small>
        </div>
        <ArrowUpRight size={16}/>
        </Link>)}</div>
    </section>
      <section className="academy-section academy-container">
    <div className="academy-section-heading">
    <div>
    <p className="academy-eyebrow">FROM THE LEARNING COMMUNITY</p>
    <h2>What learners <em>are saying.</em>
    </h2>
    <p>Reviews from enrolled learners.</p>
    </div>
    </div>{testimonials.length ? <div className="academy-step-grid landing-testimonial-grid">{testimonials.map(r => <article className="academy-review" key={r.id}>
            <Quote size={25}/>
            <div className="academy-stars" aria-label={`${r.rating} out of 5 stars`}>{Array.from({ length: Math.min(5, Math.max(0, Math.round(r.rating))) }, (_, i) => <Star size={13} fill="currentColor" key={i}/>)}</div>
            <blockquote>{r.comment}</blockquote>
            <p className="landing-review-source"><span className="landing-review-avatar" aria-hidden="true">{r.course?.trim().charAt(0)}</span>{r.course}</p>
            </article>)}</div> : <div className="academy-empty">
        <MessageCircle size={25}/>
        <p>{error ? 'Course feedback is temporarily unavailable.' : 'No published course feedback is available yet.'}</p>
        </div>}</section>
      <section id="contact" className="academy-container academy-final-cta">
    <div>
    <p className="academy-eyebrow">GET STARTED</p>
    <h2>Find a course.<br/>
    <em>Start your account.</em>
    </h2>
    <p>Choose your workspace to continue your courses or manage teaching.</p>
    </div>
    <div>
    <Link to="/signup" className="academy-btn academy-btn-light">Create an account<ArrowUpRight size={16}/>
    </Link>
    <Link to="/signin?role=Organization" className="academy-cta-contact">Organization workspace<ArrowRight size={14}/>
    </Link>
    <Link to="/signin?role=Student" className="academy-cta-contact">Existing learner? Sign in for support</Link>
    </div>
    </section>
    </main>
    <footer className="academy-container academy-footer">
    <div>
    <Brand />
    <p>Courses, teaching and learning records in one place.</p>
    </div>
    <div>
    <h3>Explore</h3>
    <a href="#courses">Courses</a>
    <a href="#features">Features</a>
    <a href="#about">About Acadex</a>
    </div>
    <div>
    <h3>Your workspace</h3>{actors.map(([role, title]) => <Link key={role} to={`/signin?role=${role}`}>{title}</Link>)}</div>
    <div>
    <h3>Good to know</h3>
    <Link to="/terms">Terms of service</Link>
    <Link to="/privacy">Privacy policy</Link>
    <Link to="/honor-code">Academic honor code</Link>
    <Link to="/forgot-password">Account recovery</Link>
    </div>
    <div className="academy-footer-bottom">
    <span>© {new Date().getFullYear()} Acadex. Keep learning.</span>
    <span>Courses · Teaching · Learning records</span>
    </div>
    </footer>
  </div>;
}
