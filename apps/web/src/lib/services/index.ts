// Export all services
export * from './auth.service';
export * from './services.service';
export * from './user.service';
// export * from './contact.service'; // Commented to avoid ambiguity
export * from './projects.service';
export * from './opportunities.service';
export * from './jobs.service';
export * from './payments.service';

// Re-export individual service objects
export { default as authService } from './auth.service';
export { default as servicesService } from './services.service';
export { default as userService } from './user.service';
export { default as contactService } from './contact.service';
export { default as projectsService } from './projects.service';
export { default as opportunitiesService } from './opportunities.service';
export { jobsService } from './jobs.service';
export { paymentsService } from './payments.service';

// Export professionals service and types separately to avoid conflicts
export { default as professionalsService } from './professionals.service';
export type { Professional, ProfessionalProfile as ProfessionalProfileAPI, ProfessionalService } from './professionals.service';