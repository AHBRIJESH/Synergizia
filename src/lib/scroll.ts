
export const scrollToSection = (id: string): void => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

export const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export const initAnimateOnScroll = (): void => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(element => {
    observer.observe(element);
  });
}
