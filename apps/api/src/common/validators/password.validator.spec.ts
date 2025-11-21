import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PasswordValidator } from '../common/validators/password.validator';

describe('PasswordValidator - Security Tests', () => {
    let validator: PasswordValidator;

    beforeEach(() => {
        validator = new PasswordValidator();
    });

    describe('Length Validation', () => {
        it('should reject passwords shorter than 12 characters', () => {
            expect(() => {
                validator.validate('Short1!');
            }).toThrow('La contraseña debe tener al menos 12 caracteres');
        });

        it('should accept passwords with exactly 12 characters', () => {
            expect(() => {
                validator.validate('MySecure1!Ab');
            }).not.toThrow();
        });

        it('should accept passwords longer than 12 characters', () => {
            expect(() => {
                validator.validate('MyVerySecureP@ssw0rd2024');
            }).not.toThrow();
        });
    });

    describe('Complexity Requirements', () => {
        it('should reject password without uppercase letters', () => {
            expect(() => {
                validator.validate('mysecurep@ssw0rd');
            }).toThrow('debe contener al menos: una letra mayúscula');
        });

        it('should reject password without lowercase letters', () => {
            expect(() => {
                validator.validate('MYSECUREP@SSW0RD');
            }).toThrow('debe contener al menos: una letra minúscula');
        });

        it('should reject password without numbers', () => {
            expect(() => {
                validator.validate('MySecureP@ssword');
            }).toThrow('debe contener al menos: un número');
        });

        it('should reject password without special characters', () => {
            expect(() => {
                validator.validate('MySecurePassw0rd');
            }).toThrow('debe contener al menos: un carácter especial');
        });

        it('should accept password with all requirements', () => {
            expect(() => {
                validator.validate('MySecureP@ssw0rd2024');
            }).not.toThrow();
        });
    });

    describe('Common Password Prevention', () => {
        it('should reject common password "password"', () => {
            expect(() => {
                validator.validate('Password123!');
            }).toThrow('Esta contraseña es demasiado común');
        });

        it('should reject common password "123456"', () => {
            expect(() => {
                validator.validate('MyPass123456!');
            }).toThrow('Esta contraseña es demasiado común');
        });

        it('should reject common password "qwerty"', () => {
            expect(() => {
                validator.validate('Qwerty123456!');
            }).toThrow('Esta contraseña es demasiado común');
        });

        it('should accept unique strong password', () => {
            expect(() => {
                validator.validate('Fixia2024Secure!');
            }).not.toThrow();
        });
    });

    describe('Sequential Characters Detection', () => {
        it('should reject password with sequential numbers', () => {
            expect(() => {
                validator.validate('MyPass123456!');
            }).toThrow('no debe contener secuencias obvias');
        });

        it('should reject password with sequential letters', () => {
            expect(() => {
                validator.validate('MyAbcdef123!');
            }).toThrow('no debe contener secuencias obvias');
        });

        it('should reject password with keyboard sequence', () => {
            expect(() => {
                validator.validate('MyQwerty123!');
            }).toThrow('no debe contener secuencias obvias');
        });

        it('should accept password without sequences', () => {
            expect(() => {
                validator.validate('Fixia2024Secure!');
            }).not.toThrow();
        });
    });

    describe('Repeated Characters Detection', () => {
        it('should reject password with 4+ repeated characters', () => {
            expect(() => {
                validator.validate('MyPassaaaa123!');
            }).toThrow('no debe contener demasiados caracteres repetidos');
        });

        it('should reject password with repeated numbers', () => {
            expect(() => {
                validator.validate('MyPass1111!Abc');
            }).toThrow('no debe contener demasiados caracteres repetidos');
        });

        it('should accept password with 3 or fewer repeated characters', () => {
            expect(() => {
                validator.validate('MyPassaaa123!');
            }).not.toThrow();
        });
    });

    describe('Password Strength Scoring', () => {
        it('should give low score to weak password', () => {
            const score = validator.getStrengthScore('weak');
            expect(score).toBeLessThan(30);
            expect(validator.getStrengthLabel(score)).toBe('Muy débil');
        });

        it('should give medium score to acceptable password', () => {
            const score = validator.getStrengthScore('MySecure1!');
            expect(score).toBeGreaterThanOrEqual(50);
            expect(score).toBeLessThan(70);
        });

        it('should give high score to strong password', () => {
            const score = validator.getStrengthScore('MyVerySecureP@ssw0rd2024');
            expect(score).toBeGreaterThanOrEqual(70);
            expect(validator.getStrengthLabel(score)).toMatch(/Fuerte|Muy fuerte/);
        });

        it('should penalize common passwords in scoring', () => {
            const commonScore = validator.getStrengthScore('Password123!');
            const uniqueScore = validator.getStrengthScore('Fixia2024Secure!');

            expect(commonScore).toBeLessThan(uniqueScore);
        });
    });

    describe('Real-world Password Examples', () => {
        const validPasswords = [
            'Fixia2024Secure!',
            'MyApp#2024Strong',
            'Pr0f3ss!0n@l2024',
            'S3cur3P@ssw0rd!',
        ];

        const invalidPasswords = [
            { pwd: 'short', reason: 'too short' },
            { pwd: 'alllowercase123!', reason: 'no uppercase' },
            { pwd: 'ALLUPPERCASE123!', reason: 'no lowercase' },
            { pwd: 'NoNumbers!Here', reason: 'no numbers' },
            { pwd: 'NoSpecialChars123', reason: 'no special chars' },
            { pwd: 'Password123!', reason: 'common password' },
            { pwd: 'MyPass123456!', reason: 'sequential numbers' },
            { pwd: 'MyPassaaaa123!', reason: 'repeated characters' },
        ];

        validPasswords.forEach((password) => {
            it(`should accept valid password: ${password}`, () => {
                expect(() => {
                    validator.validate(password);
                }).not.toThrow();
            });
        });

        invalidPasswords.forEach(({ pwd, reason }) => {
            it(`should reject invalid password (${reason}): ${pwd}`, () => {
                expect(() => {
                    validator.validate(pwd);
                }).toThrow(BadRequestException);
            });
        });
    });
});
