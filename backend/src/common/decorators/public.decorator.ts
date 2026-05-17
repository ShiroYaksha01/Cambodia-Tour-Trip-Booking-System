import { SetMetadata } from '@nestjs/common';
 
export const IS_PUBLIC_KEY = 'isPublic';
 
/**
 * Mark a route as public — skips the global JwtAuthGuard.
 * Used on all customer browse endpoints (GET /services, etc.)
 *
 * @example
 * @Public()
 * @Get()
 * findAll() {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);