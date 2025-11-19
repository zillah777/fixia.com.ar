// prepare.cjs - Script para instalar husky solo en desarrollo
const { execSync } = require('child_process');

// Solo ejecutar si no estamos en CI y husky está instalado
if (!process.env.CI) {
    try {
        // Verificar si husky está instalado
        require.resolve('husky');
        execSync('husky install', { stdio: 'inherit' });
        console.log('✓ Husky hooks installed');
    } catch (error) {
        // Husky no está instalado, ignorar silenciosamente
        console.log('ℹ Husky not found, skipping git hooks installation');
    }
}
