import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-problem-solution',
  templateUrl: './problem-solution.component.html',
  styleUrls: ['./problem-solution.component.scss']
})
export class ProblemSolutionComponent implements OnInit {

  problemSolutions = [
    {
      icon: 'dashboard',
      title: 'Unified Management Dashboard',
      problem: 'Managing multiple locations, tracking inventory, and coordinating sales teams across different channels becomes complex and error-prone without a centralized system.',
      solution: 'Our comprehensive dashboard provides real-time visibility into all aspects of your distribution business, enabling better decision-making and streamlined operations.',
      benefits: ['Real-time inventory tracking', 'Automated stock alerts', 'Multi-location management']
    },
    {
      icon: 'phone_android',
      title: 'Mobile Sales Application',
      problem: 'Field sales agents struggle with outdated catalogs, manual order processing, and lack of real-time pricing information, leading to missed opportunities and errors.',
      solution: 'Empower your sales team with a mobile application that provides instant access to product catalogs, real-time pricing, and streamlined order processing capabilities.',
      benefits: ['Offline order processing', 'Digital catalog access', 'Instant price updates']
    },
    {
      icon: 'analytics',
      title: 'Advanced Analytics & Reporting',
      problem: 'Without proper data insights, businesses cannot identify trends, optimize inventory, or understand customer behavior, resulting in missed growth opportunities.',
      solution: 'Transform your data into actionable insights with comprehensive analytics that help you understand sales patterns, optimize inventory, and predict market trends.',
      benefits: ['Sales performance tracking', 'Customer behavior analysis', 'Predictive inventory management']
    },
    {
      icon: 'sync',
      title: 'Seamless Integration',
      problem: 'Disconnected systems and manual processes create data silos, increase errors, and prevent efficient workflow automation across the organization.',
      solution: 'Connect all your business processes with automated workflows and real-time synchronization, ensuring data consistency and operational efficiency.',
      benefits: ['Automated order processing', 'Real-time data sync', 'Integrated payment tracking']
    },
    {
      icon: 'inventory_2',
      title: 'Smart Inventory Management',
      problem: 'Manual inventory tracking leads to stockouts, overstocking, and inaccurate forecasting, resulting in lost sales and increased carrying costs.',
      solution: 'Intelligent inventory management with automated reordering, demand forecasting, and optimized stock levels to minimize costs while ensuring product availability.',
      benefits: ['Automated reorder points', 'Demand forecasting', 'Stock optimization']
    },
    {
      icon: 'account_balance_wallet',
      title: 'Financial Management & Payments',
      problem: 'Tracking payments, managing credit terms, and reconciling accounts across multiple customers and agents becomes time-consuming and error-prone.',
      solution: 'Streamlined financial management with automated payment tracking, credit monitoring, and comprehensive financial reporting for better cash flow control.',
      benefits: ['Automated payment tracking', 'Credit limit monitoring', 'Financial reporting']
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
