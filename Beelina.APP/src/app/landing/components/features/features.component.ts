import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { ScrollAnimationService } from '../../services/scroll-animation.service';

interface Feature {
  title: string;
  description: string;
  icon: string;
  highlights: string[];
}

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit, AfterViewInit {

  constructor(
    private elementRef: ElementRef,
    private scrollAnimation: ScrollAnimationService
  ) { }

  features: Feature[] = [
    {
      title: 'Inventory Management',
      description: 'Complete control over your product inventory with real-time tracking and automated alerts.',
      icon: 'inventory',
      highlights: [
        'Real-time stock monitoring',
        'Automated reorder points',
        'Multi-location inventory',
        'Expiry date tracking'
      ]
    },
    {
      title: 'Sales Force Automation',
      description: 'Empower your sales agents with mobile tools for efficient field operations.',
      icon: 'groups',
      highlights: [
        'Mobile order taking',
        'Customer management',
        'Route optimization',
        'Performance tracking'
      ]
    },
    {
      title: 'Order Processing',
      description: 'Streamlined order workflow from creation to delivery with automated routing.',
      icon: 'shopping_cart',
      highlights: [
        'Automated order routing',
        'Real-time status updates',
        'Delivery scheduling',
        'Payment tracking'
      ]
    },
    {
      title: 'Analytics & Reporting',
      description: 'Comprehensive insights into your business performance with customizable dashboards.',
      icon: 'assessment',
      highlights: [
        'Sales performance metrics',
        'Inventory analytics',
        'Custom reports',
        'Predictive insights'
      ]
    },
    {
      title: 'Customer Management',
      description: 'Maintain detailed customer profiles and track relationship history.',
      icon: 'people',
      highlights: [
        'Customer profiles',
        'Credit management',
        'Purchase history',
        'Loyalty programs'
      ]
    },
    {
      title: 'Financial Controls',
      description: 'Robust financial management with integrated accounting and payment processing.',
      icon: 'account_balance',
      highlights: [
        'Automated invoicing',
        'Payment processing',
        'Credit management',
        'Financial reporting'
      ]
    }
  ];

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Setup counter animations
    this.setupCounterAnimations();

    // Setup chart bar animations
    this.setupChartAnimations();
  }

  private setupCounterAnimations(): void {
    const counterElements = this.elementRef.nativeElement.querySelectorAll('.counter');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const targetValue = parseInt(target.getAttribute('data-target') || '0');
          this.scrollAnimation.animateCounter(target, 0, targetValue, 2000);
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    counterElements.forEach((el: Element) => observer.observe(el));
  }

  private setupChartAnimations(): void {
    const chartBars = this.elementRef.nativeElement.querySelectorAll('.chart-bar');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animate-visible');
            (entry.target as HTMLElement).style.transform = 'scaleY(1)';
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    chartBars.forEach((bar: Element) => {
      (bar as HTMLElement).style.transformOrigin = 'bottom';
      (bar as HTMLElement).style.transform = 'scaleY(0)';
      (bar as HTMLElement).style.transition = 'transform 0.6s ease-out';
      observer.observe(bar);
    });
  }

}
