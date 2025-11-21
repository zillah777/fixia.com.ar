import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * Password Validator - Best Practices 2025
 * 
 * SECURITY REQUIREMENTS:
 * - Minimum 12 characters (NIST recommendation)
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * - No common/breached passwords
 * 
 * REFERENCES:
 * - NIST SP 800-63B Digital Identity Guidelines
 * - OWASP Password Storage Cheat Sheet
 * - Have I Been Pwned API
 */

@Injectable()
export class PasswordValidator {
    private readonly MIN_LENGTH = 12;
    private readonly MAX_LENGTH = 128;

    // Top 100 most common passwords (subset for performance)
    private readonly COMMON_PASSWORDS = new Set([
        'password', '123456', '123456789', '12345678', '12345', '1234567',
        'password1', 'password123', 'qwerty', 'abc123', 'monkey', 'letmein',
        'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
        'ashley', 'bailey', 'passw0rd', 'shadow', 'superman', 'qazwsx',
        'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang',
        'admin', 'administrator', 'root', 'toor', 'pass', '1234',
        'test', 'guest', 'info', 'adm', 'mysql', 'user', 'oracle',
        'ftp', 'pi', 'puppet', 'ansible', 'ec2-user', 'vagrant',
        'azureuser', 'default', 'changeme', 'Password1!', 'Passw0rd!',
    ]);

    /**
     * Validate password strength
     * @param password - Password to validate
     * @throws BadRequestException if password doesn't meet requirements
     */
    validate(password: string): void {
        // 1. Length validation
        if (!password || password.length < this.MIN_LENGTH) {
            throw new BadRequestException(
                `La contraseña debe tener al menos ${this.MIN_LENGTH} caracteres`
            );
        }

        if (password.length > this.MAX_LENGTH) {
            throw new BadRequestException(
                `La contraseña no puede exceder ${this.MAX_LENGTH} caracteres`
            );
        }

        // 2. Complexity validation
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        const missingRequirements: string[] = [];

        if (!hasUppercase) {
            missingRequirements.push('una letra mayúscula');
        }
        if (!hasLowercase) {
            missingRequirements.push('una letra minúscula');
        }
        if (!hasNumber) {
            missingRequirements.push('un número');
        }
        if (!hasSpecial) {
            missingRequirements.push('un carácter especial (!@#$%^&*...)');
        }

        if (missingRequirements.length > 0) {
            throw new BadRequestException(
                `La contraseña debe contener al menos: ${missingRequirements.join(', ')}`
            );
        }

        // 3. Common password check
        const passwordLower = password.toLowerCase();
        if (this.COMMON_PASSWORDS.has(passwordLower)) {
            throw new BadRequestException(
                'Esta contraseña es demasiado común. Por favor, elige una contraseña más segura'
            );
        }

        // 4. Sequential characters check (e.g., "123456", "abcdef")
        if (this.hasSequentialCharacters(password)) {
            throw new BadRequestException(
                'La contraseña no debe contener secuencias obvias de caracteres'
            );
        }

        // 5. Repeated characters check (e.g., "aaaa", "1111")
        if (this.hasRepeatedCharacters(password)) {
            throw new BadRequestException(
                'La contraseña no debe contener demasiados caracteres repetidos'
            );
        }
    }

    /**
     * Check for sequential characters (e.g., "123456", "abcdef")
     */
    private hasSequentialCharacters(password: string): boolean {
        const sequences = [
            '0123456789',
            'abcdefghijklmnopqrstuvwxyz',
            'qwertyuiop',
            'asdfghjkl',
            'zxcvbnm',
        ];

        for (const seq of sequences) {
            for (let i = 0; i <= seq.length - 4; i++) {
                const substring = seq.substring(i, i + 4);
                if (password.toLowerCase().includes(substring)) {
                    return true;
                }
                // Check reverse
                if (password.toLowerCase().includes(substring.split('').reverse().join(''))) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check for repeated characters (e.g., "aaaa", "1111")
     */
    private hasRepeatedCharacters(password: string): boolean {
        // Check for 4 or more consecutive identical characters
        const repeatedPattern = /(.)\1{3,}/;
        return repeatedPattern.test(password);
    }

    /**
     * Get password strength score (0-100)
     * Useful for UI feedback
     */
    getStrengthScore(password: string): number {
        if (!password) return 0;

        let score = 0;

        // Length score (max 40 points)
        score += Math.min(password.length * 2, 40);

        // Complexity score (max 40 points)
        if (/[A-Z]/.test(password)) score += 10;
        if (/[a-z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;

        // Variety score (max 20 points)
        const uniqueChars = new Set(password).size;
        score += Math.min(uniqueChars * 2, 20);

        // Penalties
        if (this.COMMON_PASSWORDS.has(password.toLowerCase())) score -= 50;
        if (this.hasSequentialCharacters(password)) score -= 20;
        if (this.hasRepeatedCharacters(password)) score -= 20;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get user-friendly strength label
     */
    getStrengthLabel(score: number): string {
        if (score < 30) return 'Muy débil';
        if (score < 50) return 'Débil';
        if (score < 70) return 'Aceptable';
        if (score < 90) return 'Fuerte';
        return 'Muy fuerte';
    }
}
