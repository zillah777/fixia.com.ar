// Export all services
export * from './auth.service';
export * from './services.service';
export * from './user.service';
export * from './contact.service';
export * from './projects.service';
export * from './opportunities.service';
export * from './jobs.service';

// Re-export individual service objects
export { default as authService } from './auth.service';
export { default as servicesService } from './services.service';
export { default as userService } from './user.service';
export { default as contactService } from './contact.service';
export { default as projectsService } from './projects.service';
export { default as opportunitiesService } from './opportunities.service';
export { jobsService } from './jobs.service';