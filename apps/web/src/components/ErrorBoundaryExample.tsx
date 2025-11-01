import React, { useState } from 'react';
import { AlertTriangle, Bug } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import AsyncErrorBoundary from './AsyncErrorBoundary';

// Test component that can throw errors
function BuggyComponent({ shouldCrash }: { shouldCrash: boolean }) {
  if (shouldCrash) {
    throw new Error('Intentional error for testing error boundary!');
  }
  
  return (
    <div className="p-4 bg-success/5 border border-success/30 rounded-md">
      <p className="text-success">✅ Component is working correctly!</p>
    </div>
  );
}

// Test component that can throw async errors
function AsyncBuggyComponent({ shouldFail }: { shouldFail: boolean }) {
  React.useEffect(() => {
    if (shouldFail) {
      // Simulate async error
      setTimeout(() => {
        throw new Error('Async error for testing!');
      }, 100);
    }
  }, [shouldFail]);
  
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <p className="text-blue-800">🔄 Async component loaded successfully!</p>
    </div>
  );
}

// Example component demonstrating error boundaries
export default function ErrorBoundaryExample() {
  const [crashComponent, setCrashComponent] = useState(false);
  const [crashAsync, setCrashAsync] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Error Boundary Demo
        </h1>
        <p className="text-muted-foreground">
          Demostración de cómo los Error Boundaries manejan errores en componentes
        </p>
      </div>

      {/* Component Error Boundary Example */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Component Error Boundary
        </h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setCrashComponent(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !crashComponent 
                ? 'bg-success text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Normal State
          </button>
          <button
            onClick={() => setCrashComponent(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              crashComponent 
                ? 'bg-destructive text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Trigger Error
          </button>
        </div>

        <ErrorBoundary level="component" name="Demo Component">
          <BuggyComponent shouldCrash={crashComponent} />
        </ErrorBoundary>
      </div>

      {/* Async Error Boundary Example */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Async Error Boundary
        </h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setCrashAsync(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !crashAsync 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Normal Async
          </button>
          <button
            onClick={() => setCrashAsync(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              crashAsync 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Trigger Async Error
          </button>
        </div>

        <AsyncErrorBoundary>
          <AsyncBuggyComponent shouldFail={crashAsync} />
        </AsyncErrorBoundary>
      </div>

      {/* Information */}
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-base font-semibold text-foreground mb-3">
          Cómo funciona:
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• <strong>Component Error Boundary:</strong> Captura errores de renderizado y componentes</li>
          <li>• <strong>Async Error Boundary:</strong> Maneja errores asíncronos y de red</li>
          <li>• <strong>Route Error Boundary:</strong> Protege rutas individuales</li>
          <li>• <strong>Critical Error Boundary:</strong> Captura errores a nivel de aplicación</li>
          <li>• Los errores se reportan automáticamente en producción</li>
          <li>• Cada boundary tiene opciones de recuperación apropiadas</li>
        </ul>
      </div>
    </div>
  );
}