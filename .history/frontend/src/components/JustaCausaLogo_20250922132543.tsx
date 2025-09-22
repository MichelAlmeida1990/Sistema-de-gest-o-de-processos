import React from 'react'

interface JustaCausaLogoProps {
  collapsed?: boolean
  darkMode?: boolean
  size?: number
}

export const JustaCausaLogo: React.FC<JustaCausaLogoProps> = ({ 
  collapsed = false, 
  darkMode = false, 
  size = 40 
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: collapsed ? '0' : '16px',
      transition: 'all 0.3s ease'
    }}>
      {/* Logo Icon - Elegant Design */}
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        background: darkMode 
          ? 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)'
          : 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: darkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        border: darkMode 
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(255, 255, 255, 0.2)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08) rotate(2deg)'
        e.currentTarget.style.boxShadow = darkMode 
          ? '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 12px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
        e.currentTarget.style.boxShadow = darkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
      >
        {/* Elegant Justice Scale */}
        <svg 
          width={size * 0.5} 
          height={size * 0.5} 
          viewBox="0 0 24 24" 
          fill="none"
          style={{
            color: 'white',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
            zIndex: 2
          }}
        >
          {/* Elegant Scale Design */}
          <g>
            {/* Base */}
            <rect x="2" y="20" width="20" height="2" rx="1" fill="currentColor" opacity="0.8"/>
            {/* Central Column */}
            <rect x="11.5" y="4" width="1" height="16" fill="currentColor"/>
            {/* Left Scale */}
            <path 
              d="M6 8 L3 11 L6 14" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
            {/* Right Scale */}
            <path 
              d="M18 8 L21 11 L18 14" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
            {/* Central Balance Point */}
            <circle cx="12" cy="11" r="1.5" fill="currentColor" opacity="0.9"/>
            {/* Decorative Elements */}
            <circle cx="6" cy="8" r="0.8" fill="currentColor" opacity="0.7"/>
            <circle cx="18" cy="8" r="0.8" fill="currentColor" opacity="0.7"/>
          </g>
        </svg>
        
        {/* Subtle Glow Effect */}
        <div 
          className="glow-effect"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%'
          }} 
        />
      </div>

      {/* Logo Text - Elegant Typography */}
      {!collapsed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '4px'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            letterSpacing: '-0.3px',
            background: darkMode 
              ? 'linear-gradient(135deg, #ffffff, #e0e7ff)'
              : 'linear-gradient(135deg, #1e293b, #334155)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'flex',
            alignItems: 'baseline',
            gap: '6px',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            <span style={{ fontWeight: '700' }}>Justa</span>
            <span style={{
              color: darkMode ? '#a78bfa' : '#8b5cf6',
              fontSize: '16px',
              fontWeight: '400'
            }}>•</span>
            <span style={{ fontWeight: '700' }}>Causa</span>
          </div>
          <div style={{
            color: darkMode ? '#94a3b8' : '#64748b',
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            Sistema Jurídico
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes glow {
          0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
          100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
        }
      `}</style>
    </div>
  )
}

export default JustaCausaLogo
