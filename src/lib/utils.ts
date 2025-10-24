import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Simple toast implementation
let toastContainer: HTMLDivElement | null = null;

function createToastContainer() {
    if (toastContainer) return toastContainer;

    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
    return toastContainer;
}

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const container = createToastContainer();

    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white'
    };

    toast.className = `px-4 py-2 rounded-md shadow-lg ${colors[type]} animate-slide-in`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) {
            container.remove();
            toastContainer = null;
        }
    }, 3000);
}

export const toast = {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info')
};