// ===========================================
// EFEITOS INTERATIVOS PARA BOTÕES MODERNOS
// ===========================================

// Função para criar efeitos de partículas SVG
const createSvg = (fillColor: 'black' | 'white'): SVGElement => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", "0 0 147 60");
  svg.setAttribute("fill", "none");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("preserveAspectRatio", "none");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M146.5 2.00038C120 -1 104 6.00038 73.75 30.0004C43.5 54.0004 19.5 60.5004 1 58.0004");
  path.setAttribute("stroke", fillColor);
  path.setAttribute("stroke-width", "2");

  svg.appendChild(path);
  return svg;
};

// Função para animar partículas SVG
const animateSVG = (button: HTMLElement): void => {
  const div = button.querySelector('.particle-container') as HTMLElement;
  if (!div) return;

  const svg = createSvg('white');
  div.appendChild(svg);

  // Configurar posição inicial aleatória
  svg.style.position = 'absolute';
  svg.style.left = Math.random() * 100 + '%';
  svg.style.top = Math.random() * 100 + '%';
  svg.style.opacity = '0';

  // Animar entrada
  svg.animate([
    { opacity: 0, transform: 'scale(0.5)' },
    { opacity: Math.random() * 0.3 + 0.2, transform: 'scale(1)' }
  ], {
    duration: 200,
    easing: 'ease-out',
    fill: 'forwards'
  });

  // Animar movimento
  svg.animate([
    { transform: 'translate(0, 0) scale(1)' },
    { transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0.5)` }
  ], {
    duration: Math.random() * 2000 + 1000,
    easing: 'ease-out',
    fill: 'forwards'
  }).onfinish = () => {
    svg.remove();
  };
};

// Função para adicionar efeitos aos botões
const addButtonEffects = (): void => {
  // Selecionar todos os botões Ant Design
  const buttons = document.querySelectorAll('.ant-btn');
  
  buttons.forEach((button) => {
    const btn = button as HTMLElement;
    
    // Criar container para partículas
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      overflow: hidden;
      z-index: 1;
    `;
    
    btn.appendChild(particleContainer);
    
    // Adicionar efeito de clique
    btn.addEventListener('click', (e) => {
      // Não prevenir o comportamento padrão para botões de submit
      if (btn.getAttribute('type') === 'submit' || btn.getAttribute('htmlType') === 'submit') {
        // Apenas adicionar efeitos visuais sem interferir no submit
        // Efeito de escala
        btn.animate([
          { transform: 'scale(0.95)' },
          { transform: 'scale(1)' }
        ], {
          duration: 150,
          easing: 'ease-out'
        });
        
        // Efeito de glow baseado no tipo de botão
        let glowColor = 'rgba(102, 126, 234, 0.3)';
        if (btn.classList.contains('ant-btn-dangerous')) {
          glowColor = 'rgba(220, 38, 38, 0.3)';
        } else if (btn.classList.contains('ant-btn-default')) {
          glowColor = 'rgba(45, 55, 72, 0.3)';
        }
        
        const glowEffect = btn.animate([
          { boxShadow: '0px 0px 0.5px 0.5px rgba(0, 0, 0, 0.3) inset, 0px 4px 12px -3px rgba(102, 126, 234, 0.8), 0px 8px 20px 0 rgba(102, 126, 234, 0.2)' },
          { boxShadow: `0px 0px 0.5px 0.5px rgba(0, 0, 0, 0.3) inset, 0px 4px 12px -3px rgba(102, 126, 234, 0.8), 0px 8px 20px 0 rgba(102, 126, 234, 0.4), 0px 0px 20px ${glowColor}` },
          { boxShadow: '0px 0px 0.5px 0.5px rgba(0, 0, 0, 0.3) inset, 0px 4px 12px -3px rgba(102, 126, 234, 0.8), 0px 8px 20px 0 rgba(102, 126, 234, 0.2)' }
        ], {
          duration: 600,
          easing: 'ease-out'
        });
        
        // Criar partículas
        animateSVG(btn);
      } else {
        // Para outros botões, manter o comportamento anterior
        e.preventDefault();
        
        // Efeito de escala
        btn.animate([
          { transform: 'scale(0.95)' },
          { transform: 'scale(1)' }
        ], {
          duration: 150,
          easing: 'ease-out'
        });
        
        // Efeito de glow baseado no tipo de botão
        let glowColor = 'rgba(102, 126, 234, 0.3)';
        if (btn.classList.contains('ant-btn-dangerous')) {
          glowColor = 'rgba(220, 38, 38, 0.3)';
        } else if (btn.classList.contains('ant-btn-default')) {
          glowColor = 'rgba(45, 55, 72, 0.3)';
        }
        
        const glowEffect = btn.animate([
          { boxShadow: '0px 0px 0.5px 0.5px rgba(0, 0, 0, 0.3) inset, 0px 4px 12px -3px rgba(102, 126, 234, 0.8), 0px 8px 20px 0 rgba(102, 126, 234, 0.2)' },
          { boxShadow: `0px 0px 0.5px 0.5px rgba(0, 0, 0, 0.3) inset, 0px 4px 12px -3px rgba(102, 126, 234, 0.8), 0px 8px 20px 0 rgba(102, 126, 234, 0.4), 0px 0px 20px ${glowColor}` },
          { boxShadow: '0px 0px 0.5px 0.5px rgba(0, 0, 0, 0.3) inset, 0px 4px 12px -3px rgba(102, 126, 234, 0.8), 0px 8px 20px 0 rgba(102, 126, 234, 0.2)' }
        ], {
          duration: 600,
          easing: 'ease-out'
        });
        
        // Criar partículas
        animateSVG(btn);
        
        // Executar ação original do botão após um pequeno delay
        setTimeout(() => {
          const originalClick = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          btn.dispatchEvent(originalClick);
        }, 100);
      }
    });
    
    // Adicionar efeito de hover
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
    });
  });
};

// Função para adicionar efeitos de ripple
const addRippleEffect = (): void => {
  const buttons = document.querySelectorAll('.ant-btn');
  
  buttons.forEach((button) => {
    const btn = button as HTMLElement;
    
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 2;
      `;
      
      btn.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
};

// Adicionar estilos CSS para animações
const addAnimationStyles = (): void => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    .ant-btn {
      position: relative;
      overflow: hidden;
    }
    
    .ant-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .ant-btn:hover::before {
      left: 100%;
    }
  `;
  document.head.appendChild(style);
};

// Função principal para inicializar todos os efeitos
const initializeButtonEffects = (): void => {
  // Aguardar o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addAnimationStyles();
      addButtonEffects();
      addRippleEffect();
    });
  } else {
    addAnimationStyles();
    addButtonEffects();
    addRippleEffect();
  }
  
  // Re-aplicar efeitos quando novos botões forem adicionados
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.classList?.contains('ant-btn') || element.querySelector?.('.ant-btn')) {
              addButtonEffects();
              addRippleEffect();
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// Exportar função principal
export default initializeButtonEffects;

// Auto-inicializar se estiver no browser
if (typeof window !== 'undefined') {
  initializeButtonEffects();
}
