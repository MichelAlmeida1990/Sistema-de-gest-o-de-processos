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
      transition: 'all 0.3s ease',
      width: collapsed ? '100%' : 'auto',
      height: collapsed ? '60px' : 'auto'
    }}>
      {/* Logo Icon - Modern Design */}
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        background: darkMode 
          ? 'linear-gradient(135deg, #2C2C2C 0%, #C0C0C0 50%, #f093fb 100%)'
          : 'linear-gradient(135deg, #2C2C2C 0%, #C0C0C0 50%, #f093fb 100%)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: darkMode 
          ? '0 8px 32px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        border: darkMode 
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid rgba(255, 255, 255, 0.25)',
        position: 'static',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'
        e.currentTarget.style.boxShadow = darkMode 
          ? '0 12px 40px rgba(102, 126, 234, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          : '0 12px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
        e.currentTarget.style.boxShadow = darkMode 
          ? '0 8px 32px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
      }}
      >
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
          animation: 'shimmer 3s infinite'
        }} />
        
        {/* Modern Justice Icon */}
        <svg 
          width={size * 0.6} 
          height={size * 0.6} 
          viewBox="0 0 24 24" 
          fill="none"
          style={{
            color: 'white',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
            zIndex: 2
          }}
        >
          {/* Modern Scale Design */}
          <g>
            {/* Base with modern styling */}
            <rect x="3" y="19" width="18" height="3" rx="1.5" fill="currentColor" opacity="0.9"/>
            {/* Central column with gradient effect */}
            <rect x="11.2" y="3" width="1.6" height="16" rx="0.8" fill="currentColor"/>
            {/* Left scale arm - modern curved */}
            <path 
              d="M7 7 Q4 10 7 13" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              fill="none"
            />
            {/* Right scale arm - modern curved */}
            <path 
              d="M17 7 Q20 10 17 13" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              fill="none"
            />
            {/* Central balance point - modern circle */}
            <circle cx="12" cy="10" r="2" fill="currentColor" opacity="0.9"/>
            {/* Decorative elements */}
            <circle cx="7" cy="7" r="1" fill="currentColor" opacity="0.7"/>
            <circle cx="17" cy="7" r="1" fill="currentColor" opacity="0.7"/>
            {/* Justice symbol in center */}
            <path 
              d="M10 8 L12 10 L14 8" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </svg>
      </div>

      {/* Logo Text - Creative Typography */}
      {!collapsed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '6px'
        }}>
          <div style={{
            fontSize: '22px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-1px'
          }}>
            <span style={{
              background: darkMode 
                ? 'linear-gradient(135deg, #f093fb, #f5576c)'
                : 'linear-gradient(135deg, #2C2C2C, #C0C0C0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '700',
              fontSize: '24px'
            }}>G</span>
            <span style={{
              color: darkMode ? '#ffffff' : '#2C2C2C',
              fontWeight: '600',
              fontSize: '20px'
            }}>ESTOR</span>
            <span style={{
              color: darkMode ? '#f093fb' : '#C0C0C0',
              fontSize: '16px',
              fontWeight: '400',
              margin: '0 8px'
            }}>⚖</span>
            <span style={{
              background: darkMode 
                ? 'linear-gradient(135deg, #f093fb, #f5576c)'
                : 'linear-gradient(135deg, #2C2C2C, #C0C0C0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '700',
              fontSize: '24px'
            }}>J</span>
            <span style={{
              color: darkMode ? '#ffffff' : '#2C2C2C',
              fontWeight: '600',
              fontSize: '20px'
            }}>URÍDICO</span>
          </div>
          <div style={{
            color: darkMode ? '#a78bfa' : '#8b5cf6',
            fontSize: '12px',
            fontWeight: '500',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            opacity: 0.8
          }}>
            Sistema Jurídico
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

export default JustaCausaLogo