import { Injectable } from '@angular/core';

export interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  animationClass?: string;
  delay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScrollAnimationService {
  private observers: Map<Element, IntersectionObserver> = new Map();

  constructor() { }

  /**
   * Animate elements when they come into view
   */
  animateOnScroll(
    elements: NodeListOf<Element> | Element[],
    options: ScrollAnimationOptions = {}
  ): void {
    const defaultOptions: ScrollAnimationOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      animationClass: 'animate-in',
      delay: 0
    };

    const config = { ...defaultOptions, ...options };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Add delay for staggered animations
            setTimeout(() => {
              entry.target.classList.add(config.animationClass!);
              entry.target.classList.add('animate-visible');
            }, config.delay! + (index * 100));

            // Stop observing once animated
            observer.unobserve(entry.target);
            this.observers.delete(entry.target);
          }
        });
      },
      {
        threshold: config.threshold,
        rootMargin: config.rootMargin
      }
    );

    // Observe all elements
    elements.forEach((element) => {
      element.classList.add('animate-hidden');
      observer.observe(element);
      this.observers.set(element, observer);
    });
  }

  /**
   * Parallax scroll effect
   */
  parallaxScroll(element: Element, speed: number = 0.5): void {
    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrolled;
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const yPos = -(scrolled - elementTop) * speed;
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      }
    };

    window.addEventListener('scroll', updateParallax, { passive: true });
  }

  /**
   * Smooth scroll with easing
   */
  smoothScrollTo(targetId: string, offset: number = 0): void {
    const target = document.getElementById(targetId);
    if (!target) return;

    const targetPosition = target.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start: number | null = null;

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  }

  /**
   * Counter animation
   */
  animateCounter(element: Element, start: number, end: number, duration: number = 2000): void {
    const range = end - start;
    const minTimer = 50;
    const stepTime = Math.abs(Math.floor(duration / range));

    const timer = setInterval(() => {
      start += 1;
      (element as HTMLElement).textContent = start.toString();
      if (start >= end) {
        clearInterval(timer);
      }
    }, Math.max(stepTime, minTimer));
  }

  /**
   * Cleanup all observers
   */
  destroy(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }

  private easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
}
