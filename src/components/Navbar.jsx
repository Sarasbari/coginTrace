import { useState, useEffect } from 'react';
import { Brain, Activity, BarChart3, Clock, Plus } from 'lucide-react';

export default function Navbar({ currentPage, onNavigate }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { id: 'home', label: 'Session', icon: Activity },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'history', label: 'History', icon: Clock },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <button
                className="navbar-logo"
                onClick={() => onNavigate('home')}
                style={{ border: 'none', cursor: 'pointer', background: 'none' }}
            >
                <Brain size={24} />
                <span>CogniTrace</span>
            </button>

            <div className="navbar-links">
                {links.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={`nav-link ${currentPage === id ? 'active' : ''}`}
                        onClick={() => onNavigate(id)}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon size={15} />
                            {label}
                        </span>
                    </button>
                ))}
                <button
                    className="nav-btn-primary"
                    onClick={() => onNavigate('task')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <Plus size={15} />
                    New Session
                </button>
            </div>
        </nav>
    );
}
